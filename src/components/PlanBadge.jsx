'use client'

import { Crown } from 'lucide-react'

export default function PlanBadge({ plan = 'free' }) {
  if (plan === 'pro') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-brand-accent to-emerald-400 text-zinc-950 text-[10px] font-bold uppercase shadow-[0_0_15px_rgba(3,218,198,0.3)]">
        <Crown size={12} className="mr-1" strokeWidth={3} /> Pro
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full glass-subtle text-zinc-500 text-[10px] font-semibold tracking-wider uppercase">
      Free
    </span>
  )
}
