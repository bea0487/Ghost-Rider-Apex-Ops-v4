// api/create-dataq-dispute.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const {
    client_id,
    report_number,
    violation_code,
    status = 'Open',
    details = ''
  } = req.body

  try {
    const { data, error } = await supabase
      .from('dataq_disputes')
      .insert({
        client_id,
        report_number,
        violation_code,
        status,
        details: details.trim() || null
      })
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ success: true, id: data.id })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Failed to create DataQ dispute' })
  }
}