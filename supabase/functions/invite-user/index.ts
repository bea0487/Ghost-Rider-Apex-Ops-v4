// Supabase Edge Function: invite-user
// Securely invites a user and creates the linked public.clients row.
// Requires these env vars in the function environment:
// - GR_SUPABASE_URL
// - GR_SERVICE_ROLE_KEY
// - GR_SITE_URL (optional, used to build redirect base)
//
// Security notes:
// - This function requires the caller to be authenticated and to have app_metadata.role === 'admin'.
// - Service role key is used server-side only (never exposed to clients).
// - Keep GR_SERVICE_ROLE_KEY secret in the function environment.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = (() => {
  const site = Deno.env.get('GR_SITE_URL') || '*'
  return {
    'Access-Control-Allow-Origin': site,
    'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
})()

type Payload = {
  email: string
  tier: 'wingman' | 'guardian' | 'apex_command'
  client_id: string
  company_name?: string
}

function getRedirectTo(req: Request) {
  const siteUrl = Deno.env.get('GR_SITE_URL')
  const origin = req.headers.get('origin')
  const base = (origin || siteUrl || '').replace(/\/$/, '')
  if (!base) return undefined
  return `${base}/auth/callback`
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('GR_SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('GR_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Server misconfigured: missing GR_SUPABASE_URL or GR_SERVICE_ROLE_KEY')
    return json({ error: 'Server misconfigured' }, 500)
  }

  const authHeader = req.headers.get('Authorization') || ''
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!jwt) return json({ error: 'Missing bearer token' }, 401)

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // Verify caller & require app_metadata.role === 'admin'
  const { data: caller, error: callerErr } = await admin.auth.getUser(jwt)
  if (callerErr) {
    console.error('Failed to verify caller JWT', callerErr)
    return json({ error: callerErr.message || 'Unauthorized' }, 401)
  }
  const role = caller?.user?.app_metadata?.role
  if (role !== 'admin') {
    console.warn('Forbidden: caller role not admin', { role })
    return json({ error: 'Forbidden' }, 403)
  }

  // Parse and validate payload
  const payload = (await req.json().catch(() => null)) as Payload | null
  if (!payload?.email || !payload?.client_id || !payload?.tier) {
    return json({ error: 'Invalid payload (email, client_id, tier required)' }, 400)
  }

  const email = String(payload.email).trim().toLowerCase()
  const clientId = String(payload.client_id).trim()
  const tier = String(payload.tier).trim()
  const companyName = payload.company_name ? String(payload.company_name).trim() : null

  if (!email) return json({ error: 'Invalid email' }, 400)
  if (!clientId) return json({ error: 'Invalid client_id' }, 400)
  if (!['wingman', 'guardian', 'apex_command'].includes(tier)) {
    return json({ error: 'Invalid tier' }, 400)
  }

  try {
    // Invite user (Supabase-managed invite flow; sends password-setup/magic link)
    const redirectTo = getRedirectTo(req)
    const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    })
    if (inviteErr) {
      console.error('inviteUserByEmail error', inviteErr)
      return json({ error: inviteErr.message || 'Invite failed' }, 400)
    }

    const invitedUserId = inviteData?.user?.id
    if (!invitedUserId) {
      console.error('Invite did not return a user id', { inviteData })
      return json({ error: 'Invite failed' }, 500)
    }

    // Create linked client record in public.clients
    const { error: clientErr } = await admin.from('clients').insert({
      user_id: invitedUserId,
      email,
      client_id: clientId,
      company_name: companyName || null,
      tier,
    })

    if (clientErr) {
      console.error('Failed to insert client row; consider cleanup of invited user', clientErr)
      // Optionally: cleanup invited user via admin.auth.admin.deleteUser(invitedUserId)
      return json({ error: clientErr.message || 'Failed to create client record' }, 400)
    }

    return json({ ok: true, email, user_id: invitedUserId })
  } catch (e) {
    console.error('Unexpected error in invite-user', e)
    return json({ error: 'Unexpected server error' }, 500)
  }
})
