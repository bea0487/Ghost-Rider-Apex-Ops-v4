// api/create-support-ticket.js
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const {
    client_id,
    subject,
    message,
    priority = 'Medium',
    status = 'Open'
  } = req.body

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        client_id,
        subject,
        message,
        priority,
        status
      })
      .select()
      .single()

    if (error) throw error

    // Optional: notify admin/support team
    if (process.env.ADMIN_EMAIL) {
      await resend.emails.send({
        from: 'Ghost Rider Support <noreply@yourdomain.com>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Support Ticket: ${subject}`,
        html: `
          <h3>New ticket from client</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
          <p><a href="https://ghost-rider-apex-ops-v4.vercel.app/admin/tickets">View in admin</a></p>
        `
      })
    }

    return res.status(200).json({ success: true, id: data.id })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Failed to create support ticket' })
  }
}