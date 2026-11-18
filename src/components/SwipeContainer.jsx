'use client'

import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const ROUTES = [
  '/app/armari',
  '/app/afegir',
  '/app',
  '/app/outfits',
  '/app/perfil',
]

export default function SwipeContainer({ children }) {
  const { 
    offset, 
    isSwiping, 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd 
  } = useSwipeNavigation()
  
  const pathname = usePathname()
  const [prevPath, setPrevPath] = useState(pathname)
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (prevPath !== pathname) {
      const prevIdx = ROUTES.indexOf(prevPath)
      const currentIdx = ROUTES.indexOf(pathname)
      
      if (prevIdx !== -1 && currentIdx !== -1) {
        if (currentIdx > prevIdx) {
          // Navigated to the right (swipe left)
          setAnimationClass('animate-slide-in-right')
        } else {
          // Navigated to the left (swipe right)
          setAnimationClass('animate-slide-in-left')
        }
      }
      setPrevPath(pathname)
      
      // Remove animation class after it completes
      const timer = setTimeout(() => {
        setAnimationClass('')
      }, 350) 
      return () => clearTimeout(timer)
    }
  }, [pathname, prevPath])

  return (
    <div 
      className="flex-1 w-full relative overflow-x-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <div 
        key={pathname}
        className={`w-full h-full flex flex-col flex-1 will-change-transform ${animationClass}`}
        style={{
          transform: isSwiping ? `translate3d(${offset}px, 0, 0)` : '',
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {children}
      </div>
    </div>
  )
}
