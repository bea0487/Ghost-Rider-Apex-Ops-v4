// Supabase Edge Function: notify-new-eld-report
// Called by a Database Webhook on INSERT into public.eld_reports.
// - Only sends email when violations > 0
// - Prevents duplicate sends by checking/storing eld_reports.notified
// - Uses GR_* env vars and RESEND_API_KEY (kept secret in function env)
// Requires:
// - GR_SUPABASE_URL
// - GR_SERVICE_ROLE_KEY
// - RESEND_API_KEY
// - GR_SITE_URL (optional, used for "from" address hostname)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const DEFAULT_FROM_DOMAIN = 'example.com'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

function corsHeaders() {
  const site = Deno.env.get('GR_SITE_URL') || '*'
  return {
    'Access-Control-Allow-Origin': site,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('GR_SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('GR_SERVICE_ROLE_KEY')
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const siteUrl = (Deno.env.get('GR_SITE_URL') || '').replace(/\/$/, '')

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing GR_SUPABASE_URL or GR_SERVICE_ROLE_KEY')
    return json({ error: 'Server misconfigured (supabase envs missing)' }, 500)
  }
  if (!resendKey) {
    console.error('Missing RESEND_API_KEY')
    return json({ error: 'Server misconfigured (RESEND_API_KEY missing)' }, 500)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // Expect DB webhook payload: { record: { id, client_id, week_start, violations, ... } }
  let body: any = null
  try {
    body = await req.json().catch(() => null)
  } catch (e) {
    console.error('Invalid JSON payload', e)
    return json({ error: 'Invalid JSON payload' }, 400)
  }

  const record = body?.record
  if (!record?.client_id || !record?.id) {
    return json({ error: 'Missing record.client_id or record.id' }, 400)
  }

  const violations = Number(record.violations || 0)
  if (violations <= 0) {
    // nothing to notify
    return json({ ok: true, reason: 'No violations' })
  }

  // Re-check the row in DB for notified flag (avoid relying solely on webhook payload)
  try {
    const { data: currentRow, error: currentErr } = await admin
      .from('eld_reports')
      .select('id, notified, client_id, week_start, violations')
      .eq('id', record.id)
      .maybeSingle()

    if (currentErr) {
      console.error('Failed to fetch eld_reports row', currentErr)
      // continue — attempt to proceed but be conservative
    } else {
      if (currentRow?.notified === true) {
        return json({ ok: true, reason: 'Already notified' })
      }
    }
  } catch (e) {
    console.error('Error checking existing row', e)
    // proceed; we'll still attempt to send but be aware of possible duplicates
  }

  // Lookup client -> user_id -> email
  try {
    const { data: client, error: clientErr } = await admin
      .from('clients')
      .select('user_id, client_id, company_name')
      .eq('id', record.client_id)
      .single()

    if (clientErr) {
      console.error('Failed to lookup client', clientErr)
      return json({ error: 'Failed to lookup client' }, 400)
    }
    if (!client?.user_id) {
      console.error('Client has no user_id', client)
      return json({ error: 'Client user not found' }, 400)
    }

    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(client.user_id)
    if (userErr) {
      console.error('Failed to lookup user', userErr)
      return json({ error: 'Failed to lookup user' }, 400)
    }

    const email = userData?.user?.email
    if (!email) {
      console.error('User has no email', userData)
      return json({ error: 'Client email not found' }, 400)
    }

    // Construct email content
    const subject = `ELD report: ${violations} violation(s) for week ${record.week_start}`
    const text = `Hello ${client.company_name || client.client_id || ''},\n\nWe detected ${violations} ELD violation(s) for the week starting ${record.week_start}.\nPlease review the ELD report in your portal and take corrective action.\n\nThank you,\nGhost Rider Apex Operations`

    const fromDomain = (siteUrl && (() => {
      try { return new URL(siteUrl).hostname } catch { return DEFAULT_FROM_DOMAIN }
    })()) || DEFAULT_FROM_DOMAIN

    // Send via Resend
    const sendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: `no-reply@${fromDomain}`,
        to: email,
        subject,
        text,
        // optional: add html if you want
        // html: `<p>...</p>`
      }),
    }).catch((e) => {
      console.error('Resend request failed', e)
      return null
    })

    if (!sendResp) {
      return json({ error: 'Failed to send email (request error)' }, 502)
    }

    if (!sendResp.ok) {
      const bodyText = await sendResp.text().catch(() => '')
      console.error('Resend responded with non-ok', sendResp.status, bodyText)
      return json({ error: 'Failed to send email', detail: bodyText || sendResp.statusText }, 502)
    }

    // Mark eld_report as notified = true (best-effort)
    try {
      const { error: updateErr } = await admin
        .from('eld_reports')
        .update({ notified: true })
        .eq('id', record.id)

      if (updateErr) {
        console.error('Failed to mark eld_reports.notified', updateErr)
        return json({ ok: true, emailed: email, warning: 'Email sent but failed to mark notified flag' })
      }
    } catch (e) {
      console.error('Error updating notified flag', e)
      return json({ ok: true, emailed: email, warning: 'Email sent but error updating notified flag' })
    }

    return json({ ok: true, emailed: email })
  } catch (e) {
    console.error('Unexpected error in notify-new-eld-report', e)
    return json({ error: 'Unexpected server error' }, 500)
  }
})