import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

import BottomNav from '@/components/BottomNav'
import SwipeContainer from '@/components/SwipeContainer'
import AppDataProvider from '@/components/AppDataProvider'
import { getAuthUser } from '@/lib/auth'
import { buildUserPlan } from '@/lib/getUserPlan'

export default async function AppLayout({ children }) {
  // Auth cachejat amb React.cache() — reutilitza el resultat si ja s'ha cridat
  const { user, error } = await getAuthUser()

  if (error || !user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch centralitzat: UNA sola query a profiles (amb columnes de plan),
  // garments i outfits en paral·lel. getUserPlan ja no fa queries pròpies.
  const [profileResult, garmentsResult, outfitsResult] = await Promise.all([
    supabase.from('profiles')
      .select('full_name, avatar_url, plan, role, stripe_customer_id, stripe_subscription_id, billing_interval, subscription_status, outfit_generations_used, outfit_generations_reset_at')
      .eq('id', user.id).single(),
    supabase.from('garments')
      .select('id, category, subcategory, color, secondary_color, pattern, material, formality, warmth, fit, season, brand, description, tags, image_url, is_favorite, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('outfits')
      .select('id, garment_ids, occasion, weather, style, explanation, style_tip, match_score, is_favorite, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  // Calculem el pla sense queries extra
  const userPlan = buildUserPlan(
    profileResult.data,
    garmentsResult.data?.length || 0,
    supabase,
    user.id
  )

  // Sanititzem l'objecte user per no enviar metadades d'auth al client
  const safeUser = {
    id: user.id,
    email: user.email,
    user_metadata: { full_name: user.user_metadata?.full_name },
  }

  const initialData = {
    user: safeUser,
    profile: profileResult.data,
    garments: garmentsResult.data || [],
    outfits: outfitsResult.data || [],
    userPlan,
  }

  return (
    <AppDataProvider initialData={initialData}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pt-4 pb-24 max-w-[480px] mx-auto w-full px-5 flex flex-col">
          <SwipeContainer>
            {children}
          </SwipeContainer>
        </main>
        <BottomNav />
      </div>
    </AppDataProvider>
  )
}
