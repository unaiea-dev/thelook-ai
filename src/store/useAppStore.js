import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // ── Auth ──
  user: null,

  // ── Profile ──
  profile: null,

  // ── Garments ──
  garments: null,
  
  // ── Outfits ──
  outfits: null,

  // ── User Plan ──
  userPlan: null,

  // ── Metadata ──
  isHydrated: false,
  lastFetchedAt: null,
  STALE_TIME: 5 * 60 * 1000, // 5 minuts

  // ── UI State ──
  isGarmentModalOpen: false,
  setGarmentModalOpen: (isOpen) => set({ isGarmentModalOpen: isOpen }),

  // ── Drafts ──
  draftGarment: null,
  DRAFT_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hores
  
  setDraftGarment: (draft) => {
    try {
      sessionStorage.setItem('draftGarment', JSON.stringify(draft))
    } catch(e) {}
    set({ draftGarment: draft })
  },
  
  clearDraftGarment: () => {
    try {
      sessionStorage.removeItem('draftGarment')
    } catch(e) {}
    set({ draftGarment: null })
  },
  
  loadDraftGarment: () => {
    try {
      const raw = sessionStorage.getItem('draftGarment')
      if (raw) {
        const draft = JSON.parse(raw)
        // Validació mínima d'estructura
        if (!draft || typeof draft !== 'object' || !draft.photo) {
          sessionStorage.removeItem('draftGarment')
          return
        }
        // Expiració: descartar si té més de 24h
        if (draft.timestamp && Date.now() - draft.timestamp > 24 * 60 * 60 * 1000) {
          sessionStorage.removeItem('draftGarment')
          return
        }
        set({ draftGarment: draft })
      }
    } catch(e) {
      // Dades corruptes → netejar
      try { sessionStorage.removeItem('draftGarment') } catch(_) {}
    }
  },

  // ── Actions: Hydrate ──
  hydrate: (data) => set({
    user: data.user,
    profile: data.profile,
    garments: data.garments || [],
    outfits: data.outfits || [],
    userPlan: data.userPlan,
    isHydrated: true,
    lastFetchedAt: Date.now(),
  }),

  // ── Actions: Garments ──
  addGarment: (garment) => set(s => ({
    garments: [garment, ...(s.garments || [])],
  })),
  
  updateGarment: (id, updates) => set(s => ({
    garments: (s.garments || []).map(g => g.id === id ? { ...g, ...updates } : g),
  })),
  
  removeGarment: (id) => set(s => ({
    garments: (s.garments || []).filter(g => g.id !== id),
    // També netejar outfits que usaven aquesta peça
    outfits: (s.outfits || []).map(o => ({
      ...o,
      garment_ids: o.garment_ids.filter(gid => gid !== id),
    })).filter(o => o.garment_ids.length > 0),
  })),

  // ── Actions: Outfits ──
  addOutfit: (outfit) => set(s => ({
    outfits: [outfit, ...(s.outfits || [])],
  })),
  
  removeOutfit: (id) => set(s => ({
    outfits: (s.outfits || []).filter(o => o.id !== id),
  })),
  
  toggleOutfitFavorite: (id) => set(s => ({
    outfits: (s.outfits || []).map(o => 
      o.id === id ? { ...o, is_favorite: !o.is_favorite } : o
    ),
  })),

  // ── Actions: Profile ──
  updateProfile: (updates) => set(s => ({
    profile: { ...s.profile, ...updates },
  })),

  // ── Actions: Plan ──
  updateUserPlan: (plan) => set({ userPlan: plan }),

  // ── Actions: Freshness ──
  isStale: () => {
    const { lastFetchedAt, STALE_TIME } = get()
    if (!lastFetchedAt) return true
    return Date.now() - lastFetchedAt > STALE_TIME
  },

  markFresh: () => set({ lastFetchedAt: Date.now() }),
}))

export default useAppStore
