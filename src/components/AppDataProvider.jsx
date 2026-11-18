'use client'

import { useEffect, useRef } from 'react'
import useAppStore from '@/store/useAppStore'
import { createClient } from '@/utils/supabase/client'
import { buildUserPlan } from '@/lib/getUserPlan'

export default function AppDataProvider({ initialData, children }) {
  const { hydrate, isHydrated, isStale, markFresh } = useAppStore()
  const supabaseRef = useRef(null)

  // 1. Hidratar el store sincrònament (evita 1 frame buit)
  const hasHydratedRef = useRef(false)
  if (!hasHydratedRef.current) {
    hydrate(initialData)
    hasHydratedRef.current = true
  }

  // Cargar borrador de sessionStorage solo en el cliente
  useEffect(() => {
    useAppStore.getState().loadDraftGarment()
  }, [])

  // 2. Supabase Realtime: sincronitzar canvis en temps real
  useEffect(() => {
    const supabase = createClient()
    supabaseRef.current = supabase
    const userId = initialData.user?.id
    if (!userId) return

    const channel = supabase
      .channel('app-data')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'garments',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        useAppStore.getState().addGarment(payload.new)
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'garments',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        useAppStore.getState().updateGarment(payload.new.id, payload.new)
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'garments',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        useAppStore.getState().removeGarment(payload.old.id)
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'outfits',
        filter: `user_id=eq.${userId}`,
      }, () => {
        // Per outfits, fem un refresh complet (tenen garment_ids que necessiten resolució)
        refreshOutfits(supabase, userId)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [initialData.user?.id])

  // 3. Background refresh quan l'app torna a ser visible
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && useAppStore.getState().isStale()) {
        await refreshAll()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return children
}

// Funcions auxiliars de refresh
async function refreshAll() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login'
    return
  }

  const [garmentsRes, outfitsRes, profileRes] = await Promise.all([
    supabase.from('garments')
      .select('id, category, subcategory, color, secondary_color, pattern, material, formality, warmth, fit, season, brand, description, tags, image_url, is_favorite, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('outfits')
      .select('id, garment_ids, occasion, weather, style, explanation, style_tip, match_score, is_favorite, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles')
      .select('full_name, avatar_url, plan, role, stripe_customer_id, stripe_subscription_id, billing_interval, subscription_status, outfit_generations_used, outfit_generations_reset_at')
      .eq('id', user.id).single(),
  ])

  useAppStore.getState().hydrate({
    user,
    profile: profileRes.data,
    garments: garmentsRes.data || [],
    outfits: outfitsRes.data || [],
    userPlan: buildUserPlan(profileRes.data, garmentsRes.data?.length || 0),
  })
}

async function refreshOutfits(supabase, userId) {
  const { data } = await supabase.from('outfits')
    .select('id, garment_ids, occasion, weather, style, explanation, style_tip, match_score, is_favorite, created_at')
    .eq('user_id', userId).order('created_at', { ascending: false })
  if (data) {
    useAppStore.setState({ outfits: data })
  }
}
