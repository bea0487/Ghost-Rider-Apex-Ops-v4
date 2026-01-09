import React from 'react'

export default function Field({ label, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-orbitron text-xs tracking-wide text-white/80">{label}</div>
        {hint ? <div className="font-rajdhani text-xs text-white/50">{hint}</div> : null}
      </div>
      <div className="mt-2">{children}</div>
      {error ? (
        <div className="mt-1 font-rajdhani text-sm text-red-300">{error}</div>
      ) : null}
    </div>
  )
}
