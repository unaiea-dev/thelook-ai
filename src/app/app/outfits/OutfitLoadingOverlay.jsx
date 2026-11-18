'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Bot } from 'lucide-react'

const LOADING_MESSAGES = [
  'Analitzant el teu armari...',
  'Combinant colors i textures...',
  'Ajustant la proposta al temps d\'avui...',
  'Buscant l\'harmonia perfecta...',
  'Preparant el teu outfit ideal...',
  'El teu estilista virtual gairebé ho té...'
]

export default function OutfitLoadingOverlay({ isVisible }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0)
      setProgress(0)
      return
    }

    // Rotate messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 1500)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev
        const step = Math.random() * 15
        return Math.min(prev + step, 98)
      })
    }, 300)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out] max-w-[480px] mx-auto">
      <div className="relative flex flex-col items-center max-w-xs text-center">
        {/* Glow effect */}
        <div className="absolute w-36 h-36 bg-brand-primary/30 rounded-full blur-[40px] animate-pulseGlow pointer-events-none" />
        
        {/* Animated Icon */}
        <div className="relative mb-8 w-20 h-20 glass-strong rounded-3xl flex items-center justify-center text-brand-accent animate-bounce">
          <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
          <Bot className="absolute w-5 h-5 text-brand-primary bottom-2 right-2 animate-[pulse_1.5s_infinite]" />
        </div>

        {/* Text */}
        <h3 className="text-lg font-semibold tracking-tight text-white mb-2">
          Creant Outfit
        </h3>
        <p className="text-sm text-zinc-400 h-10 px-4 transition-all duration-500 animate-[fadeInUp_0.4s_ease-out] key={messageIndex}">
          {LOADING_MESSAGES[messageIndex]}
        </p>

        {/* Progress Bar Container */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-6 relative">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
