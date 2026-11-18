import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/app')
  }

  return (
    <div className="min-h-screen bg-app-bg text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/app" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-brand-accent">Admin Dashboard</h1>
          </div>
          <div className="text-sm text-zinc-400">
            {user.email}
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
