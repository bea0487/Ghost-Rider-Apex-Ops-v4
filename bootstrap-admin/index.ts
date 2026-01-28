// Supabase Edge Function: bootstrap-admin
// Promotes the caller's user to admin by setting app_metadata.role = 'apex_command'.
// Use once: protect with BOOTSTRAP_ADMIN_SECRET.
// Requires:
// - GR_SUPABASE_URL
// - GR_SERVICE_ROLE_KEY
// - BOOTSTRAP_ADMIN_SECRET

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('GR_SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('GR_SERVICE_ROLE_KEY')
  const bootstrapSecret = Deno.env.get('BOOTSTRAP_ADMIN_SECRET')
  if (!supabaseUrl || !serviceRoleKey || !bootstrapSecret) return json({ error: 'Server misconfigured' }, 500)

  const authHeader = req.headers.get('Authorization') || ''
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!jwt) return json({ error: 'Missing bearer token' }, 401)

  const provided = req.headers.get('x-bootstrap-secret') || ''
  if (provided !== bootstrapSecret) return json({ error: 'Forbidden' }, 403)

  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { data: caller, error: callerErr } = await admin.auth.getUser(jwt)
  if (callerErr) return json({ error: callerErr.message }, 401)

  const callerId = caller?.user?.id
  if (!callerId) return json({ error: 'No caller' }, 401)

  const currentRole = caller?.user?.app_metadata?.role
  if (currentRole === 'apex_command') {
    return json({ ok: true, user_id: callerId, role: 'apex_command', already: true })
  }

  const { error: updateErr } = await admin.auth.admin.updateUserById(callerId, {
    app_metadata: {
      ...(caller?.user?.app_metadata || {}),
      role: 'admin'
    },
  })

  if (updateErr) return json({ error: updateErr.message }, 400)

  return json({ ok: true, user_id: callerId, role: 'apex_command' })
})
