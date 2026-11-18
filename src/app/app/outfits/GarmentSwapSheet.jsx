'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, Trash2 } from 'lucide-react'

export default function GarmentSwapSheet({ isOpen, onClose, currentGarment, garments, onSwap, onRemove }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  // Filter garments of same category/subcategory to offer as alternatives
  const alternatives = garments.filter(g => 
    g.category === currentGarment?.category && g.id !== currentGarment?.id
  )

  const content = (
    <div 
      className={`fixed inset-0 z-[100] flex items-end justify-center max-w-[480px] mx-auto transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div 
        className={`relative w-full bg-[#16161a] border-t border-white/10 pb-8 pt-4 px-5 z-10 transition-transform duration-300 ease-out transform shadow-[0_-8px_30px_rgba(0,0,0,0.5)] rounded-t-[32px] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* iOS style top handle */}
        <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto mb-5 cursor-pointer hover:bg-zinc-600 transition-colors" onClick={onClose} />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Canvia la peça
            </h3>
            <p className="text-xs text-zinc-300 capitalize font-medium mt-0.5">
              {currentGarment?.category} actual
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current garment summary */}
        {currentGarment && (
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-zinc-950">
              <Image 
                src={currentGarment.image_url} 
                alt={currentGarment.category} 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white tracking-wide">
                Peça seleccionada
              </p>
              <p className="text-[11px] text-zinc-300 capitalize truncate mt-0.5">
                {currentGarment.color} · {currentGarment.pattern || 'llis'}
              </p>
            </div>
            <button
              onClick={() => {
                onRemove(currentGarment.id)
                onClose()
              }}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold border border-red-500/20"
            >
              <Trash2 size={14} />
              <span>Treure</span>
            </button>
          </div>
        )}

        {/* Alternatives title */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5 pl-1">
          Alternatives disponibles ({alternatives.length})
        </h4>

        {/* Grid scrollable of alternative garments */}
        {alternatives.length === 0 ? (
          <div className="text-center py-10 bg-white/5 border border-white/5 rounded-2xl text-xs text-zinc-400">
            No hi ha cap altra peça de la categoria &quot;{currentGarment?.category}&quot; al teu armari.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3.5 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
            {alternatives.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  onSwap(currentGarment.id, g.id)
                  onClose()
                }}
                className="flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-brand-accent transition-all duration-300 active:scale-95 group text-left shadow-sm"
              >
                <div className="aspect-[3/4] relative w-full bg-zinc-950">
                  <Image 
                    src={g.image_url} 
                    alt={g.category} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 480px) 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                </div>
                <div className="p-2 flex flex-col justify-between flex-1 min-h-[42px] bg-white/[0.02]">
                  <span className="text-[10px] font-bold text-zinc-100 capitalize truncate leading-tight">
                    {g.color}
                  </span>
                  <span className="text-[9px] text-zinc-300 capitalize truncate mt-0.5">
                    {g.pattern || 'llis'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
