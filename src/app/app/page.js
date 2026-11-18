'use client'

import useAppStore from '@/store/useAppStore'
import Link from 'next/link'
import Image from 'next/image'
import { AdBannerSmart } from '@/components/ads'
import WeatherWidget from '@/components/WeatherWidget'
import WardrobeStatsCard from '@/components/WardrobeStatsCard'
import { Camera, ArrowRight, Shirt, Sparkles } from 'lucide-react'
import AppLoading from './loading'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bon dia'
  if (h < 20) return 'Bona tarda'
  return 'Bona nit'
}

export default function Dashboard() {
  const profile = useAppStore(s => s.profile)
  const garments = useAppStore(s => s.garments)
  const isHydrated = useAppStore(s => s.isHydrated)
  const userPlan = useAppStore(s => s.userPlan)

  if (!isHydrated) return <AppLoading />

  const name = profile?.full_name?.split(' ')[0] || ''
  const garmentCount = garments.length
  const recentGarments = garments.slice(0, 4)

  return (
    <div className="flex flex-col gap-5 py-4 animate-fadeIn">
      {/* Greeting — Apple-style clean */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--theme-text-primary)]">{getGreeting()}{name ? `, ${name}` : ''}</h1>
          <p className="text-sm text-[var(--theme-text-muted)]">Què et posaràs avui?</p>
        </div>
      </div>

      <WeatherWidget />

      <WardrobeStatsCard />

      {/* Main CTA — Glass with gradient border */}
      <Link 
        href="/app/afegir" 
        className="relative group flex items-center gap-4 p-[1px] rounded-2xl bg-gradient-to-r from-app-primary via-brand-secondary to-app-accent overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      >
        <div className="flex items-center gap-4 w-full glass rounded-[15px] px-5 py-4">
            <Camera className="text-white w-5 h-5" />
          <span className="font-semibold text-[15px]">Escaneja nova peça</span>
          <ArrowRight size={16} className="ml-auto text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-primary)] transition-colors duration-300" />
        </div>
      </Link>
      
      <AdBannerSmart 
        show={userPlan?.plan === 'free'} 
        adSlot={process.env.NEXT_PUBLIC_AD_SLOT_HOME_BANNER}
        variant="banner"
      />

      {/* Genera Outfit CTA */}
      {garmentCount > 0 && (
        <Link 
          href="/app/outfits" 
          className="group glass rounded-2xl flex items-center gap-4 px-5 py-4 text-[15px] font-semibold text-[var(--theme-text-primary)] bg-[var(--theme-glass-highlight)] transition-all duration-300 hover:bg-[var(--theme-glass-border)] hover:scale-[1.02]"
        >
          <Sparkles size={20} className="text-brand-accent" />
          <span>Genera Outfit</span>
          <ArrowRight size={16} className="ml-auto text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-primary)] transition-colors duration-300" />
        </Link>
      )}

      {/* Empty state or Recent garments */}
      {(garmentCount ?? 0) === 0 ? (
        <div className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-3 border-dashed border-[var(--theme-border)]">
          <Shirt className="w-10 h-10 opacity-30 mb-1 mx-auto" />
          <h3 className="text-base font-semibold text-[var(--theme-text-primary)]">El teu armari t&apos;espera</h3>
          <p className="text-xs text-[var(--theme-text-muted)] max-w-[260px]">Escaneja la teva primera peça de roba i comença a organitzar el teu armari intel·ligent.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-base font-semibold mb-3 text-[var(--theme-text-secondary)]">Últimes peces</h2>
          <div className="flex overflow-x-auto gap-3 pb-3 snap-x hide-scrollbar">
            {recentGarments?.map((garment, index) => (
              <div key={garment.id} className="snap-start shrink-0 w-28 relative rounded-[18px] overflow-hidden glass">
                <div className="aspect-[3/4] relative">
                  <Image 
                    src={garment.image_url} 
                    alt={garment.category}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="112px"
                    priority={index < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-white text-[11px] font-semibold capitalize drop-shadow-md">
                    {garment.category}
                  </span>
                </div>
              </div>
            ))}
            
            {garmentCount > 4 && (
              <Link href="/app/armari" className="snap-start shrink-0 w-28 aspect-[3/4] rounded-[18px] glass flex flex-col items-center justify-center text-[var(--theme-text-muted)] transition-all duration-300 hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)]">
                <ArrowRight size={20} className="mb-1.5" />
                <span className="text-xs font-semibold">Veure totes</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Bottom ad — only for free users */}
      <AdBannerSmart 
        show={userPlan?.plan === 'free'} 
        adSlot={process.env.NEXT_PUBLIC_AD_SLOT_HOME_BOTTOM}
        variant="compact"
      />
    </div>
  )
}
