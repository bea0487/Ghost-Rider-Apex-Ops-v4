import React from 'react'
import { supabase } from '../../lib/supabaseClient'

const AuthContext = React.createContext({})

export function useAuth() {
  return React.useContext(AuthContext)
}

function normalizeTier(tier) {
  if (!tier) return null
  return String(tier).toLowerCase()
}

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null)
  const [client, setClient] = React.useState(null)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [authError, setAuthError] = React.useState(null)

  const fetchClientProfile = React.useCallback(async (email) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, email, client_id, company_name, tier')
        .eq('email', email)
        .maybeSingle()

      if (error) {
        setClient(null)
        return
      }

      setClient(data || null)
    } catch (_e) {
      setClient(null)
    }
  }, [])

  const refreshClientProfile = React.useCallback(async () => {
    if (!user?.email) return
    await fetchClientProfile(user.email)
  }, [fetchClientProfile, user?.email])

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    async function load() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!mounted) return

        if (error) {
          setAuthError(error.message)
          setLoading(false)
          return
        }

        const session = data?.session
        const u = session?.user || null
        setUser(u)
        setIsAdmin(Boolean(u?.app_metadata?.role === 'admin'))

        if (u?.email) {
          await fetchClientProfile(u.email)
        } else {
          setClient(null)
        }

        setLoading(false)
      } catch (e) {
        if (!mounted) return
        setAuthError(e?.message || 'Authentication error')
        setLoading(false)
      }
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const u = session?.user || null
      setUser(u)
      setAuthError(null)
      setIsAdmin(Boolean(u?.app_metadata?.role === 'admin'))

      if (u?.email) {
        await fetchClientProfile(u.email)
      } else {
        setClient(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [fetchClientProfile])

  async function signOut() {
    setUser(null)
    setClient(null)
    setAuthError(null)
    setLoading(false)
    try {
      await supabase.auth.signOut()
    } catch (_e) {
      // ignore
    }
  }

  async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    return { data, error }
  }

  const tier = normalizeTier(client?.tier)

  const value = {
    user,
    client,
    isAdmin,
    loading,
    authError,
    signOut,
    resetPassword,
    refreshClientProfile,
    isWingman: tier === 'wingman',
    isGuardian: tier === 'guardian',
    isApexCommand: tier === 'apex_command',
    hasTierAccess: (allowedTiers) => {
      const allowed = (allowedTiers || []).map(normalizeTier)
      if (!tier) return false
      return allowed.includes(tier)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
