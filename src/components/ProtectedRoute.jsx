import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

/**
 * ProtectedRoute
 * - Ensures the user is authenticated.
 * - Optionally enforces a requiredRole ('admin', etc.). Pass a string or an array of allowed roles.
 *
 * Usage:
 * <ProtectedRoute> ... </ProtectedRoute>                // requires authentication
 * <ProtectedRoute requiredRole="admin"> ... </ProtectedRoute>  // requires auth + role === 'admin'
 *
 * Notes:
 * - This is a client-side gate to improve UX/navigation. All server-side checks (Edge Functions / RLS)
 *   still enforce authorization and must remain the source of truth.
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const location = useLocation()
  const [loading, setLoading] = React.useState(true)
  const [authorized, setAuthorized] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    let unsubscribe = null

    async function init() {
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) {
          setAuthorized(false)
          setLoading(false)
        }
        return
      }

      try {
        // Check session
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        if (!session) {
          if (mounted) {
            setAuthorized(false)
            setLoading(false)
          }
          return
        }

        if (!requiredRole) {
          if (mounted) {
            setAuthorized(true)
            setLoading(false)
          }
          return
        }

        // If a role is required, get user metadata
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          if (mounted) {
            setAuthorized(false)
            setLoading(false)
          }
          return
        }

        const role = userData.user.app_metadata?.role
        let allowed = false
        if (Array.isArray(requiredRole)) {
          allowed = requiredRole.includes(role)
        } else {
          allowed = role === requiredRole
        }

        if (mounted) {
          setAuthorized(Boolean(allowed))
          setLoading(false)
        }
      } catch (e) {
        if (mounted) {
          setAuthorized(false)
          setLoading(false)
        }
      }

      // Keep subscription so route reacts if auth state changes
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        if (!session) {
          setAuthorized(false)
          setLoading(false)
          return
        }

        if (!requiredRole) {
          setAuthorized(true)
          setLoading(false)
          return
        }

        // When auth state changes and a role is required, re-check user metadata
        supabase.auth.getUser().then(({ data: ud }) => {
          const role = ud?.user?.app_metadata?.role
          const allowed = Array.isArray(requiredRole) ? requiredRole.includes(role) : role === requiredRole
          setAuthorized(Boolean(allowed))
          setLoading(false)
        }).catch(() => {
          setAuthorized(false)
          setLoading(false)
        })
      })

      unsubscribe = sub?.subscription?.unsubscribe || (() => {})
    }

    init()

    return () => {
      mounted = false
      // cleanup subscription if present
      try { unsubscribe?.() } catch {}
    }
  }, [requiredRole])

  // Setup page redirection if Supabase not configured (keeps previous behavior)
  if (!isSupabaseConfigured) return <Navigate to="/setup" replace />

  if (loading) return null

  // If not authorized, redirect:
  // - If user is signed out, redirect to /login (ProtectedRoute was typically used for authenticated areas).
  // - If signed in but wrong role, redirect to client portal home (/app).
  if (!authorized) {
    // We can't easily distinguish signed-in vs signed-out here without another call; redirect to /app which
    // will surface sign-in requirement or client UI. For stricter behavior, you can detect session again.
    return <Navigate to="/app" state={{ from: location }} replace />
  }

  return children
}