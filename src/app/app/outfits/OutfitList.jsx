'use client'

import { useState, useEffect } from 'react'
import { WandSparkles } from 'lucide-react'
import { toggleFavorite, deleteOutfit } from './outfit-actions'
import OutfitCard from './OutfitCard'

import useAppStore from '@/store/useAppStore'

import { OCCASIONS } from './constants'

const FILTER_OCCASIONS = ['Totes', ...OCCASIONS]

export default function OutfitList({ initialOutfits, allGarments }) {
  const toggleStoreFavorite = useAppStore(s => s.toggleOutfitFavorite)
  const removeStoreOutfit = useAppStore(s => s.removeOutfit)
  const [outfits, setOutfits] = useState(initialOutfits)

  useEffect(() => {
    setOutfits(initialOutfits)
  }, [initialOutfits])
  const [activeFilter, setActiveFilter] = useState('Totes')
  const [loadingId, setLoadingId] = useState(null)

  const filteredOutfits = activeFilter === 'Totes' 
    ? outfits 
    : outfits.filter(o => o.occasion === activeFilter)

  const handleToggleFavorite = async (id, currentStatus) => {
    setLoadingId(id)
    // Optimistic
    toggleStoreFavorite(id)
    
    // Server
    const result = await toggleFavorite(id, currentStatus)
    if (!result.success) {
      // Revert optimistic
      toggleStoreFavorite(id)
    }
    setLoadingId(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Segur que vols eliminar aquest outfit?')) return
    setLoadingId(id)
    
    // Snapshot per rollback
    const snapshot = useAppStore.getState().outfits
    const localSnapshot = outfits
    
    // Optimistic
    removeStoreOutfit(id)
    setOutfits(outfits.filter(o => o.id !== id))
    
    // Server
    const result = await deleteOutfit(id)
    if (!result.success) {
      // Rollback: restaurar estat complet
      useAppStore.setState({ outfits: snapshot })
      setOutfits(localSnapshot)
      alert(result.error || "Error al eliminar. S'ha restaurat l'outfit.")
    }
    setLoadingId(null)
  }

  const handleUpdateOutfit = (id, updatedOutfit) => {
    setOutfits(outfits.map(o => o.id === id ? updatedOutfit : o))
    // Sincronitzar amb useAppStore global per a que es reflecteixi a tot arreu
    const currentOutfits = useAppStore.getState().outfits
    useAppStore.setState({
      outfits: currentOutfits.map(o => o.id === id ? updatedOutfit : o)
    })
  }

  if (outfits.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-3 mt-4">
        <div className="w-16 h-16 glass-subtle rounded-full flex items-center justify-center text-brand-secondary glow-primary">
          <WandSparkles size={32} />
        </div>
        <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">Cap outfit guardat</h3>
        <p className="text-xs text-[var(--theme-text-muted)] max-w-[260px]">Utilitza el generador de dalt per crear el teu primer outfit amb IA.</p>
      </div>
    )
  }

  return (
    <>
      {/* Filter chips — consistent with GarmentGrid */}
      <div className="flex overflow-x-auto gap-2 pb-3 hide-scrollbar snap-x" style={{ overscrollBehaviorX: 'contain' }}>
        {FILTER_OCCASIONS.map(occ => {
          if (occ !== 'Totes' && !outfits.some(o => o.occasion === occ)) return null
          return (
            <button
              key={occ}
              className={`snap-start whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                activeFilter === occ 
                  ? 'bg-[var(--theme-text-primary)] text-[var(--theme-bg)]' 
                  : 'glass-subtle text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)]'
              }`}
              onClick={() => setActiveFilter(occ)}
            >
              {occ}
            </button>
          )
        })}
      </div>

      {/* Outfits list grid */}
      <div className="flex flex-col gap-5 mt-2">
        {filteredOutfits.length === 0 ? (
          <div className="py-10 text-center text-[var(--theme-text-secondary)] glass rounded-2xl text-xs">
            No hi ha outfits per a: {activeFilter}
          </div>
        ) : (
          filteredOutfits.map(outfit => (
            <OutfitCard 
              key={outfit.id} 
              outfit={outfit} 
              allGarments={allGarments}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              loadingId={loadingId}
              onUpdateOutfit={handleUpdateOutfit}
            />
          ))
        )}
      </div>
    </>
  )
}
