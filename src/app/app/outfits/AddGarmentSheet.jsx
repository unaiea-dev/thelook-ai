'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, Plus } from 'lucide-react'

export default function AddGarmentSheet({ isOpen, onClose, currentGarmentIds, garments, onAdd }) {
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

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

  // Garments that are not currently in the outfit
  const availableGarments = garments.filter(g => !currentGarmentIds.includes(g.id))

  // Find unique categories available in the wardrobe
  const categories = ['all', ...new Set(availableGarments.map(g => g.category))]

  // Filter based on category selection
  const filteredGarments = activeCategory === 'all'
    ? availableGarments
    : availableGarments.filter(g => g.category === activeCategory)

  const content = (
    <div 
      className={`fixed inset-0 z-[100] flex items-end justify-center max-w-[480px] mx-auto transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`relative w-full bg-[#16161a] border-t border-white/10 pb-8 pt-4 px-5 z-10 transition-transform duration-300 ease-out transform shadow-[0_-8px_30px_rgba(0,0,0,0.5)] rounded-t-[32px] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Top Handle */}
        <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto mb-5 cursor-pointer hover:bg-zinc-600 transition-colors" onClick={onClose} />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Afegeix una peça
            </h3>
            <p className="text-xs text-zinc-300 font-medium mt-0.5">
              Completa el teu outfit amb roba del teu armari
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar snap-x mb-4" style={{ overscrollBehaviorX: 'contain' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-white text-zinc-950 shadow-md border border-white' 
                  : 'bg-white/5 text-zinc-200 border border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? 'Totes' : cat}
            </button>
          ))}
        </div>

        {/* Content list */}
        {filteredGarments.length === 0 ? (
          <div className="text-center py-12 bg-white/5 border border-white/5 rounded-2xl text-xs text-zinc-400">
            No hi ha peces de roba disponibles en aquesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3.5 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
            {filteredGarments.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  onAdd(g.id)
                  onClose()
                }}
                className="flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-brand-accent transition-all duration-300 active:scale-95 group text-left relative shadow-sm"
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
                  {/* Plus Icon Overlay indicator */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white border border-white/15">
                    <Plus size={11} />
                  </div>
                </div>
                <div className="p-2 flex flex-col justify-between flex-1 min-h-[42px] bg-white/[0.02]">
                  <span className="text-[10px] font-bold text-zinc-100 capitalize truncate leading-tight">
                    {g.category}
                  </span>
                  <span className="text-[9px] text-zinc-300 capitalize truncate mt-0.5">
                    {g.color} · {g.pattern || 'llis'}
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
