'use client'

import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown } from 'lucide-react'

import { useEffect, useState, Suspense } from 'react'

function UpgradeSuccessContent() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgrade') === 'success') {
      setShow(true)
      // Auto-hide después de 6 segundos
      const timer = setTimeout(() => setShow(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="glass rounded-2xl p-5 mb-4 text-center bg-gradient-to-r from-brand-accent/10 to-emerald-500/10 border"
        >
          <Crown size={36} className="mx-auto mb-2 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] text-brand-accent" />
          <p className="text-[var(--theme-text-primary)] font-bold text-lg">Benvingut/da al pla Pro! 🎉</p>
          <p className="text-[var(--theme-text-muted)] text-sm mt-1">
            Ja pots gaudir de totes les funcionalitats sense límits.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function UpgradeSuccess() {
  return (
    <Suspense fallback={null}>
      <UpgradeSuccessContent />
    </Suspense>
  )
}
