'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Shirt, Sparkles, Bot, Ban, Calendar } from 'lucide-react'

import { createCheckoutSession } from '@/app/actions/stripe'

export default function UpgradeModal({ isOpen, onClose, reason = 'garments' }) {
  const router = useRouter()

  if (!isOpen) return null

  const content = {
    garments: {
      title: "Límit de peces assolit",
      icon: <Shirt className="w-10 h-10 text-brand-accent mb-3 mx-auto" />
    },
    outfits: {
      title: "Límit d'outfits assolit",
      icon: <Sparkles className="w-10 h-10 text-brand-accent mb-3 mx-auto" />
    }
  }

  const { title, message, icon } = content[reason] || content.garments

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm glass-strong rounded-2xl p-6 text-center"
        >
          <button 
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300"
          >
            <X size={16} />
          </button>
          
          <div className="mt-3 mb-5">
            {icon}
            <h2 className="text-xl font-semibold mb-1.5 text-[var(--theme-text-primary)]">{title}</h2>
            <p className="text-[var(--theme-text-secondary)] text-xs leading-relaxed">
              {message}
            </p>
          </div>

          <div className="glass-subtle rounded-xl p-3.5 text-left mb-5">
            <h3 className="font-semibold text-brand-accent flex items-center gap-1.5 text-sm mb-2">
              <Crown size={16} className="text-brand-accent" /> Pla Pro
            </h3>
            <ul className="text-xs text-[var(--theme-text-secondary)] space-y-1.5">
              <li className="flex items-center gap-1.5"><Sparkles size={12} className="text-brand-accent" /> Armari sense límits</li>
              <li className="flex items-center gap-1.5"><Bot size={12} className="text-brand-accent" /> IA il·limitada</li>
              <li className="flex items-center gap-1.5"><Ban size={12} className="text-brand-accent" /> Sense anuncis</li>
              <li className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-accent" /> Planificador setmanal</li>
            </ul>
          </div>

          <button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-brand-accent to-emerald-400 text-zinc-950 font-semibold py-3 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(3,218,198,0.25)] hover:-translate-y-0.5 text-sm"
          >
            Passar a Pro — 2.99€/mes
          </button>
          
          <button
            onClick={onClose}
            className="w-full mt-2.5 text-[var(--theme-text-muted)] text-xs font-medium hover:text-[var(--theme-text-primary)] transition-colors duration-300 py-2"
          >
            Potser més endavant
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
