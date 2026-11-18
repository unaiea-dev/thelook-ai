'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Camera, Shirt, Sparkles, User } from 'lucide-react'
import useAppStore from '@/store/useAppStore'

const navItems = [
  { path: '/app/armari', icon: Shirt },
  { path: '/app/afegir', icon: Camera },
  { path: '/app', icon: Home },
  { path: '/app/outfits', icon: Sparkles },
  { path: '/app/perfil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const draftGarment = useAppStore(s => s.draftGarment)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--theme-nav-bg)] border-t border-[var(--theme-border)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto max-w-[480px] flex justify-around items-center h-[52px]">
        {navItems.map((item) => {
          const isActive = item.path === '/app' 
            ? pathname === '/app' 
            : pathname === item.path || pathname.startsWith(item.path + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center w-12 h-full transition-all duration-300 ${isActive ? 'text-[var(--theme-text-primary)]' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-secondary)]'}`}
            >
              <Icon className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} size={22} strokeWidth={isActive ? 2.5 : 1.75} />
              
              {/* Notificació de Borrador */}
              {item.path === '/app/afegir' && draftGarment && !isActive && (
                <span className="absolute top-[8px] right-[10px] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--theme-nav-bg)] shadow-sm animate-pulse" />
              )}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
