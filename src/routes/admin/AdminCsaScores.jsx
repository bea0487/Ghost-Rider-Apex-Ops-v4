import React from 'react'
import { Shield, Plus } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

export default function AdminCsaScores() {
  const [open, setOpen] = React.useState(false)

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-white">CSA Score Reports</h1>
            <p className="text-gray-400 font-rajdhani">Apex Command clients only</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-fuchsia-600 hover:bg-fuchsia-500">
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Report
            </span>
          </Button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <Shield className="text-gray-400" size={24} />
            </div>
            <div className="font-rajdhani text-gray-500">No CSA reports yet</div>
          </div>
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="Add CSA Report" widthClass="max-w-xl">
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
