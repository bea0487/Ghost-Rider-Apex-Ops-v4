import React from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../components/Shell'
import Field from '../components/Field'
import Input from '../components/Input'
import Button from '../components/Button'
import { signInWithPassword } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function withTimeout(fn, ms, timeoutMessage) {
    let timeoutId
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms)
      })
      return await Promise.race([fn(), timeoutPromise])
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await withTimeout(
        () => signInWithPassword({ email, password }),
        20000,
        'Sign-in timed out. Check Vercel env vars and Supabase status, then try again.',
      )

      const { data } = await withTimeout(
        () => supabase.auth.getSession(),
        8000,
        'Signed in, but session was not established. Disable strict privacy extensions and try again.',
      )

      if (!data?.session) {
        throw new Error('Signed in, but no session was stored. Disable strict privacy extensions and try again.')
      }

      navigate('/portal')
    } catch (err) {
      setError(err?.message || 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell
      title="Ghost Rider: Apex Operations"
      subtitle="Secure client portal"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="font-orbitron text-sm tracking-wide text-white/90">Access</div>
          <div className="mt-2 font-rajdhani text-white/60">
            Sign in with the account you received via invitation.
          </div>
          <img
            src="/images/hero-truck.png"
            alt=""
            className="mt-6 h-44 w-full rounded-xl object-cover opacity-90"
          />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@company.com" required />
          </Field>

          <Field label="Password">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
          </Field>

          {error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Authenticating…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </Shell>
  )
}
