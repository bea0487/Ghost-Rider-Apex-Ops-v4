import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { email, tier, company_name, client_id } = req.body;

  if (!email || !tier) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const { data: user, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { tier, role: 'client' }
    });
    if (inviteError) throw inviteError;

    const { error: dbError } = await supabaseAdmin.from('clients').insert({
      user_id: user.id,
      email,
      tier,
      company_name: company_name || null,
      client_id: client_id || null
    });
    if (dbError) throw dbError;

    return res.status(200).json({ success: true, userId: user.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Failed to create client' });
  }
}