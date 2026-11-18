'use client'

import { useEffect, useState } from 'react'
import useAppStore from '@/store/useAppStore'
import ProfileForm from './ProfileForm'
import { Shirt, Sparkles, Heart, LogOut, Folder } from 'lucide-react'

import PlanBadge from '@/components/PlanBadge'
import UpgradeSuccess from './UpgradeSuccess'
import { getSubscriptionDetails } from '@/app/actions/stripe'
import SubscriptionManager from '@/components/SubscriptionManager'
import ThemeToggle from '@/components/ThemeToggle'
import { AdBannerSmart } from '@/components/ads'

export default function PerfilPage() {
  const user = useAppStore(s => s.user)
  const profile = useAppStore(s => s.profile)
  const garments = useAppStore(s => s.garments)
  const outfits = useAppStore(s => s.outfits)
  const userPlan = useAppStore(s => s.userPlan)
  const [subscriptionDetails, setSubscriptionDetails] = useState(null)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const garmentCount = garments.length
  const outfitCount = outfits.length
  const favCount = outfits.filter(o => o.is_favorite).length
  const categoriesCount = new Set(garments.map(g => g.category)).size

  const isPro = userPlan?.plan === 'pro'

  useEffect(() => {
    async function fetchStripeDetails() {
      if (isPro && profile?.stripe_subscription_id) {
        const details = await getSubscriptionDetails({
          stripeSubscriptionId: profile.stripe_subscription_id,
          billingInterval: profile.billing_interval,
        })
        setSubscriptionDetails(details)
      }
    }
    fetchStripeDetails()
  }, [isPro, profile?.stripe_subscription_id, profile?.billing_interval])

  if (!user) return null

  return (
    <div className="flex flex-col gap-5 py-4 pb-20 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--theme-text-primary)]">Perfil</h1>
        <ThemeToggle />
      </div>

      <UpgradeSuccess />

      {/* Avatar Card */}
      <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-20 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 pointer-events-none" />
        
        {/* Avatar with Free/Pro ring */}
        <div className="relative z-10 mb-3">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-app-primary to-app-accent text-white font-semibold text-3xl flex items-center justify-center border-4 border-app-bg ${
            isPro 
              ? 'ring-2 ring-brand-accent/60 shadow-[0_0_25px_rgba(3,218,198,0.3)]' 
              : 'ring-2 ring-[var(--theme-glass-border)]'
          }`}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          {isPro && (
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-accent/20 to-brand-primary/20 blur-md animate-pulseGlow pointer-events-none -z-10" />
          )}
        </div>
        
        <div className="mb-3 z-10 relative">
          <PlanBadge plan={userPlan?.plan || 'free'} />
        </div>
        
        <ProfileForm initialName={displayName} email={user.email} />
      </div>

      {/* Stats */}
      <h2 className="text-base font-semibold text-[var(--theme-text-primary)]">Estadístiques</h2>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5">
          <Shirt size={24} className="text-brand-accent" />
          <span className="text-xl font-semibold text-[var(--theme-text-primary)]">{garmentCount}</span>
          <span className="text-[9px] text-[var(--theme-text-muted)] uppercase tracking-wider font-semibold">Peces</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5">
          <Folder size={24} className="text-[var(--theme-text-secondary)]" />
          <span className="text-xl font-semibold text-[var(--theme-text-primary)]">{categoriesCount}</span>
          <span className="text-[9px] text-[var(--theme-text-muted)] uppercase tracking-wider font-semibold">Categories</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5">
          <Sparkles size={24} className="text-brand-primary" />
          <span className="text-xl font-semibold text-[var(--theme-text-primary)]">{outfitCount}</span>
          <span className="text-[9px] text-[var(--theme-text-muted)] uppercase tracking-wider font-semibold">Outfits</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5">
          <Heart size={24} className="text-brand-secondary" />
          <span className="text-xl font-semibold text-[var(--theme-text-primary)]">{favCount}</span>
          <span className="text-[9px] text-[var(--theme-text-muted)] uppercase tracking-wider font-semibold">Preferits</span>
        </div>
      </div>

      {/* Plan Progress */}
      <h2 className="text-base font-semibold text-[var(--theme-text-primary)]">El teu pla</h2>
      <div className="glass rounded-2xl p-5 flex flex-col gap-4">
        {userPlan && (
          <>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-[var(--theme-text-secondary)]">Peces de roba</span>
                <span className="text-[var(--theme-text-muted)]">{userPlan.garmentsUsed} / {userPlan.limits.maxGarments === Infinity ? '∞' : userPlan.limits.maxGarments}</span>
              </div>
              <div className="w-full bg-[var(--theme-border)] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-1.5 rounded-full bg-gradient-to-r from-app-primary to-brand-accent transition-all duration-500" 
                  style={{ width: `${userPlan.limits.maxGarments === Infinity ? 100 : Math.min(100, (userPlan.garmentsUsed / userPlan.limits.maxGarments) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-[var(--theme-text-secondary)]">Outfits IA (mensual)</span>
                <span className="text-[var(--theme-text-muted)]">{userPlan.outfitGenerationsUsed} / {userPlan.limits.maxOutfitGenerations === Infinity ? '∞' : userPlan.limits.maxOutfitGenerations}</span>
              </div>
              <div className="w-full bg-[var(--theme-border)] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-1.5 rounded-full bg-gradient-to-r from-app-primary to-brand-accent transition-all duration-500" 
                  style={{ width: `${userPlan.limits.maxOutfitGenerations === Infinity ? 100 : Math.min(100, (userPlan.outfitGenerationsUsed / userPlan.limits.maxOutfitGenerations) * 100)}%` }}
                />
              </div>
            </div>
            
            {userPlan.plan === 'free' && (
              <a 
                href="/pricing" 
                className="mt-1 w-full py-3 rounded-xl font-semibold text-sm text-center bg-gradient-to-r from-brand-accent to-emerald-400 text-zinc-950 shadow-[0_4px_20px_rgba(3,218,198,0.25)] transition-all duration-300 hover:-translate-y-0.5"
              >
                Passar a Pro
              </a>
            )}
          </>
        )}
      </div>

      {/* Subscription Management (Pro only) */}
      {isPro && subscriptionDetails && (
        <>
          <h2 className="text-base font-semibold text-[var(--theme-text-primary)]">Subscripció</h2>
          <SubscriptionManager subscription={subscriptionDetails} />
        </>
      )}

      {/* Ad before account section — only for free users */}
      <AdBannerSmart 
        show={!isPro} 
        adSlot={process.env.NEXT_PUBLIC_AD_SLOT_PROFILE}
        variant="compact"
      />

      {/* Account */}
      <h2 className="text-base font-semibold text-[var(--theme-text-primary)]">Compte</h2>
      <div className="glass rounded-2xl p-1.5">
        <form action="/auth/signout" method="POST">
          <button type="submit" className="w-full flex items-center gap-3 p-3.5 text-[var(--theme-danger)] hover:bg-[var(--theme-danger-hover)] rounded-xl transition-all duration-300 font-medium text-sm">
            <div className="w-9 h-9 rounded-full glass-subtle flex items-center justify-center text-sm">
              <LogOut size={16} />
            </div>
            <span>Tancar sessió</span>
          </button>
        </form>
      </div>
    </div>
  )
}
