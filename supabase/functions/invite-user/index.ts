// Supabase Edge Function: invite-user
// Securely invites a user and creates the linked public.clients row.
// Requires:
// - GR_SUPABASE_URL
// - GR_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Payload = {
  email: string
  tier: 'wingman' | 'guardian' | 'apex_command'
  client_id: string
  company_name?: string
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
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server misconfigured' }, 500)

  const authHeader = req.headers.get('Authorization') || ''
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!jwt) return json({ error: 'Missing bearer token' }, 401)

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // Verify caller & require app_metadata.role === 'apex_command'
  const { data: caller, error: callerErr } = await admin.auth.getUser(jwt)
  if (callerErr) return json({ error: callerErr.message }, 401)
  const role = caller?.user?.app_metadata?.role
  if (role !== 'apex_command') return json({ error: 'Forbidden' }, 403)

  const payload = (await req.json().catch(() => null)) as Payload | null
  if (!payload?.email || !payload?.client_id || !payload?.tier) {
    return json({ error: 'Invalid payload' }, 400)
  }

  // Invite user (Supabase email flow for first-time password set)
  const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(payload.email)
  if (inviteErr) return json({ error: inviteErr.message }, 400)

  const invitedUserId = inviteData?.user?.id
  if (!invitedUserId) return json({ error: 'Invite failed' }, 500)

  // Create linked client record
  const { error: clientErr } = await admin.from('clients').insert({
    user_id: invitedUserId,
    client_id: payload.client_id,
    company_name: payload.company_name || null,
    tier: payload.tier,
  })

  if (clientErr) {
    // If client insert fails, you may want a cleanup strategy; we keep it simple and return error.
    return json({ error: clientErr.message }, 400)
  }

  return json({ email: payload.email, user_id: invitedUserId })
})
