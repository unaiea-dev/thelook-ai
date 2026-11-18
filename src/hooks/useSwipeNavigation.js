'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const routes = [
  '/app/armari',
  '/app/afegir',
  '/app',
  '/app/outfits',
  '/app/perfil',
]

export function useSwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  
  const [offset, setOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  
  const touchStart = useRef({ x: 0, y: 0 })
  const isHorizontal = useRef(null)
  const isInsideScrollable = useRef(false)
  
  // To avoid rapid multi-swipes
  const isNavigating = useRef(false)

  useEffect(() => {
    isNavigating.current = false
    setOffset(0)
    setIsSwiping(false)
  }, [pathname])

  // Check if the touch target is inside a horizontally scrollable container
  const checkIfInsideScrollable = (target) => {
    let el = target
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el)
      const overflowX = style.getPropertyValue('overflow-x')
      if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
        return true
      }
      el = el.parentElement
    }
    return false
  }

  const handleTouchStart = useCallback((e) => {
    if (isNavigating.current) return
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    isHorizontal.current = null
    isInsideScrollable.current = checkIfInsideScrollable(e.target)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (isNavigating.current || isInsideScrollable.current) return
    
    const deltaX = e.touches[0].clientX - touchStart.current.x
    const deltaY = e.touches[0].clientY - touchStart.current.y
    
    if (isHorizontal.current === null) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isHorizontal.current = true
      } else if (Math.abs(deltaY) > 10) {
        isHorizontal.current = false
      }
    }
    
    if (isHorizontal.current) {
      const currentIndex = routes.findIndex(r =>
        r === pathname || (r !== '/app' && pathname.startsWith(r + '/'))
      )
      if (currentIndex === -1) return
      let boundedOffset = deltaX
      
      // Add resistance on the edges
      if (currentIndex === 0 && deltaX > 0) boundedOffset = deltaX * 0.3
      if (currentIndex === routes.length - 1 && deltaX < 0) boundedOffset = deltaX * 0.3
      
      setIsSwiping(true)
      setOffset(boundedOffset)
    }
  }, [pathname])

  const handleTouchEnd = useCallback(() => {
    if (isNavigating.current || !isSwiping || isHorizontal.current === false) return
    
    setIsSwiping(false)
    const threshold = window.innerWidth * 0.2 // 20% of screen width to trigger
    const currentIndex = routes.findIndex(r =>
      r === pathname || (r !== '/app' && pathname.startsWith(r + '/'))
    )
    
    if (offset > threshold && currentIndex > 0) {
      // Swiped right -> Go to previous
      isNavigating.current = true
      router.push(routes[currentIndex - 1])
    } else if (offset < -threshold && currentIndex < routes.length - 1) {
      // Swiped left -> Go to next
      isNavigating.current = true
      router.push(routes[currentIndex + 1])
    } else {
      // Snap back
      setOffset(0)
    }
  }, [isSwiping, offset, pathname, router])

  return { 
    offset, 
    isSwiping,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
