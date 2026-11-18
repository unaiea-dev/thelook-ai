import { createClient } from '@/utils/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'

export const metadata = {
  title: 'Admin Dashboard - thelook'
}

export default async function AdminPage() {
  const supabase = await createClient()

  // Fetch all profiles, garments and outfits in parallel
  const [profilesRes, garmentsRes, outfitsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false }),
    supabase
      .from('garments')
      .select('user_id'),
    supabase
      .from('outfits')
      .select('user_id')
  ])

  if (profilesRes.error) {
    return <div className="text-red-500 p-6">Error carregant dades: {profilesRes.error.message}</div>
  }

  const profiles = profilesRes.data || []
  const garments = garmentsRes.data || []
  const outfits = outfitsRes.data || []

  // Count garments and outfits per user in memory
  const garmentCounts = {}
  garments.forEach(g => {
    if (g.user_id) {
      garmentCounts[g.user_id] = (garmentCounts[g.user_id] || 0) + 1
    }
  })

  const outfitCounts = {}
  outfits.forEach(o => {
    if (o.user_id) {
      outfitCounts[o.user_id] = (outfitCounts[o.user_id] || 0) + 1
    }
  })

  // Enhance profiles with counts
  const enhancedProfiles = profiles.map(p => ({
    ...p,
    garments_count: garmentCounts[p.id] || 0,
    outfits_count: outfitCounts[p.id] || 0
  }))

  // Calculate metrics
  const totalUsers = profiles.length
  const proUsers = profiles.filter(p => p.plan === 'pro').length
  const freeUsers = totalUsers - proUsers
  const proConversion = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0
  const totalGarments = garments.length
  const totalOutfits = outfits.length

  const stats = {
    totalUsers,
    proUsers,
    freeUsers,
    proConversion,
    totalGarments,
    totalOutfits
  }

  return (
    <AdminDashboardClient initialProfiles={enhancedProfiles} stats={stats} />
  )
}

