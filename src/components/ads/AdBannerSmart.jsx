'use client'

import AdUnit from './AdUnit'
import Link from 'next/link'
import { Crown, Ban } from 'lucide-react'

/**
 * Smart Ad Banner that only shows for free users.
 * Includes a subtle "Upgrade to remove ads" CTA.
 * 
 * @param {boolean} show - Whether to show the ad (typically userPlan?.plan === 'free')
 * @param {string} adSlot - AdSense ad slot ID
 * @param {string} variant - 'banner' | 'infeed' | 'compact'
 * @param {string} className - Additional CSS classes
 */
export default function AdBannerSmart({ 
  show = false, 
  adSlot,
  variant = 'banner',
  className = '' 
}) {
  if (!show) return null

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <AdUnit 
        adSlot={adSlot || process.env.NEXT_PUBLIC_AD_SLOT_DEFAULT}
        variant={variant}
      />
      
      {/* Subtle upgrade CTA below the ad */}
      <Link 
        href="/pricing"
        className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--theme-text-muted)] hover:text-brand-accent transition-colors duration-300 py-1 group"
      >
        <Ban size={11} className="group-hover:hidden" />
        <Crown size={11} className="hidden group-hover:block text-brand-accent" />
        <span>Elimina anuncis amb Pro</span>
      </Link>
    </div>
  )
}
