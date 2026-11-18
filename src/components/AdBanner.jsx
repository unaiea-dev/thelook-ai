'use client'


import Link from 'next/link'
import { Megaphone } from 'lucide-react'

export default function AdBanner({ show = false }) {
  if (!show) return null

  return (
    <div className="w-full glass rounded-2xl p-4 relative overflow-hidden">
      {/* Etiqueta d'Anunci */}
      <div className="absolute top-0 right-0 bg-[var(--theme-glass-bg)] px-2 py-0.5 rounded-bl-lg text-[9px] text-[var(--theme-text-muted)] font-medium uppercase tracking-wider">
        Ad
      </div>
      
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-9 h-9 rounded-full glass-subtle flex items-center justify-center text-[var(--theme-text-muted)]">
          <Megaphone size={16} />
        </div>
        <div>
          <h4 className="text-[var(--theme-text-secondary)] font-medium text-xs">Espai d'Anunci</h4>
          <p className="text-[var(--theme-text-muted)] text-[10px] mt-0.5">Elimina'ls fent-te Pro</p>
        </div>
        
        <Link 
          href="/pricing"
          className="text-brand-accent text-[10px] font-semibold glass-subtle hover:bg-[var(--theme-hover)] px-3 py-1 rounded-full transition-all duration-300"
        >
          Treu els anuncis
        </Link>
      </div>
    </div>
  )
}
