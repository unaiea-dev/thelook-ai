'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'


export default function AppError({ error, reset }) {
  useEffect(() => {
    console.error('App routing error:', error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center gap-5 px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mb-4 mx-auto">
        <AlertTriangle size={32} />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--theme-text-primary)] mb-1.5">Alguna cosa ha fallat</h2>
        <p className="text-[var(--theme-text-secondary)] text-xs max-w-[260px] mx-auto">
          No hem pogut carregar aquesta pàgina. Comprova la connexió i torna-ho a intentar.
        </p>
      </div>
      
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 glass hover:bg-[var(--theme-hover)] transition-all duration-300 rounded-xl font-semibold text-sm text-[var(--theme-text-primary)] flex items-center gap-2"
      >
        <RefreshCw size={14} className="mr-1" /> Tornar a intentar
      </button>
    </div>
  )
}
