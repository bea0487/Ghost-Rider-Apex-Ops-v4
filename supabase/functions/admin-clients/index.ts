// Supabase Edge Function: admin-clients
// Lists and creates client records using the service role key (bypasses RLS).
// Requires:
// - GR_SUPABASE_URL
// - GR_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Tier = 'wingman' | 'guardian' | 'apex_command'

type ListPayload = {
  action: 'list'
}

type CreatePayload = {
  action: 'create'
  email: string
  tier: Tier
  client_id?: string
  company_name?: string
}

type Payload = ListPayload | CreatePayload

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

  // Verify caller & require app_metadata.role === 'admin'
  const { data: caller, error: callerErr } = await admin.auth.getUser(jwt)
  if (callerErr) return json({ error: callerErr.message }, 401)
  const role = caller?.user?.app_metadata?.role
  if (role !== 'admin') return json({ error: 'Forbidden' }, 403)

  const payload = (await req.json().catch(() => null)) as Payload | null
  if (!payload?.action) return json({ error: 'Invalid payload' }, 400)

  if (payload.action === 'list') {
    const { data, error } = await admin
      .from('clients')
      .select('id, email, client_id, company_name, tier, created_at')
      .order('created_at', { ascending: false })

    if (error) return json({ error: error.message }, 400)
    return json({ clients: data || [] })
  }

  if (payload.action === 'create') {
    const normalizedEmail = String(payload.email || '').trim().toLowerCase()
    if (!normalizedEmail) return json({ error: 'Client Email is required' }, 400)
    if (!payload.tier) return json({ error: 'Tier is required' }, 400)

    const { error } = await admin.from('clients').insert({
      email: normalizedEmail,
      client_id: String(payload.client_id || '').trim() || null,
      company_name: String(payload.company_name || '').trim() || null,
      tier: payload.tier,
    })

    if (error) return json({ error: error.message }, 400)
    return json({ ok: true, email: normalizedEmail })
  }

  return json({ error: 'Invalid action' }, 400)
})
