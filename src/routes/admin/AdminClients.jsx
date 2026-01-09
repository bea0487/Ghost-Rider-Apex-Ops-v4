import React from 'react'
import { Search, Plus, Users2 } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import Input from '../../components/Input'

export default function AdminClients() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [tier, setTier] = React.useState('all')

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

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-8">
          <div className="mx-auto max-w-md text-center">
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
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="Add Client" widthClass="max-w-xl">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Client Email">
                <Input type="email" placeholder="client@company.com" />
              </Field>
              <Field label="Client ID">
                <Input placeholder="DOT / internal ID" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company Name">
                <Input placeholder="Company" />
              </Field>
              <Field label="Tier">
                <select className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-rajdhani text-white outline-none focus:border-fuchsia-500/40">
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
              <Button type="button" className="bg-fuchsia-600 hover:bg-fuchsia-500">
                Save Client
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
