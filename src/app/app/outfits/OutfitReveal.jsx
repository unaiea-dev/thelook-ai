'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Lightbulb, RefreshCw, Check, Plus, Edit2, RotateCw } from 'lucide-react'
import GarmentSwapSheet from './GarmentSwapSheet'
import AddGarmentSheet from './AddGarmentSheet'

export default function OutfitReveal({ 
  result, 
  garments, 
  onUpdateResult, 
  isLoading, 
  isSaving, 
  saveSuccess, 
  handleSave, 
  handleGenerate 
}) {
  const [activeSwapGarment, setActiveSwapGarment] = useState(null)
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [animateScore, setAnimateScore] = useState(0)

  // Animated match score counter
  useEffect(() => {
    if (result?.match_score && !result.isEdited) {
      setAnimateScore(0)
      const duration = 1000 // ms
      const end = result.match_score
      const stepTime = Math.abs(Math.floor(duration / end))
      
      const timer = setInterval(() => {
        setAnimateScore((prev) => {
          if (prev >= end) {
            clearInterval(timer)
            return end
          }
          return prev + 1
        })
      }, stepTime)
      
      return () => clearInterval(timer)
    }
  }, [result?.match_score, result?.isEdited])

  if (!result) return null

  const outfitGarments = result.garments || []

  // Swap handler
  const handleSwapGarment = (oldId, newId) => {
    const newGarments = outfitGarments.map(g => {
      if (g.id === oldId) {
        return garments.find(item => item.id === newId)
      }
      return g
    }).filter(Boolean)

    onUpdateResult({
      ...result,
      garment_ids: newGarments.map(g => g.id),
      garments: newGarments,
      isEdited: true // Mark as custom outfit
    })
  }

  // Remove handler
  const handleRemoveGarment = (id) => {
    const newGarments = outfitGarments.filter(g => g.id !== id)
    onUpdateResult({
      ...result,
      garment_ids: newGarments.map(g => g.id),
      garments: newGarments,
      isEdited: true
    })
  }

  // Add handler
  const handleAddGarment = (id) => {
    if (outfitGarments.length >= 5) return
    const newGarment = garments.find(g => g.id === id)
    if (!newGarment) return
    const newGarments = [...outfitGarments, newGarment]

    onUpdateResult({
      ...result,
      garment_ids: newGarments.map(g => g.id),
      garments: newGarments,
      isEdited: true
    })
  }

  return (
    <div className="mt-4 animate-[fadeInUp_0.4s_ease-out] relative z-10">
      {/* Title / Match Score Header */}
      <div className="flex items-center justify-between mb-4 border-t border-[var(--theme-border)] pt-5">
        <div>
          <h3 className="text-sm font-bold text-[var(--theme-text-primary)]">
            {result.isEdited ? 'El Teu Outfit Personalitzat' : 'Outfit Recomanat'}
          </h3>
          {result.isEdited && (
            <p className="text-[10px] text-brand-secondary font-medium mt-0.5">Editat manualment</p>
          )}
        </div>
        
        {!result.isEdited && result.match_score != null ? (
          <div className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase border border-brand-primary/20 animate-[scaleIn_0.3s_ease-out]">
            <Sparkles size={11} className="text-brand-accent animate-pulse" />
            Match {animateScore}%
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-brand-secondary/15 text-brand-secondary px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border border-brand-secondary/20">
            Outfit Propi ✨
          </div>
        )}
      </div>

      {/* LOOKBOOK ASYMMETRIC GRID LAYOUT */}
      <div className="relative mb-5">
        {outfitGarments.length === 0 ? (
          <div className="py-12 text-center glass rounded-2xl text-xs text-[var(--theme-text-muted)]">
            No has afegit cap peça encara.
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-3">
            {/* Left Big Column: Main Garment (Tops / Jacket / Dress) */}
            <div className={`${outfitGarments.length > 1 ? 'col-span-7' : 'col-span-12'} relative group`}>
              {outfitGarments[0] && (
                <div className="aspect-[3/4] relative rounded-3xl overflow-hidden glass border border-[var(--theme-border)] bg-zinc-950">
                  <Image 
                    src={outfitGarments[0].image_url} 
                    alt={outfitGarments[0].category} 
                    fill 
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 480px) 70vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Hover action button */}
                  <button 
                    onClick={() => setActiveSwapGarment(outfitGarments[0])}
                    className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-2xl border border-white/10 opacity-90 hover:opacity-100 active:scale-95 transition-all shadow-md flex items-center gap-1.5 text-[10px] font-semibold"
                  >
                    <Edit2 size={11} />
                    <span>Canvia</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Other garments in smaller grid */}
            {outfitGarments.length > 1 && (
              <div className="col-span-5 flex flex-col gap-3">
                {outfitGarments.slice(1, 4).map((garment, idx) => (
                  <div key={garment.id} className="relative group flex-1">
                    <div className="aspect-square relative rounded-2xl overflow-hidden glass border border-[var(--theme-border)] bg-zinc-950 h-full min-h-[90px]">
                      <Image 
                        src={garment.image_url} 
                        alt={garment.category} 
                        fill 
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 480px) 40vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      <button 
                        onClick={() => setActiveSwapGarment(garment)}
                        className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white p-2 rounded-xl border border-white/10 opacity-90 hover:opacity-100 active:scale-95 transition-all"
                      >
                        <Edit2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* 5th garment or Add Button */}
                {outfitGarments.length < 5 ? (
                  <button 
                    onClick={() => setIsAddSheetOpen(true)}
                    className="flex-1 flex flex-col items-center justify-center border border-dashed border-[var(--theme-border)] bg-[var(--theme-glass-bg)] hover:bg-[var(--theme-hover)] rounded-2xl min-h-[90px] transition-all duration-300 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                  >
                    <Plus size={18} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Afegeix</span>
                  </button>
                ) : (
                  outfitGarments[4] && (
                    <div className="relative group flex-1">
                      <div className="aspect-square relative rounded-2xl overflow-hidden glass border border-[var(--theme-border)] bg-zinc-950 h-full min-h-[90px]">
                        <Image 
                          src={outfitGarments[4].image_url} 
                          alt={outfitGarments[4].category} 
                          fill 
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 480px) 40vw"
                        />
                        <button 
                          onClick={() => setActiveSwapGarment(outfitGarments[4])}
                          className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white p-2 rounded-xl border border-white/10 opacity-90 hover:opacity-100 active:scale-95 transition-all"
                        >
                          <Edit2 size={10} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insights Section */}
      {!result.isEdited && (
        <div className="glass-subtle rounded-2xl p-4 mb-5 text-xs flex flex-col gap-3 animate-[fadeInUp_0.4s_ease-out_0.2s_both]">
          <p className="leading-relaxed text-[var(--theme-text-primary)]">
            <strong className="text-brand-primary font-bold mr-1">Per què funciona?</strong> 
            {result.explanation}
          </p>
          
          {result.color_harmony && (
            <div className="flex items-center gap-1.5 text-[var(--theme-text-secondary)]">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent inline-block"></span>
              <span>Harmonia: <span className="font-semibold text-[var(--theme-text-primary)]">{result.color_harmony}</span></span>
            </div>
          )}
          
          {result.style_tip && (
            <div className="bg-[var(--theme-glass-highlight)] p-3.5 rounded-xl flex items-start gap-2.5 border border-[var(--theme-glass-border)]">
              <Lightbulb size={16} className="text-yellow-500 shrink-0 mt-0.5" /> 
              <p className="italic text-[var(--theme-text-primary)] leading-relaxed">{result.style_tip}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm glass text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2" 
          onClick={handleGenerate}
          disabled={isLoading || isSaving}
        >
          {isLoading ? (
            <span className="w-4 h-4 css-spinner" />
          ) : (
            <>
              <RotateCw size={15} /> 
              <span>Una altra opció</span>
            </>
          )}
        </button>

        {saveSuccess ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-brand-accent font-semibold glass-subtle py-3.5 rounded-xl text-sm border border-brand-accent/20">
            <Check size={16} className="animate-[scaleIn_0.2s_ease-out]" /> 
            <span>Guardat!</span>
          </div>
        ) : (
          <button 
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2" 
            onClick={handleSave}
            disabled={isSaving || isLoading || outfitGarments.length === 0}
          >
            {isSaving ? (
              <><span className="w-4 h-4 css-spinner" /> Guardant...</>
            ) : (
              <span>Guardar Outfit</span>
            )}
          </button>
        )}
      </div>

      {/* SWAP SHEET */}
      <GarmentSwapSheet 
        isOpen={!!activeSwapGarment} 
        onClose={() => setActiveSwapGarment(null)}
        currentGarment={activeSwapGarment}
        garments={garments}
        onSwap={handleSwapGarment}
        onRemove={handleRemoveGarment}
      />

      {/* ADD SHEET */}
      <AddGarmentSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        currentGarmentIds={outfitGarments.map(g => g.id)}
        garments={garments}
        onAdd={handleAddGarment}
      />
    </div>
  )
}
