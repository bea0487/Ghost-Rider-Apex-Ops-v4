import React from 'react'
import { Search, Plus, Users2 } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'
import { supabase } from '../../lib/supabaseClient'

function withTimeout(promise, ms, label) {
  let t
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(t))
}

async function callEdgeFunction(path, body) {
  const base =
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : '')
  if (!base) throw new Error('Missing VITE_SUPABASE_URL (or VITE_SUPABASE_FUNCTIONS_URL override)')
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) throw new Error('Missing VITE_SUPABASE_ANON_KEY')

  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('No active session')

  const res = await fetch(`${base}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || 'Request failed')
  return json
}

export default function AdminClients() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [tier, setTier] = React.useState('all')

  const [clients, setClients] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [status, setStatus] = React.useState('')

  const [email, setEmail] = React.useState('')
  const [clientId, setClientId] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [newTier, setNewTier] = React.useState('wingman')

  async function loadClients() {
    if (!supabase) return
    setError('')
    setLoading(true)
    try {
      const result = await withTimeout(callEdgeFunction('admin-clients', { action: 'list' }), 15000, 'Load clients')
      setClients(Array.isArray(result?.clients) ? result.clients : [])
    } catch (e) {
      setError(e?.message || 'Unable to load clients')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setEmail('')
    setClientId('')
    setCompanyName('')
    setNewTier('wingman')
  }

  async function onSaveClient(e) {
    e.preventDefault()
    setError('')
    setStatus('')
    setSaving(true)

    try {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      if (!normalizedEmail) throw new Error('Client Email is required')

      const payload = {
        action: 'create',
        email: normalizedEmail,
        client_id: String(clientId || '').trim() || undefined,
        company_name: String(companyName || '').trim() || undefined,
        tier: newTier,
      }

      await withTimeout(callEdgeFunction('admin-clients', payload), 15000, 'Create client')

      setStatus(`Client created: ${normalizedEmail}`)
      setOpen(false)
      resetForm()
      await loadClients()
    } catch (e2) {
      setError(e2?.message || 'Unable to create client')
    } finally {
      setSaving(false)
    }
  }

  const q = String(query || '').trim().toLowerCase()
  const filtered = clients.filter((c) => {
    const matchesTier = tier === 'all' ? true : c.tier === tier
    if (!q) return matchesTier

    const hay = `${c.company_name || ''} ${c.email || ''} ${c.client_id || ''}`.toLowerCase()
    return matchesTier && hay.includes(q)
  })

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">Clients</h1>
            <p className="text-gray-400 font-rajdhani">Manage your client accounts</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-fuchsia-600 hover:bg-fuchsia-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Client
            </span>
          </Button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">{error}</div>
        ) : null}

        {status ? (
          <div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-3 font-rajdhani text-fuchsia-100">{status}</div>
        ) : null}

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, email, or DOT#..."
              className="w-full rounded-xl border border-white/10 bg-[#0d0d14] pl-10 pr-3 py-2 font-rajdhani text-white outline-none focus:border-fuchsia-500/40"
            />
          </div>

          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full md:w-44 rounded-xl border border-white/10 bg-[#0d0d14] px-3 py-2 font-rajdhani text-white outline-none focus:border-fuchsia-500/40"
          >
            <option value="all">All Tiers</option>
            <option value="wingman">Wingman</option>
            <option value="guardian">Guardian</option>
            <option value="apex_command">Apex Command</option>
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
          {loading ? (
            <div className="font-rajdhani text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-md text-center py-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Users2 className="text-gray-400" size={24} />
              </div>
              <div className="font-orbitron text-sm text-white">No Clients Found</div>
              <div className="mt-1 font-rajdhani text-gray-400">Add your first client to get started.</div>
              <div className="mt-4">
                <Button onClick={() => setOpen(true)} className="bg-fuchsia-600 hover:bg-fuchsia-500">
                  <span className="inline-flex items-center gap-2">
                    <Plus size={16} />
                    Add Your First Client
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="text-left text-xs font-orbitron tracking-wide text-white/70">
                    <th className="py-3 pr-4">Company</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Client ID</th>
                    <th className="py-3 pr-4">Tier</th>
                    <th className="py-3">UUID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((c) => (
                    <tr key={c.id} className="font-rajdhani text-sm text-white/80">
                      <td className="py-3 pr-4">{c.company_name || '—'}</td>
                      <td className="py-3 pr-4">{c.email}</td>
                      <td className="py-3 pr-4">{c.client_id || '—'}</td>
                      <td className="py-3 pr-4">{c.tier}</td>
                      <td className="py-3 font-mono text-xs text-white/60">{c.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          open={open}
          onClose={() => {
            setOpen(false)
            setError('')
            setStatus('')
          }}
          title="Add Client"
          widthClass="max-w-xl"
        >
          <form className="space-y-4" onSubmit={onSaveClient}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Client Email">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="client@company.com" required />
              </Field>
              <Field label="Client ID">
                <Input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="DOT / internal ID" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company Name">
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company" />
              </Field>
              <Field label="Tier">
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-rajdhani text-white outline-none focus:border-fuchsia-500/40"
                >
                  <option value="wingman">Wingman</option>
                  <option value="guardian">Guardian</option>
                  <option value="apex_command">Apex Command</option>
                </select>
              </Field>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" onClick={() => setOpen(false)} className="bg-white/5 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-fuchsia-600 hover:bg-fuchsia-500">
                {saving ? 'Saving…' : 'Save Client'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
