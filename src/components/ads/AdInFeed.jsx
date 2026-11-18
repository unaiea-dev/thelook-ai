'use client'

import AdUnit from './AdUnit'

/**
 * In-Feed ad component designed to be inserted between list items.
 * Blends naturally with the app's glassmorphism design.
 * 
 * @param {boolean} show - Whether to show the ad
 * @param {string} adSlot - AdSense ad slot ID
 * @param {string} className - Additional CSS classes
 */
export default function AdInFeed({ 
  show = false, 
  adSlot,
  className = '' 
}) {
  if (!show) return null

  return (
    <div className={`w-full ${className}`}>
      <AdUnit 
        adSlot={adSlot || process.env.NEXT_PUBLIC_AD_SLOT_INFEED}
        adFormat="fluid"
        variant="infeed"
        style={{ 
          display: 'block',
          textAlign: 'center'
        }}
      />
    </div>
  )
}
