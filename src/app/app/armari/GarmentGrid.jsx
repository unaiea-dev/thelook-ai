'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import useAppStore from '@/store/useAppStore'
import { updateGarment as updateGarmentAction, deleteGarment as deleteGarmentAction } from './actions'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, X, Loader2, ChevronLeft, Heart, Star, Search, SlidersHorizontal } from 'lucide-react'
import CustomSelect from '@/components/CustomSelect'
import useGarmentFilters from '@/hooks/useGarmentFilters'
import FilterPanel from './FilterPanel'

import { 
  CATEGORY_OPTIONS, 
  PATTERN_OPTIONS, 
  MATERIAL_OPTIONS, 
  FIT_OPTIONS, 
  CATEGORY_ICONS 
} from '@/lib/garmentConstants'

export default function GarmentGrid({ initialGarments }) {
  const garments = initialGarments || []
  const updateStoreGarment = useAppStore(s => s.updateGarment)
  const removeStoreGarment = useAppStore(s => s.removeGarment)
  const setGarmentModalOpen = useAppStore(s => s.setGarmentModalOpen)

  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])
  const [openCategory, setOpenCategory] = useState(null)
  const [selectedGarment, setSelectedGarment] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  const {
    filters,
    filteredGarments,
    activeFilterCount,
    hasActiveFilters,
    availableBrands,
    availableColors,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
  } = useGarmentFilters(garments)

  const activeTab = filters.onlyFavorites ? 'favorites' : 'categories'
  const setActiveTab = (tab) => {
    updateFilter('onlyFavorites', tab === 'favorites')
    if (tab === 'categories') {
      setOpenCategory(null)
    }
  }

  const categoryGroups = useMemo(() => {
    return garments.reduce((acc, g) => {
      if (!acc[g.category]) acc[g.category] = []
      acc[g.category].push(g)
      return acc
    }, {})
  }, [garments])

  // Clear folder state when filters become active
  useEffect(() => {
    if (hasActiveFilters) {
      const t = setTimeout(() => setOpenCategory(null), 0)
      return () => clearTimeout(t)
    }
  }, [hasActiveFilters])


  const handleGarmentClick = (garment) => {
    setSelectedGarment(garment)
    setGarmentModalOpen(true)
    setEditData({
      category: garment.category, subcategory: garment.subcategory || '',
      color: garment.color || '', secondary_color: garment.secondary_color || '',
      pattern: garment.pattern || 'llis', material: garment.material || '',
      formality: garment.formality || 3, warmth: garment.warmth || 3,
      fit: garment.fit || 'regular', season: garment.season || [],
      brand: garment.brand || '', description: garment.description || '',
      tags: garment.tags ? garment.tags.join(', ') : ''
    })
    setIsEditing(false)
    setIsDeleting(false)
  }

  const closeModal = () => {
    setSelectedGarment(null)
    setGarmentModalOpen(false)
  }

  const handleUpdate = async () => {
    setIsSubmitting(true)
    const tagsArray = editData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    const updatedData = { ...editData, tags: tagsArray }
    
    // Snapshot per rollback
    const originalGarment = useAppStore.getState().garments.find(g => g.id === selectedGarment.id)
    
    // Optimistic
    updateStoreGarment(selectedGarment.id, updatedData)
    setSelectedGarment({ ...selectedGarment, ...updatedData })
    setIsEditing(false)

    // Server action
    const result = await updateGarmentAction(selectedGarment.id, updatedData)
    if (!result.success) {
      // Rollback
      if (originalGarment) {
        updateStoreGarment(selectedGarment.id, originalGarment)
        setSelectedGarment(originalGarment)
      }
      alert(result.error || "Error al guardar. S'han restaurat els canvis.")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    
    // Snapshot per rollback (garments + outfits, perquè removeGarment afecta ambdós)
    const { garments: gSnap, outfits: oSnap } = useAppStore.getState()
    
    // Optimistic
    removeStoreGarment(selectedGarment.id)
    closeModal()

    // Server action
    const result = await deleteGarmentAction(selectedGarment.id)
    if (!result.success) {
      // Rollback complet
      useAppStore.setState({ garments: gSnap, outfits: oSnap })
      setGarmentModalOpen(true)
      alert(result.error || "Error al eliminar. S'ha restaurat la peça.")
    }
    setIsSubmitting(false)
  }

  const handleToggleFavorite = async (garment) => {
    const newVal = !garment.is_favorite
    // Optimistic
    updateStoreGarment(garment.id, { is_favorite: newVal })
    if (selectedGarment?.id === garment.id) setSelectedGarment({ ...selectedGarment, is_favorite: newVal })

    const result = await updateGarmentAction(garment.id, { is_favorite: newVal })
    if (!result.success) {
      // Revert optimistic
      updateStoreGarment(garment.id, { is_favorite: !newVal })
      if (selectedGarment?.id === garment.id) setSelectedGarment({ ...selectedGarment, is_favorite: !newVal })
    }
  }

  // Render garment grid items
  const renderGarmentItems = (items) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {items.length === 0 ? (
        <div className="col-span-full py-10 text-center text-[var(--theme-text-secondary)] glass rounded-2xl text-xs">
          No hi ha cap peça aquí
        </div>
      ) : items.map((garment, index) => (
        <div
          key={garment.id}
          className="rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative"
          onClick={() => handleGarmentClick(garment)}
        >
          <div className="aspect-[3/4] relative bg-[var(--theme-surface)]">
            <Image src={garment.image_url} alt={garment.description || garment.category} fill style={{ objectFit: 'cover' }} sizes="240px" priority={index < 4} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            {garment.is_favorite && (
              <div className="absolute top-2 right-2">
                <Heart size={14} fill="white" className="text-white drop-shadow-md" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <span className="text-xs font-semibold capitalize text-white drop-shadow-md">{garment.subcategory || garment.category}</span>
              {garment.color && <span className="block text-[10px] text-zinc-300 mt-0.5 drop-shadow-md">{garment.color}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Tabs: Categories / Favorites */}
      <div className="flex gap-1 p-1 glass rounded-xl">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${activeTab === 'categories' ? 'bg-[var(--theme-surface)] text-[var(--theme-text-primary)] shadow-sm' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]'}`}
          onClick={() => setActiveTab('categories')}
        >
          <Star size={14} /> Totes
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${activeTab === 'favorites' ? 'bg-[var(--theme-surface)] text-[var(--theme-text-primary)] shadow-sm' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]'}`}
          onClick={() => setActiveTab('favorites')}
        >
          <Heart size={14} /> Favorits
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex gap-2 items-center mt-1">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder="Cerca per marca, color, descripció..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full glass-subtle rounded-xl pl-10 pr-9 py-2.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 placeholder:text-[var(--theme-text-muted)]/60"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => { closeModal(); setIsFilterPanelOpen(true) }}
          className={`h-[42px] px-3.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all duration-300 relative shrink-0 ${
            activeFilterCount > 0
              ? 'bg-brand-primary/20 border-brand-primary/30 text-brand-primary font-semibold'
              : 'glass-subtle border-transparent text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)]'
          }`}
        >
          <SlidersHorizontal size={16} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center border border-[var(--theme-surface)]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Results Info Chip */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-1 -mt-1 animate-fadeIn">
          <span className="text-[11px] font-semibold text-[var(--theme-text-secondary)]">
            {filteredGarments.length} {filteredGarments.length === 1 ? 'peça trobada' : 'peces trobades'}
          </span>
          <button
            onClick={clearFilters}
            className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-0.5"
          >
            Netejar filtres
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'favorites' ? (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          {filteredGarments.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-3 mt-2">
              <Heart className="w-10 h-10 opacity-30" />
              <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">{hasActiveFilters ? 'Cap resultat' : 'Cap favorit'}</h3>
              <p className="text-xs text-[var(--theme-text-muted)] max-w-[260px]">
                {hasActiveFilters 
                  ? 'Cap de les teves peces preferides coincideix amb els filtres aplicats.' 
                  : 'Marca peces com a favorites des del detall de cada peça.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-2 text-xs font-semibold text-brand-primary hover:underline">
                  Netejar filtres
                </button>
              )}
            </div>
          ) : renderGarmentItems(filteredGarments)}
        </div>
      ) : hasActiveFilters ? (
        /* Flat Grid View when filters are active */
        <div className="animate-[fadeIn_0.2s_ease-out]">
          {filteredGarments.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-3 mt-2">
              <Search className="w-10 h-10 opacity-30" />
              <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">Cap resultat</h3>
              <p className="text-xs text-[var(--theme-text-muted)] max-w-[260px]">No hem trobat cap peça al teu armari que coincideixi amb els filtres.</p>
              <button onClick={clearFilters} className="mt-2 text-xs font-semibold text-brand-primary hover:underline">
                Netejar filtres
              </button>
            </div>
          ) : renderGarmentItems(filteredGarments)}
        </div>
      ) : openCategory ? (
        /* Inside a category folder (no filters active) */
        <div className="animate-[fadeIn_0.2s_ease-out]">
          <button
            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors duration-300 mb-3"
            onClick={() => setOpenCategory(null)}
          >
            <ChevronLeft size={18} /> 
            <span className="capitalize">{openCategory}</span>
            <span className="text-[var(--theme-text-muted)] font-normal ml-1">({categoryGroups[openCategory]?.length || 0})</span>
          </button>
          {renderGarmentItems(categoryGroups[openCategory] || [])}
        </div>
      ) : (
        /* Folders view (no filters active) */
        <div className="grid grid-cols-2 gap-3 animate-[fadeIn_0.2s_ease-out]">
          {Object.entries(categoryGroups).map(([category, items], index) => {
            const coverImage = items[0]?.image_url
            const icon = CATEGORY_ICONS[category] || '📦'
            return (
              <button
                key={category}
                className="relative rounded-[20px] overflow-hidden transition-all duration-300 hover:scale-[1.02] group text-left"
                onClick={() => setOpenCategory(category)}
              >
                <div className="aspect-square relative bg-[var(--theme-surface)]">
                  {coverImage ? (
                    <Image src={coverImage} alt={category} fill style={{ objectFit: 'cover' }} sizes="240px" priority={index < 4} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">{icon}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5 group-hover:from-black/90 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <span className="text-sm font-bold capitalize text-white drop-shadow-md block">{category}</span>
                    <span className="text-[11px] text-zinc-300 drop-shadow-md">{items.length} {items.length === 1 ? 'peça' : 'peces'}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Filter panel bottom sheet */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        updateFilter={updateFilter}
        toggleArrayFilter={toggleArrayFilter}
        clearFilters={clearFilters}
        availableBrands={availableBrands}
        availableColors={availableColors}
        filteredCount={filteredGarments.length}
      />

      {/* Modal Detail — iOS sheet style */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedGarment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md flex items-end justify-center pb-[calc(52px+env(safe-area-inset-bottom,0px))]" 
            onClick={closeModal}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-full max-w-lg bg-[var(--theme-surface)] border-t border-[var(--theme-border)] rounded-t-[28px] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl" 
              onClick={e => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 1 }}
              onDragEnd={(event, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) {
                  closeModal();
                }
              }}
            >
              {/* Drag indicator */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing w-full">
                <div className="w-9 h-1 rounded-full bg-[var(--theme-text-muted)] opacity-40" />
              </div>
            <div className="overflow-y-auto px-5 pb-6 hide-scrollbar flex-1">
              <div className="w-full aspect-square relative rounded-2xl overflow-hidden mb-5 bg-[var(--theme-surface)]">
                <Image src={selectedGarment.image_url} alt={selectedGarment.description || selectedGarment.category} fill style={{ objectFit: 'cover' }} sizes="480px" />
              </div>
              <div className="flex flex-col gap-4">
                {isEditing ? (
                  <div className="flex flex-col gap-3.5">
                    <h3 className="text-lg font-semibold">Editar Peça</h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Categoria & Subcategoria</label>
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <CustomSelect options={CATEGORY_OPTIONS} value={editData.category} onChange={val => setEditData({...editData, category: val})} />
                        </div>
                        <input type="text" placeholder="Ex: Polo..." className="w-1/2 glass-subtle rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50" value={editData.subcategory} onChange={e => setEditData({...editData, subcategory: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Colors (Principal i Secundari)</label>
                      <div className="flex gap-2">
                        <input type="text" className="w-1/2 glass-subtle rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50" value={editData.color} onChange={e => setEditData({...editData, color: e.target.value})} />
                        <input type="text" placeholder="Opcional" className="w-1/2 glass-subtle rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50" value={editData.secondary_color} onChange={e => setEditData({...editData, secondary_color: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Patró i Material</label>
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <CustomSelect options={PATTERN_OPTIONS} value={editData.pattern || 'llis'} onChange={(val) => setEditData({...editData, pattern: val})} />
                        </div>
                        <div className="w-1/2">
                          <CustomSelect options={MATERIAL_OPTIONS} value={editData.material || ''} onChange={(val) => setEditData({...editData, material: val})} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Formalitat ({['Molt informal', 'Informal', 'Neutre', 'Formal', 'Molt formal'][(editData.formality || 3) - 1]})</label>
                      <input type="range" min="1" max="5" className="w-full accent-brand-primary" value={editData.formality || 3} onChange={(e) => setEditData({...editData, formality: parseInt(e.target.value)})} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Calidesa ({['Molt fresc', 'Fresc', 'Neutre', 'Càlid', 'Molt càlid'][(editData.warmth || 3) - 1]})</label>
                      <input type="range" min="1" max="5" className="w-full accent-orange-400" value={editData.warmth || 3} onChange={(e) => setEditData({...editData, warmth: parseInt(e.target.value)})} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Fit i Marca</label>
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <CustomSelect options={FIT_OPTIONS} value={editData.fit || 'regular'} onChange={(val) => setEditData({...editData, fit: val})} />
                        </div>
                        <input type="text" placeholder="Marca" className="w-1/2 glass-subtle rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50" value={editData.brand} onChange={e => setEditData({...editData, brand: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Temporades</label>
                      <div className="flex gap-1.5">
                        {['primavera', 'estiu', 'tardor', 'hivern'].map(s => {
                          const isActive = (editData.season || []).includes(s)
                          return (
                            <button key={s} type="button" onClick={() => { const seasons = editData.season || []; setEditData({...editData, season: seasons.includes(s) ? seasons.filter(x => x !== s) : [...seasons, s]}) }} className={`flex-1 py-1 rounded-lg text-xs font-medium capitalize transition-all duration-300 ${isActive ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'glass-subtle text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)]'}`}>
                              {s}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Descripció</label>
                      <input type="text" className="glass-subtle rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">Tags Extras (separats per coma)</label>
                      <input type="text" className="glass-subtle rounded-xl px-3.5 py-2.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50" value={editData.tags} onChange={e => setEditData({...editData, tags: e.target.value})} />
                    </div>
                    <div className="flex gap-2.5 mt-2">
                      <button className="flex-1 py-3 rounded-xl font-semibold text-sm glass hover:bg-[var(--theme-hover)] transition-all duration-300" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel·lar</button>
                      <button className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-app-primary to-brand-secondary text-white transition-all duration-300 flex items-center justify-center disabled:opacity-60" onClick={handleUpdate} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}
                      </button>
                    </div>
                  </div>
                ) : isDeleting ? (
                  <div className="flex flex-col gap-3 items-center text-center p-4 glass rounded-2xl border-red-500/10">
                    <h3 className="text-lg font-semibold text-red-400">Eliminar peça?</h3>
                    <p className="text-xs text-[var(--theme-text-muted)]">Aquesta acció no es pot desfer.</p>
                    <div className="flex gap-2.5 w-full mt-1">
                      <button className="flex-1 py-3 rounded-xl font-semibold text-sm glass hover:bg-[var(--theme-hover)] transition-all duration-300" onClick={() => setIsDeleting(false)} disabled={isSubmitting}>Cancel·lar</button>
                      <button className="flex-1 py-3 rounded-xl font-semibold text-sm bg-red-600/80 text-white hover:bg-red-600 transition-all duration-300 flex items-center justify-center disabled:opacity-60" onClick={handleDelete} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <h2 className="text-xl font-semibold capitalize">{selectedGarment.category}</h2>
                      <button onClick={() => handleToggleFavorite(selectedGarment)} className="p-2 rounded-lg hover:bg-[var(--theme-hover)] transition-all duration-300">
                        <Heart size={20} className={selectedGarment.is_favorite ? 'fill-red-500 text-red-500' : 'text-[var(--theme-text-muted)]'} />
                      </button>
                    </div>
                    {selectedGarment.color && <p className="text-sm text-[var(--theme-text-secondary)]"><span className="text-[var(--theme-text-primary)]">Color:</span> {selectedGarment.color}{selectedGarment.secondary_color ? ` i ${selectedGarment.secondary_color}` : ''}</p>}
                    {selectedGarment.brand && <p className="text-sm text-[var(--theme-text-secondary)]"><span className="text-[var(--theme-text-primary)]">Marca:</span> {selectedGarment.brand}</p>}
                    {selectedGarment.description && <p className="text-xs text-[var(--theme-text-muted)]">{selectedGarment.description}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedGarment.subcategory && <span className="px-2.5 py-1 glass-subtle rounded-full text-[10px] font-semibold">{selectedGarment.subcategory}</span>}
                      {selectedGarment.material && <span className="px-2.5 py-1 glass-subtle rounded-full text-[10px] font-semibold">{selectedGarment.material}</span>}
                      {selectedGarment.pattern && selectedGarment.pattern !== 'llis' && <span className="px-2.5 py-1 glass-subtle rounded-full text-[10px] font-semibold capitalize">{selectedGarment.pattern}</span>}
                      {selectedGarment.fit && <span className="px-2.5 py-1 glass-subtle rounded-full text-[10px] font-semibold capitalize">Fit: {selectedGarment.fit}</span>}
                    </div>
                    {selectedGarment.tags && selectedGarment.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedGarment.tags.map((tag, i) => (<span key={i} className="px-2.5 py-1 glass-subtle rounded-full text-[10px] font-semibold">{tag}</span>))}
                      </div>
                    )}
                    <p className="text-[10px] text-[var(--theme-text-muted)] mt-2">Afegida el {new Date(selectedGarment.created_at).toLocaleDateString()}</p>
                    <div className="flex gap-2.5 mt-4">
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 glass rounded-xl font-semibold text-sm hover:bg-[var(--theme-hover)] transition-all duration-300" onClick={() => setIsEditing(true)}>
                        <Pencil size={12} className="mr-1" /> Editar
                      </button>
                      <button className="w-12 h-12 flex shrink-0 items-center justify-center glass text-[var(--theme-danger)] rounded-xl hover:bg-[var(--theme-danger-hover)] transition-all duration-300" onClick={() => setIsDeleting(true)}>
                        <X size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>,
      document.body
    )}
    </>
  )
}
