'use client'

import useAppStore from '@/store/useAppStore'
import Link from 'next/link'
import GarmentGrid from './GarmentGrid'
import { Shirt, Camera } from 'lucide-react'
import FloatingAddButton from '@/components/FloatingAddButton'
import { AdBannerSmart } from '@/components/ads'
import ArmariLoading from './loading'

export default function ArmariPage() {
  const garments = useAppStore(s => s.garments)
  const isHydrated = useAppStore(s => s.isHydrated)
  const userPlan = useAppStore(s => s.userPlan)
  const isGarmentModalOpen = useAppStore(s => s.isGarmentModalOpen)

  if (!isHydrated) return <ArmariLoading />

  const garmentCount = garments.length

  return (
    <div className="flex flex-col gap-5 py-4 pb-20 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--theme-text-primary)]">El meu armari</h1>
      </div>

      {!isGarmentModalOpen && garmentCount > 0 && <FloatingAddButton />}
      
      <AdBannerSmart 
        show={userPlan?.plan === 'free'} 
        adSlot={process.env.NEXT_PUBLIC_AD_SLOT_ARMARI} 
      />

      {garmentCount === 0 ? (
        <div className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-3 mt-4">
          <Shirt className="w-10 h-10 opacity-30 mb-1 mx-auto" />
          <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">Armari buit</h3>
          <p className="text-xs text-[var(--theme-text-muted)] max-w-[260px]">Encara no has afegit cap peça de roba al teu armari digital.</p>
          <Link href="/app/afegir" className="mt-3 w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-app-primary to-brand-secondary text-white shadow-lg shadow-app-primary/30 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5">
            <Camera size={16} className="mr-1" /> Escanejar primera peça
          </Link>
        </div>
      ) : (
        <>
          <GarmentGrid initialGarments={garments || []} />
          
          {/* Ad at the bottom of the armari */}
          <AdBannerSmart 
            show={userPlan?.plan === 'free'} 
            adSlot={process.env.NEXT_PUBLIC_AD_SLOT_ARMARI}
            variant="compact"
            className="mt-2"
          />
        </>
      )}
    </div>
  )
}
