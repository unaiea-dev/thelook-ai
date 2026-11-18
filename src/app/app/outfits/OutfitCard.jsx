'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Heart, Trash2, Edit3, X } from 'lucide-react'
import OutfitReveal from './OutfitReveal'
import { saveOutfit } from './outfit-actions' // We will add an update action or reuse save

export default function OutfitCard({ 
  outfit, 
  allGarments, 
  onDelete, 
  onToggleFavorite, 
  loadingId,
  onUpdateOutfit // Callback to notify list of changes
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [localOutfit, setLocalOutfit] = useState(outfit)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const garments = localOutfit.garments || []
  const heroGarment = garments[0]
  const subGarments = garments.slice(1, 4)

  const handleUpdateLocalResult = (updatedResult) => {
    setLocalOutfit(updatedResult)
    setEditSuccess(false)
  }

  const handleSaveEdit = async () => {
    setIsSavingEdit(true)
    try {
      // Call update route or action
      const response = await fetch('/api/update-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: outfit.id,
          garment_ids: localOutfit.garment_ids
        })
      })

      const data = await response.json()
      if (response.ok) {
        setEditSuccess(true)
        if (onUpdateOutfit) {
          onUpdateOutfit(outfit.id, {
            ...localOutfit,
            garments: localOutfit.garments
          })
        }
        setTimeout(() => {
          setIsEditing(false)
          setEditSuccess(false)
        }, 1000)
      } else {
        alert(data.error || 'Error al actualitzar outfit')
      }
    } catch (err) {
      alert('Error en la connexió')
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <>
      <div className="glass rounded-[22px] overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
        {/* Header bar */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[var(--theme-text-primary)]">{outfit.occasion}</span>
            <span className="text-[9px] text-[var(--theme-text-muted)] glass-subtle px-2 py-0.5 rounded-full capitalize">{outfit.weather}</span>
            {outfit.style && (
              <span className="text-[9px] text-brand-secondary glass-subtle px-2 py-0.5 rounded-full border border-brand-secondary/20 font-medium">
                {outfit.style}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg hover:bg-[var(--theme-hover)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all"
              title="Edita l'outfit"
            >
              <Edit3 size={13} />
            </button>
            <button 
              onClick={() => onToggleFavorite(outfit.id, outfit.is_favorite)}
              disabled={loadingId === outfit.id}
              className="p-2 rounded-lg hover:bg-[var(--theme-hover)] text-brand-primary transition-all"
            >
              {loadingId === outfit.id ? (
                <span className="w-3.5 h-3.5 animate-spin block border-2 border-current border-t-transparent rounded-full" />
              ) : outfit.is_favorite ? (
                <Heart size={14} fill="currentColor" />
              ) : (
                <Heart size={14} />
              )}
            </button>
            <button 
              onClick={() => onDelete(outfit.id)}
              disabled={loadingId === outfit.id}
              className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--theme-text-muted)] hover:text-red-400 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Visual Lookbook collage */}
        <div className="p-3.5 cursor-pointer" onClick={() => setIsEditing(true)}>
          {garments.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-[var(--theme-text-muted)] italic">
              Outfit buit
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-2.5">
              {/* Hero image */}
              {heroGarment && (
                <div className={`${subGarments.length > 0 ? 'col-span-8' : 'col-span-12'} aspect-[3/4] relative rounded-2xl overflow-hidden glass-subtle bg-zinc-950`}>
                  <Image 
                    src={heroGarment.image_url} 
                    alt="Peca principal" 
                    fill 
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 480px) 50vw"
                  />
                </div>
              )}

              {/* Sidebar images */}
              {subGarments.length > 0 && (
                <div className="col-span-4 flex flex-col gap-2">
                  {subGarments.map((g, index) => (
                    <div key={`${g.id}-${index}`} className="flex-1 aspect-square relative rounded-xl overflow-hidden glass-subtle bg-zinc-950 min-h-[50px]">
                      <Image 
                        src={g.image_url} 
                        alt="Peca secundaria" 
                        fill 
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 480px) 20vw"
                      />
                    </div>
                  ))}
                  {/* Plus marker if total exceeds 4 garments */}
                  {garments.length > 4 && (
                    <div className="h-6 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-[var(--theme-text-muted)]">
                      +{garments.length - 4} més
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Explanation preview (if available) */}
          {outfit.explanation && (
            <p className="mt-3 text-[11px] text-[var(--theme-text-secondary)] italic line-clamp-2 px-1">
              &ldquo;{outfit.explanation}&rdquo;
            </p>
          )}

          {/* Footer details */}
          <div className="mt-3.5 text-[9px] font-medium text-[var(--theme-text-muted)] flex justify-between items-center border-t border-[var(--theme-border)] pt-2.5 px-1">
            <span>{new Date(outfit.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
            <span>{garments.length} peces</span>
          </div>
        </div>
      </div>

      {/* EDITING INTERACTIVE MODAL */}
      {isEditing && mounted && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center max-w-[480px] mx-auto animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditing(false)} />
          
          <div className="relative w-full bg-[#16161a] border-t border-white/10 pb-8 pt-4 px-5 z-10 max-h-[85vh] overflow-y-auto hide-scrollbar animate-[slideUp_0.3s_cubic-bezier(0.2,0.8,0.2,1)] rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto mb-5 cursor-pointer hover:bg-zinc-600 transition-colors" onClick={() => setIsEditing(false)} />
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Modifica l&apos;outfit</h3>
                <p className="text-xs text-zinc-300 font-medium mt-0.5">Canvia o afegeix peces per personalitzar-lo al teu gust</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Interactive editing component */}
            <OutfitReveal 
              result={localOutfit}
              garments={allGarments}
              onUpdateResult={handleUpdateLocalResult}
              isLoading={false}
              isSaving={isSavingEdit}
              saveSuccess={editSuccess}
              handleSave={handleSaveEdit}
              handleGenerate={() => {}} // Disabled inside detail view
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
