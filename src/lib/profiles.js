import { supabase } from './supabaseClient'

export async function fetchMyClientProfile() {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr

  const userId = userData?.user?.id
  if (!userId) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('clients')
    .select('id, client_id, company_name, tier, user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('No client profile found for this user yet.')
  return data
}
