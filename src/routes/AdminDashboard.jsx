import React from 'react'
import { supabase } from '../lib/supabaseClient'
import Shell from '../components/Shell'
import Button from '../components/Button'
import Field from '../components/Field'
import Input from '../components/Input'
import TextArea from '../components/TextArea'

async function callEdgeFunction(path, body) {
  const base =
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : '')
  if (!base) throw new Error('Missing VITE_SUPABASE_URL (or VITE_SUPABASE_FUNCTIONS_URL override)')

  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('No active session')

  const res = await fetch(`${base}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || 'Request failed')
  return json
}

export default function AdminDashboard() {
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteTier, setInviteTier] = React.useState('wingman')
  const [clientId, setClientId] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [error, setError] = React.useState('')

  const [reportClientUuid, setReportClientUuid] = React.useState('')
  const [weekStart, setWeekStart] = React.useState('')
  const [violations, setViolations] = React.useState(0)
  const [correctiveActions, setCorrectiveActions] = React.useState('')
  const [reportNotes, setReportNotes] = React.useState('')

  async function onSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function onInvite(e) {
    e.preventDefault()
    setError('')
    setStatus('')

    try {
      const result = await callEdgeFunction('invite-user', {
        email: inviteEmail,
        tier: inviteTier,
        client_id: clientId,
        company_name: companyName,
      })

      setStatus(`Invited: ${result.email}`)
      setInviteEmail('')
      setClientId('')
      setCompanyName('')
    } catch (e2) {
      setError(e2?.message || 'Invite failed')
    }
  }

  function validateReport() {
    const v = Number(violations)
    if (!reportClientUuid) return 'Client UUID is required'
    if (!weekStart) return 'Week Start is required'
    if (Number.isNaN(v) || v < 0) return 'Violations must be a non-negative number'
    if (v > 0 && !String(correctiveActions || '').trim()) {
      return 'Corrective Actions is required when Violations > 0'
    }
    return ''
  }

  async function onCreateEldReport(e) {
    e.preventDefault()
    setError('')
    setStatus('')

    const validation = validateReport()
    if (validation) {
      setError(validation)
      return
    }

    try {
      const { error: insertError } = await supabase.from('eld_reports').insert({
        client_id: reportClientUuid,
        week_start: weekStart,
        violations: Number(violations),
        corrective_actions: String(correctiveActions || '').trim() || null,
        report_notes: String(reportNotes || '').trim() || null,
      })
      if (insertError) throw insertError

      setStatus('ELD report created')
      setWeekStart('')
      setViolations(0)
      setCorrectiveActions('')
      setReportNotes('')
    } catch (e2) {
      setError(e2?.message || 'Failed to create report')
    }
  }

  return (
    <Shell
      title="Admin Dashboard"
      subtitle="Apex Command"
      right={<Button onClick={onSignOut}>Sign Out</Button>}
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 font-rajdhani text-red-200">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-3 font-rajdhani text-cyan-100">
          {status}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="font-orbitron text-sm tracking-wide text-white/90">Invite Client</div>
          <div className="mt-1 font-rajdhani text-white/60">
            Creates the user via secure Edge Function and creates the linked client record.
          </div>

          <form onSubmit={onInvite} className="mt-4 space-y-4">
            <Field label="Client Email">
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" required />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Client ID" hint="Operational identifier">
                <Input value={clientId} onChange={(e) => setClientId(e.target.value)} required />
              </Field>
              <Field label="Tier">
                <select
                  value={inviteTier}
                  onChange={(e) => setInviteTier(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-rajdhani text-white outline-none focus:border-cyan-400/40"
                >
                  <option value="wingman">Wingman</option>
                  <option value="guardian">Guardian</option>
                  <option value="apex_command">Apex Command</option>
                </select>
              </Field>
            </div>

            <Field label="Company Name">
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </Field>

            <Button type="submit" className="w-full">Invite</Button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="font-orbitron text-sm tracking-wide text-white/90">Create Weekly ELD Report</div>
          <div className="mt-1 font-rajdhani text-white/60">
            Conditional validation: Corrective Actions is required when Violations &gt; 0.
          </div>

          <form onSubmit={onCreateEldReport} className="mt-4 space-y-4">
            <Field label="Client UUID" hint="public.clients.id">
              <Input value={reportClientUuid} onChange={(e) => setReportClientUuid(e.target.value)} required />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Week Start">
                <Input value={weekStart} onChange={(e) => setWeekStart(e.target.value)} type="date" required />
              </Field>
              <Field label="Violations">
                <Input value={violations} onChange={(e) => setViolations(e.target.value)} type="number" min="0" />
              </Field>
            </div>

            <Field label="Corrective Actions" hint={Number(violations) > 0 ? 'Required' : 'Optional'}>
              <TextArea value={correctiveActions} onChange={(e) => setCorrectiveActions(e.target.value)} placeholder="Describe corrective actions…" />
            </Field>

            <Field label="Report Notes">
              <TextArea value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} placeholder="Optional notes…" />
            </Field>

            <Button type="submit" className="w-full">Create Report</Button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <img src="/images/apex-truck.png" alt="" className="h-40 w-full rounded-2xl object-cover opacity-90" />
        <img src="/images/guardian-truck.png" alt="" className="h-40 w-full rounded-2xl object-cover opacity-90" />
        <img src="/images/wingman-cab.png" alt="" className="h-40 w-full rounded-2xl object-cover opacity-90" />
      </div>
    </Shell>
  )
}
