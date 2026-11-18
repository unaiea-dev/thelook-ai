import Script from 'next/script'

/**
 * Google AdSense script loader — loads ONCE in the root layout.
 * Only loads in production to avoid development issues.
 */
export default function GoogleAdSense() {
  if (process.env.NODE_ENV !== 'production') return null

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  if (!clientId) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
