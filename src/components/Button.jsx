import React from 'react'

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={
        "inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 font-orbitron text-sm tracking-wide text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.15)] transition hover:bg-cyan-500/15 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.35)] disabled:cursor-not-allowed disabled:opacity-50 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  )
}
