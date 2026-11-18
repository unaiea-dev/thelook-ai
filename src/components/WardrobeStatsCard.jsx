'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import useAppStore from '@/store/useAppStore'
import { 
  ArrowRight, 
  Shirt, 
  Footprints, 
  Gem, 
  Package, 
  Flower2, 
  Sun, 
  Leaf, 
  Snowflake,
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react'

// Custom SVGs
const PantsIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
    <path d="M8 2h8l2 9-2 11h-3.5v-8h-1v8H8L6 11z" />
  </svg>
)

const DressIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
    <path d="M6 2h12l3 6-3 14H6L3 8z" />
    <path d="M10 2v6M14 2v6" />
  </svg>
)

const CATEGORY_LUCIDE_ICONS = {
  samarreta: Shirt,
  camisa: Shirt,
  punt: Layers,
  dessuadora: Shirt,
  jaqueta: Layers,
  pantalons: PantsIcon,
  vestit: DressIcon,
  sabates: Footprints,
  accessori: Gem,
  altres: Package,
}

const SEASONS = [
  { key: 'primavera', icon: Flower2, color: 'text-pink-400' },
  { key: 'estiu', icon: Sun, color: 'text-amber-400' },
  { key: 'tardor', icon: Leaf, color: 'text-orange-400' },
  { key: 'hivern', icon: Snowflake, color: 'text-blue-400' },
]

export default function WardrobeStatsCard() {
  const garments = useAppStore(s => s.garments)
  const isHydrated = useAppStore(s => s.isHydrated)
  const userPlan = useAppStore(s => s.userPlan)
  const profile = useAppStore(s => s.profile)

  if (!isHydrated || !garments || garments.length === 0) return null

  const garmentCount = garments.length

  // --- Outfit generation usage & reset (free plan only) ---
  const outfitUsage = useMemo(() => {
    if (!userPlan || userPlan.plan !== 'free') return null

    const used = userPlan.outfitGenerationsUsed || 0
    const max = userPlan.limits?.maxOutfitGenerations || 5
    const percentage = Math.min(100, (used / max) * 100)

    let daysUntilReset = null
    if (profile?.outfit_generations_reset_at) {
      const resetAt = new Date(profile.outfit_generations_reset_at)
      const nextReset = new Date(resetAt)
      nextReset.setMonth(nextReset.getMonth() + 1)
      const now = new Date()
      const diffMs = nextReset.getTime() - now.getTime()
      daysUntilReset = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    }

    return { used, max, percentage, daysUntilReset }
  }, [userPlan, profile])

  const topCategories = useMemo(() => {
    const catCount = {}
    garments.forEach(g => {
      if (g.category) catCount[g.category] = (catCount[g.category] || 0) + 1
    })
    return Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, count]) => ({
        category: cat,
        count,
        IconComponent: CATEGORY_LUCIDE_ICONS[cat] || Package,
      }))
  }, [garments])

  const seasonCoverage = useMemo(() => {
    const seasonSets = {}
    SEASONS.forEach(s => { seasonSets[s.key] = 0 })
    garments.forEach(g => {
      if (g.season && Array.isArray(g.season)) {
        g.season.forEach(s => {
          if (seasonSets[s] !== undefined) seasonSets[s]++
        })
      }
    })
    return SEASONS.map(s => ({
      ...s,
      count: seasonSets[s.key],
      covered: seasonSets[s.key] > 0,
    }))
  }, [garments])

  return (
    <Link
      href="/app/armari"
      className="glass rounded-2xl px-4 py-3.5 flex flex-col gap-3 transition-all duration-300 hover:bg-[var(--theme-hover)] group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-[var(--theme-text-primary)]">El teu armari</h2>
          <span className="px-2 py-0.5 rounded-full glass-subtle text-[10px] font-bold text-[var(--theme-text-muted)]">
            {garmentCount} {garmentCount === 1 ? 'peça' : 'peces'}
          </span>
        </div>
        <ArrowRight size={14} className="text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-primary)] group-hover:translate-x-0.5 transition-all duration-300" />
      </div>

      {/* Outfit generation usage — free plan only */}
      {outfitUsage && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-brand-accent" />
              <span className="text-[11px] font-medium text-[var(--theme-text-secondary)]">
                {outfitUsage.used}/{outfitUsage.max} outfits generats
              </span>
            </div>
            {outfitUsage.daysUntilReset !== null && (
              <div className="flex items-center gap-1">
                <RotateCcw size={9} className="text-[var(--theme-text-muted)]" />
                <span className="text-[10px] text-[var(--theme-text-muted)]">
                  {outfitUsage.daysUntilReset === 0 
                    ? 'Es renova avui' 
                    : outfitUsage.daysUntilReset === 1 
                      ? 'Es renova demà' 
                      : `${outfitUsage.daysUntilReset}d`}
                </span>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-1 rounded-full bg-[var(--theme-glass-border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${outfitUsage.percentage}%`,
                background: outfitUsage.percentage >= 80
                  ? 'var(--theme-danger, #ef4444)'
                  : 'var(--brand-accent, #a78bfa)',
              }}
            />
          </div>
        </div>
      )}

      {/* Categories + Seasons */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {topCategories.map(cat => {
            const Icon = cat.IconComponent
            return (
              <span
                key={cat.category}
                className="inline-flex items-center gap-1.5 px-2 py-1 glass-subtle rounded-lg text-[11px] font-medium text-[var(--theme-text-secondary)]"
              >
                <Icon size={12} className="text-[var(--theme-text-muted)]" />
                <span>{cat.count}</span>
              </span>
            )
          })}
        </div>

        <div className="flex gap-1 shrink-0">
          {seasonCoverage.map(season => {
            const Icon = season.icon
            return (
              <div
                key={season.key}
                className={`flex flex-col items-center gap-1 px-1.5 py-1 rounded-lg transition-all duration-300 ${
                  season.covered ? 'glass-subtle' : 'opacity-20'
                }`}
              >
                <Icon size={12} className={season.covered ? season.color : 'text-[var(--theme-text-muted)]'} />
                <span className="text-[8px] font-bold text-[var(--theme-text-muted)] leading-none">
                  {season.count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Link>
  )
}
