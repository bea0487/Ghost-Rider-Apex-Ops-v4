import { supabase } from './supabaseClient'

export async function fetchMyClientProfile() {
  const { data, error } = await supabase
    .from('clients')
    .select('id, client_id, company_name, tier, user_id')
    .single()

  if (error) throw error
  return data
}
