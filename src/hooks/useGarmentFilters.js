import { useState, useMemo, useCallback } from 'react'

const INITIAL_FILTERS = {
  search: '',
  categories: [],
  colors: [],
  patterns: [],
  materials: [],
  fits: [],
  seasons: [],
  brands: [],
  formalityRange: [1, 5],
  warmthRange: [1, 5],
  onlyFavorites: false,
}

export default function useGarmentFilters(garments) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  // Extract unique brands present in the user's garments
  const availableBrands = useMemo(() => {
    return [...new Set(garments.map(g => g.brand).filter(Boolean))].sort()
  }, [garments])

  // Extract unique primary and secondary colors present in the user's garments
  const availableColors = useMemo(() => {
    const colors = new Set()
    garments.forEach(g => {
      if (g.color) colors.add(g.color.trim())
      if (g.secondary_color) colors.add(g.secondary_color.trim())
    })
    return [...colors].sort((a, b) => a.localeCompare(b))
  }, [garments])

  // Apply filters in memory
  const filteredGarments = useMemo(() => {
    return garments.filter(g => {
      // Search term
      if (filters.search) {
        const q = filters.search.toLowerCase().trim()
        const searchable = [
          g.description,
          g.brand,
          g.subcategory,
          g.category,
          g.color,
          g.secondary_color,
          g.material,
          g.pattern,
          g.fit,
          ...(g.tags || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!searchable.includes(q)) return false
      }

      // Categories
      if (filters.categories.length > 0 && !filters.categories.includes(g.category)) {
        return false
      }

      // Colors
      if (filters.colors.length > 0) {
        const primary = g.color?.trim()
        const secondary = g.secondary_color?.trim()
        const match = filters.colors.some(c => c === primary || c === secondary)
        if (!match) return false
      }

      // Patterns
      if (filters.patterns.length > 0 && !filters.patterns.includes(g.pattern)) {
        return false
      }

      // Materials
      if (filters.materials.length > 0) {
        const hasDesconegut = filters.materials.includes('desconegut')
        const otherMaterials = filters.materials.filter(m => m !== 'desconegut')
        const materialMatch = (hasDesconegut && (!g.material || g.material === '')) ||
          (otherMaterials.length > 0 && otherMaterials.includes(g.material))
        if (!materialMatch) return false
      }

      // Fits
      if (filters.fits.length > 0 && !filters.fits.includes(g.fit)) {
        return false
      }

      // Seasons
      if (filters.seasons.length > 0) {
        if (!g.season || !g.season.some(s => filters.seasons.includes(s))) {
          return false
        }
      }

      // Brands
      if (filters.brands.length > 0 && !filters.brands.includes(g.brand)) {
        return false
      }

      // Formality
      const formality = g.formality ?? 3
      if (formality < filters.formalityRange[0] || formality > filters.formalityRange[1]) {
        return false
      }

      // Warmth
      const warmth = g.warmth ?? 3
      if (warmth < filters.warmthRange[0] || warmth > filters.warmthRange[1]) {
        return false
      }

      // Favorites
      if (filters.onlyFavorites && !g.is_favorite) {
        return false
      }

      return true
    })
  }, [garments, filters])

  // Count active filters (excluding search & favorites from this specific counter)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.categories.length) count++
    if (filters.colors.length) count++
    if (filters.patterns.length) count++
    if (filters.materials.length) count++
    if (filters.fits.length) count++
    if (filters.seasons.length) count++
    if (filters.brands.length) count++
    if (filters.formalityRange[0] > 1 || filters.formalityRange[1] < 5) count++
    if (filters.warmthRange[0] > 1 || filters.warmthRange[1] < 5) count++
    return count
  }, [filters])

  const hasActiveFilters = activeFilterCount > 0 || !!filters.search

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...INITIAL_FILTERS,
      onlyFavorites: prev.onlyFavorites // Keep favorites tab state
    }))
  }, [])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleArrayFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }))
  }, [])

  return {
    filters,
    filteredGarments,
    activeFilterCount,
    hasActiveFilters,
    availableBrands,
    availableColors,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
    setFilters,
  }
}
