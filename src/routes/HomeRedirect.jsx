import React from 'react'
import { Navigate } from 'react-router-dom'
import Shell from '../components/Shell'
import { fetchMyClientProfile } from '../lib/profiles'

export default function HomeRedirect() {
  const [loading, setLoading] = React.useState(true)
  const [tier, setTier] = React.useState(null)

  React.useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const profile = await fetchMyClientProfile()
        if (!mounted) return
        setTier(profile.tier)
      } catch (_e) {
        if (!mounted) return
        setTier(null)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <Shell title="Loading" subtitle="Ghost Rider: Apex Operations">Loading…</Shell>
  }

  if (tier === 'apex_command') return <Navigate to="/admin" replace />
  return <Navigate to="/app" replace />
}
