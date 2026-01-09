import React from 'react'
import { HelpCircle, Plus } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

const tabs = ['Active', 'All', 'Open', 'In Progress', 'Waiting on Client', 'Resolved', 'Closed']

export default function AdminTickets() {
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState('Active')

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">Support Tickets</h1>
            <p className="text-gray-400 font-rajdhani">0 open ticket(s)</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-fuchsia-600 hover:bg-fuchsia-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Ticket
            </span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={`rounded-xl border px-3 py-1.5 font-rajdhani text-sm transition-colors ${
                active === t
                  ? 'border-fuchsia-500/40 bg-fuchsia-500/20 text-fuchsia-300'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <HelpCircle className="text-gray-400" size={24} />
            </div>
            <div className="font-rajdhani text-gray-500">No tickets found</div>
          </div>
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="Add Support Ticket" widthClass="max-w-xl">
          <div className="font-rajdhani text-gray-400">Coming soon (UI modal stub).</div>
          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" onClick={() => setOpen(false)} className="bg-white/5 hover:bg-white/10">
              Close
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}
