import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { client_id, week_start, violations = 0, corrective_actions, report_notes } = req.body;

  try {
    const { data: report, error: insertError } = await supabaseAdmin
      .from('eld_reports')
      .insert({
        client_id,
        week_start,
        violations,
        corrective_actions: violations > 0 ? corrective_actions : null,
        report_notes
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Optional: send email if action needed
    if (violations > 0) {
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('email')
        .eq('id', client_id)
        .single();

      if (client?.email) {
        await resend.emails.send({
          from: 'noreply@ghostriderapexops.com',
          to: client.email,
          subject: `Action Required: New ELD Report (${week_start})`,
          html: `
            <p>A new ELD report for week starting ${week_start} has ${violations} violation(s).</p>
            <p>Corrective actions: ${corrective_actions || 'None specified'}</p>
            <p><a href="https://ghost-rider-apex-ops-v4.vercel.app/login">Login to view</a></p>
          `
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}