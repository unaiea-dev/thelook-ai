'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Camera } from 'lucide-react'

export default function FloatingAddButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <Link 
      href="/app/afegir" 
      className="fixed bottom-[72px] right-4 md:bottom-10 md:right-10 z-[100] flex items-center justify-center shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_25px_rgba(124,58,237,0.5)] hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-app-primary to-brand-secondary text-white rounded-full w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-3.5 group"
      style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
    >
      <Camera size={24} className="md:w-5 md:h-5 md:mr-2" /> 
      <span className="hidden md:inline font-semibold text-sm">Afegir més roba</span>
    </Link>,
    document.body
  )
}
