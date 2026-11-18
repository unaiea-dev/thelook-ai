'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'
import { 
  CATEGORY_OPTIONS, 
  PATTERN_OPTIONS, 
  MATERIAL_OPTIONS, 
  FIT_OPTIONS, 
  SEASON_OPTIONS 
} from '@/lib/garmentConstants'

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  updateFilter,
  toggleArrayFilter,
  clearFilters,
  availableBrands,
  availableColors,
  filteredCount
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  if (!mounted) return null

  const FORMALITY_LABELS = ['Molt informal', 'Informal', 'Neutre', 'Formal', 'Molt formal']
  const WARMTH_LABELS = ['Molt fresc', 'Fresc', 'Neutre', 'Càlid', 'Molt càlid']

  const renderSectionHeader = (title) => (
    <h4 className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider mb-2">
      {title}
    </h4>
  )

  const renderChips = (options, activeValues, onToggle, labelKey = 'label', valueKey = 'value') => (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt[valueKey] : opt
        const label = typeof opt === 'object' ? opt[labelKey] : opt
        const isActive = activeValues.includes(val)
        return (
          <button
            key={val}
            type="button"
            onClick={() => onToggle(val)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-300 ${
              isActive 
                ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' 
                : 'glass-subtle text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] border border-transparent'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end justify-center pb-[calc(52px+env(safe-area-inset-bottom,0px))]"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="w-full max-w-lg bg-[var(--theme-surface)] border-t border-[var(--theme-border)] rounded-t-[28px] overflow-hidden flex flex-col max-h-[80vh] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) {
                onClose()
              }
            }}
          >
            {/* Drag Indicator */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing w-full">
              <div className="w-9 h-1 rounded-full bg-[var(--theme-text-muted)] opacity-40" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--theme-text-primary)]">Filtres</h3>
                <span className="px-2 py-0.5 rounded-full bg-[var(--theme-glass-highlight)] text-[10px] font-semibold text-[var(--theme-text-secondary)]">
                  {filteredCount} peces
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-brand-primary transition-colors duration-300 flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Netejar
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-[var(--theme-hover)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all duration-300"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content (Scrollable) */}
            <div className="overflow-y-auto px-5 py-4 hide-scrollbar flex-1 flex flex-col gap-1.5 pb-4">
              {/* Category */}
              <div>
                {renderSectionHeader('Categoria')}
                {renderChips(CATEGORY_OPTIONS, filters.categories, (v) => toggleArrayFilter('categories', v))}
              </div>

              {/* Color */}
              {availableColors.length > 0 && (
                <div>
                  {renderSectionHeader('Color')}
                  {renderChips(availableColors, filters.colors, (v) => toggleArrayFilter('colors', v))}
                </div>
              )}

              {/* Season */}
              <div>
                {renderSectionHeader('Temporada')}
                {renderChips(SEASON_OPTIONS, filters.seasons, (v) => toggleArrayFilter('seasons', v))}
              </div>

              {/* Brand */}
              {availableBrands.length > 0 && (
                <div>
                  {renderSectionHeader('Marca')}
                  {renderChips(availableBrands, filters.brands, (v) => toggleArrayFilter('brands', v))}
                </div>
              )}

              {/* Pattern */}
              <div>
                {renderSectionHeader('Patró')}
                {renderChips(PATTERN_OPTIONS, filters.patterns, (v) => toggleArrayFilter('patterns', v))}
              </div>

              {/* Material */}
              <div>
                {renderSectionHeader('Material')}
                {renderChips(MATERIAL_OPTIONS, filters.materials, (v) => toggleArrayFilter('materials', v))}
              </div>

              {/* Fit */}
              <div>
                {renderSectionHeader('Fit / Tall')}
                {renderChips(FIT_OPTIONS, filters.fits, (v) => toggleArrayFilter('fits', v))}
              </div>

              {/* Formality Slider */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">
                    Formalitat
                  </h4>
                  <span className="text-[10px] font-semibold text-brand-primary">
                    {FORMALITY_LABELS[filters.formalityRange[0] - 1]} - {FORMALITY_LABELS[filters.formalityRange[1] - 1]}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--theme-text-muted)] uppercase">Mínim ({filters.formalityRange[0]})</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      className="w-full accent-brand-primary bg-[var(--theme-border)] h-1 rounded-lg appearance-none cursor-pointer"
                      value={filters.formalityRange[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        updateFilter('formalityRange', [val, Math.max(val, filters.formalityRange[1])])
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--theme-text-muted)] uppercase">Màxim ({filters.formalityRange[1]})</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      className="w-full accent-brand-primary bg-[var(--theme-border)] h-1 rounded-lg appearance-none cursor-pointer"
                      value={filters.formalityRange[1]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        updateFilter('formalityRange', [Math.min(val, filters.formalityRange[0]), val])
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Warmth Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-[11px] text-[var(--theme-text-muted)] font-semibold uppercase tracking-wider">
                    Calidesa
                  </h4>
                  <span className="text-[10px] font-semibold text-orange-400">
                    {WARMTH_LABELS[filters.warmthRange[0] - 1]} - {WARMTH_LABELS[filters.warmthRange[1] - 1]}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--theme-text-muted)] uppercase">Mínim ({filters.warmthRange[0]})</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      className="w-full accent-orange-400 bg-[var(--theme-border)] h-1 rounded-lg appearance-none cursor-pointer"
                      value={filters.warmthRange[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        updateFilter('warmthRange', [val, Math.max(val, filters.warmthRange[1])])
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--theme-text-muted)] uppercase">Màxim ({filters.warmthRange[1]})</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      className="w-full accent-orange-400 bg-[var(--theme-border)] h-1 rounded-lg appearance-none cursor-pointer"
                      value={filters.warmthRange[1]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        updateFilter('warmthRange', [Math.min(val, filters.warmthRange[0]), val])
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer button — sticky flex child instead of absolute */}
            <div className="shrink-0 p-4 bg-[var(--theme-surface)] border-t border-[var(--theme-border)]">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-app-primary to-brand-secondary text-white shadow-lg shadow-app-primary/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                Veure els {filteredCount} resultats
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
