'use client'

import useAppStore from '@/store/useAppStore'
import OutfitGenerator from './OutfitGenerator'
import OutfitList from './OutfitList'
import { AdBannerSmart } from '@/components/ads'

export default function OutfitsPage() {
  const garments = useAppStore(s => s.garments)
  const outfits = useAppStore(s => s.outfits)
  const isHydrated = useAppStore(s => s.isHydrated)
  const userPlan = useAppStore(s => s.userPlan)

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-5 py-4 pb-20 animate-fadeIn">
        <div className="h-8 w-32 rounded-lg shimmer-loading" />
        <div className="glass rounded-2xl p-6 flex flex-col gap-4">
          <div className="h-5 w-40 rounded-lg shimmer-loading" />
          <div className="h-12 rounded-xl shimmer-loading" />
          <div className="h-12 rounded-xl shimmer-loading" />
        </div>
      </div>
    )
  }

  const savedOutfits = (outfits || []).map(outfit => {
    const outfitGarments = outfit.garment_ids.map(id => 
      garments.find(g => g.id === id)
    ).filter(Boolean)
    return { ...outfit, garments: outfitGarments }
  })

  return (
    <div className="flex flex-col gap-5 py-4 pb-20 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--theme-text-primary)]">Outfits IA</h1>
      </div>

      <OutfitGenerator />

      {/* Ad between generator and saved outfits */}
      <AdBannerSmart 
        show={userPlan?.plan === 'free'} 
        adSlot={process.env.NEXT_PUBLIC_AD_SLOT_OUTFITS_INFEED}
        variant="infeed"
      />

      {savedOutfits.length > 0 && (
        <div className="mt-2">
          <h2 className="text-base font-semibold mb-3 text-[var(--theme-text-secondary)]">Outfits Guardats</h2>
          <OutfitList initialOutfits={savedOutfits} allGarments={garments || []} />
        </div>
      )}
    </div>
  )
}
