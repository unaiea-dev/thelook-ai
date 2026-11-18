'use client'

import { useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'

// ─── Demo Ads Pool ───
// Realistic mock ads for fashion/lifestyle that rotate randomly.
const DEMO_ADS = [
  {
    brand: 'ZARA',
    headline: 'Nova Col·lecció Estiu 2026',
    description: 'Descobreix les últimes tendències de moda.',
    cta: 'Comprar Ara',
    gradient: 'from-[#1a1a2e] to-[#16213e]',
    accentColor: '#e2e2e2',
    brandColor: '#ffffff',
    logo: '/ads/logos/zara.svg',
    logoRound: false,
  },
  {
    brand: 'Nike',
    headline: 'Just Do It',
    description: "Air Max Dn — Disseny que et mou.",
    cta: 'Veure Més',
    gradient: 'from-[#111111] to-[#1a1a1a]',
    accentColor: '#ff6b35',
    brandColor: '#ffffff',
    logo: '/ads/logos/nike.svg',
    logoRound: true,
  },
  {
    brand: 'H&M',
    headline: 'Conscious Collection',
    description: 'Moda sostenible a preus accessibles.',
    cta: 'Explorar',
    gradient: 'from-[#1b1b2f] to-[#0d0d1a]',
    accentColor: '#e63946',
    brandColor: '#ffffff',
    logo: '/ads/logos/hm.svg',
    logoRound: false,
  },
  {
    brand: 'MANGO',
    headline: 'The Mediterranean Look',
    description: 'Estil mediterrani per als teus dies.',
    cta: 'Descobrir',
    gradient: 'from-[#2d1b00] to-[#1a1008]',
    accentColor: '#d4a574',
    brandColor: '#f5e6d3',
    logo: '/ads/logos/mango.svg',
    logoRound: false,
  },
  {
    brand: 'Spotify',
    headline: 'Música per al teu estil',
    description: "Playlists pensades per cada outfit.",
    cta: 'Escolta Gratis',
    gradient: 'from-[#0d1a0d] to-[#0a140a]',
    accentColor: '#1db954',
    brandColor: '#ffffff',
    logo: '/ads/logos/spotify.svg',
    logoRound: true,
  },
  {
    brand: 'Apple',
    headline: 'Apple Watch Ultra 3',
    description: "L'accessori definitiu. Disseny i rendiment.",
    cta: 'Més info',
    gradient: 'from-[#1c1c1e] to-[#0a0a0a]',
    accentColor: '#0a84ff',
    brandColor: '#f5f5f7',
    logo: '/ads/logos/apple.svg',
    logoRound: true,
  },
  {
    brand: 'Adidas',
    headline: 'Originals Samba',
    description: "El clàssic que mai passa de moda.",
    cta: 'Comprar',
    gradient: 'from-[#0d0d0d] to-[#1a1a1a]',
    accentColor: '#ffffff',
    brandColor: '#ffffff',
    logo: '/ads/logos/adidas.svg',
    logoRound: false,
  },
  {
    brand: 'Pull&Bear',
    headline: 'Street Vibes SS26',
    description: 'Casualwear urbà per al dia a dia.',
    cta: 'Veure',
    gradient: 'from-[#1a0a2e] to-[#0d0519]',
    accentColor: '#c084fc',
    brandColor: '#e8d5f5',
    logo: '/ads/logos/pullandbear.svg',
    logoRound: false,
  },
]

/**
 * Reusable AdSense ad unit component.
 * In production: renders a real AdSense <ins> tag.
 * In development: renders realistic demo ads that simulate real advertisements.
 */
export default function AdUnit({ 
  adSlot, 
  adFormat = 'auto', 
  variant = 'banner',
  style = {},
  className = '' 
}) {
  const adRef = useRef(null)
  const isInitialized = useRef(false)
  const [demoAd, setDemoAd] = useState(null)

  useEffect(() => {
    // Pick a random demo ad on mount (client only)
    setDemoAd(DEMO_ADS[Math.floor(Math.random() * DEMO_ADS.length)])
  }, [])

  useEffect(() => {
    // Only push to adsbygoogle once per mount, and only in production
    if (process.env.NODE_ENV === 'production' && !isInitialized.current) {
      try {
        if (typeof window !== 'undefined' && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
          isInitialized.current = true
        }
      } catch (err) {
        console.error('AdSense push error:', err)
      }
    }
  }, [])

  // ─── Development: Realistic Demo Ad ───
  if (process.env.NODE_ENV !== 'production') {
    if (!demoAd) {
      // SSR / initial render — return minimal placeholder to avoid hydration mismatch
      return (
        <div className={`w-full rounded-2xl overflow-hidden h-[72px] bg-[var(--theme-glass-bg)] ${className}`} />
      )
    }

    return (
      <div className={`w-full rounded-2xl overflow-hidden relative group ${className}`}>
        {/* "Anunci" label */}
        <div className="absolute top-0 right-0 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-bl-lg text-[8px] text-white/50 font-medium uppercase tracking-widest z-10">
          Anunci
        </div>

        <div 
          className={`w-full bg-gradient-to-r ${demoAd.gradient} px-4 py-3.5 flex items-center gap-3 cursor-pointer transition-all duration-300 hover:brightness-110`}
        >
          {/* Brand logo */}
          <div 
            className={`w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden ${demoAd.logoRound ? 'rounded-full' : 'rounded-lg'}`}
            style={{ 
              backgroundColor: demoAd.logoRound ? `${demoAd.accentColor}15` : 'transparent',
              border: demoAd.logoRound ? `1.5px solid ${demoAd.accentColor}30` : 'none',
            }}
          >
            <img 
              src={demoAd.logo} 
              alt={demoAd.brand} 
              className="object-contain"
              style={{ 
                width: demoAd.logoRound ? '22px' : 'auto', 
                height: demoAd.logoRound ? '22px' : '18px' 
              }}
            />
          </div>

          {/* Ad content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span 
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: `${demoAd.brandColor}90` }}
              >
                {demoAd.brand}
              </span>
              <span className="text-white/20 text-[8px]">·</span>
              <span className="text-white/30 text-[8px]">Sponsoritzat</span>
            </div>
            <h4 
              className="text-[13px] font-semibold leading-tight truncate"
              style={{ color: demoAd.brandColor }}
            >
              {demoAd.headline}
            </h4>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: `${demoAd.brandColor}70` }}>
              {demoAd.description}
            </p>
          </div>

          {/* CTA button */}
          <div 
            className="px-3.5 py-1.5 rounded-full text-[10px] font-semibold shrink-0 flex items-center gap-1.5 transition-all duration-300 group-hover:scale-105"
            style={{ 
              backgroundColor: demoAd.accentColor,
              color: ['#ffffff', '#e2e2e2'].includes(demoAd.accentColor) ? '#000' : '#fff'
            }}
          >
            {demoAd.cta}
            <ExternalLink size={9} />
          </div>
        </div>
      </div>
    )
  }

  // ─── Production: Real AdSense ───
  return (
    <div className={`w-full rounded-2xl overflow-hidden relative ${className}`}>
      {/* "Ad" label for transparency */}
      <div className="absolute top-0 right-0 bg-[var(--theme-glass-bg)] px-2 py-0.5 rounded-bl-lg text-[9px] text-[var(--theme-text-muted)] font-medium uppercase tracking-wider z-10 backdrop-blur-sm">
        Ad
      </div>

      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}
