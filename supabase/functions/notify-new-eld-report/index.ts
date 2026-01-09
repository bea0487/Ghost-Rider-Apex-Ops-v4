// Supabase Edge Function: notify-new-eld-report
// This function is intended to be called by a Database Webhook on INSERT into public.eld_reports.
// It looks up the client email and sends an email using your provider.
//
// Requires:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// - EMAIL_PROVIDER_API_KEY (implementation placeholder)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server misconfigured' }, 500)

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // Database webhook payload varies; we expect something like { record: { client_id, week_start, ... } }
  const body = await req.json().catch(() => null) as any
  const record = body?.record
  if (!record?.client_id) return json({ error: 'Missing record.client_id' }, 400)

  // Find client -> user_id
  const { data: client, error: clientErr } = await admin
    .from('clients')
    .select('user_id, client_id, company_name')
    .eq('id', record.client_id)
    .single()

  if (clientErr) return json({ error: clientErr.message }, 400)

  // Lookup email
  const { data: userData, error: userErr } = await admin.auth.admin.getUserById(client.user_id)
  if (userErr) return json({ error: userErr.message }, 400)

  const email = userData?.user?.email
  if (!email) return json({ error: 'Client email not found' }, 400)

  // TODO: Send email via your provider (Resend/SendGrid/etc.).
  // Keep service keys ONLY in Edge Function env vars.

  return json({ ok: true, emailed: email })
})
