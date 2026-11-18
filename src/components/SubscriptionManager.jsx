'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cancelSubscription, reactivateSubscription } from '@/app/actions/stripe'
import { Crown, Calendar, CreditCard, RefreshCw, Ban, Loader2, AlertTriangle } from 'lucide-react'

export default function SubscriptionManager({ subscription }) {
  const [isPending, startTransition] = useTransition()
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)
  const [localSub, setLocalSub] = useState(subscription)
  const [feedback, setFeedback] = useState(null)

  if (!localSub) return null

  const nextPaymentDate = localSub.currentPeriodEnd ? new Date(localSub.currentPeriodEnd * 1000) : null
  const startDate = localSub.created ? new Date(localSub.created * 1000) : null
  const isCanceling = localSub.cancelAtPeriodEnd

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return 'Calculant...'
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100)
  }

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelSubscription()
      if (result.success) {
        setLocalSub({ ...localSub, cancelAtPeriodEnd: true })
        setShowConfirmCancel(false)
        setFeedback({ type: 'info', message: 'La subscripció es cancel·larà al final del període.' })
      } else {
        setFeedback({ type: 'error', message: result.error })
      }
      setTimeout(() => setFeedback(null), 5000)
    })
  }

  const handleReactivate = () => {
    startTransition(async () => {
      const result = await reactivateSubscription()
      if (result.success) {
        setLocalSub({ ...localSub, cancelAtPeriodEnd: false })
        setFeedback({ type: 'success', message: 'La subscripció s\'ha reactivat correctament!' })
      } else {
        setFeedback({ type: 'error', message: result.error })
      }
      setTimeout(() => setFeedback(null), 5000)
    })
  }

  useEffect(() => {
    if (showConfirmCancel) {
      // Calculate scrollbar width to prevent layout shift when overflow becomes hidden
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [showConfirmCancel])

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {/* Feedback Messages */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-2xl text-sm font-medium text-center ${
              feedback.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
              feedback.type === 'info' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
              'bg-red-500/15 text-red-400 border border-red-500/20'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canceling Warning Banner */}
      {isCanceling && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
          <p className="text-amber-400 text-sm font-semibold mb-1">
            <AlertTriangle size={16} className="inline-block mr-1" /> Subscripció programada per cancel·lar-se
          </p>
          <p className="text-amber-400/70 text-xs">
            Mantindràs l&apos;accés Pro fins el {formatDate(nextPaymentDate)}
          </p>
        </div>
      )}

      {/* Subscription Info Card */}
      <div className="glass rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <Crown className="text-zinc-950 text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--theme-text-primary)]">Pla Pro</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isCanceling 
                  ? 'bg-amber-500/15 text-amber-400' 
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                {isCanceling ? 'Cancel·lant-se' : 'Actiu'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-[var(--theme-text-primary)]">
              {formatPrice(localSub.amount, localSub.currency)}
            </span>
            <span className="text-[var(--theme-text-secondary)] text-sm">
              /{localSub.interval === 'year' ? 'any' : 'mes'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
            <Calendar className="text-brand-accent w-4 h-4" />
            <div className="flex-1">
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">
                {isCanceling ? 'Accés fins a' : 'Proper pagament'}
              </p>
              <p className="text-sm text-[var(--theme-text-primary)] font-semibold">
                {formatDate(nextPaymentDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
            <CreditCard className="text-brand-primary w-4 h-4" />
            <div className="flex-1">
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Membre des de</p>
              <p className="text-sm text-[var(--theme-text-primary)] font-semibold">
                {formatDate(startDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isCanceling ? (
            <button
              onClick={handleReactivate}
              disabled={isPending}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-accent to-emerald-400 text-zinc-950 text-center hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Reactivar subscripció
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowConfirmCancel(true)}
                disabled={isPending}
                className="w-full py-3 rounded-xl font-medium text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Cancel·lar subscripció
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showConfirmCancel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => setShowConfirmCancel(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80"
              style={{ willChange: 'opacity' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 text-center shadow-2xl"
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                  <Ban className="text-red-400 w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-2">
                  Segur que vols cancel·lar?
                </h3>
                <p className="text-[var(--theme-text-secondary)] text-sm mb-1">
                  Mantindràs l&apos;accés Pro fins el:
                </p>
                <p className="text-[var(--theme-text-primary)] font-bold text-lg mb-4">
                  {formatDate(nextPaymentDate)}
                </p>
                <p className="text-[var(--theme-text-muted)] text-xs mb-6">
                  Després tornaràs al pla Bàsic amb les seves limitacions.
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="w-full py-3 rounded-xl font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                    ) : (
                      'Sí, cancel·lar subscripció'
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfirmCancel(false)}
                    className="w-full py-3 rounded-xl font-semibold text-[var(--theme-text-primary)] glass hover:bg-[var(--theme-hover)] transition-all duration-300"
                  >
                    No, mantenir Pro
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

