// api/create-ifta-report.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const {
    client_id,
    quarter,           // e.g. "2025-Q4"
    miles_driven,
    fuel_used,
    jurisdiction_miles,
    notes = ''
  } = req.body

  try {
    const { data, error } = await supabase
      .from('ifta_records')  // adjust table name if different
      .insert({
        client_id,
        quarter,
        miles_driven,
        fuel_used,
        jurisdiction_miles,
        notes: notes.trim() || null
      })
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ success: true, id: data.id })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Failed to create IFTA report' })
  }
}