'use client'

import { useState, useTransition } from 'react'
import { 
  Crown, 
  Search, 
  Sparkles, 
  User, 
  RefreshCw, 
  X, 
  Copy, 
  Check, 
  Shirt, 
  Layers, 
  Calendar, 
  CreditCard,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { changePlan, resetAIUsage } from './actions'

export default function AdminDashboardClient({ initialProfiles = [], stats = {} }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('all') // 'all', 'pro', 'free'
  const [filterActivity, setFilterActivity] = useState('all') // 'all', 'high_ia', 'large_wardrobe'
  const [selectedUser, setSelectedUser] = useState(null)
  
  // Clipboard copy state
  const [copiedId, setCopiedId] = useState(null)

  // Toast feedback state
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', message: '' }

  const [isPending, startTransition] = useTransition()
  const [actionLoading, setActionLoading] = useState(null) // 'plan' or 'reset_ia'

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Handle plan change
  const handlePlanToggle = async (userToUpdate) => {
    const newPlan = userToUpdate.plan === 'free' ? 'pro' : 'free'
    setActionLoading('plan')
    
    // Optimistic Update
    const prevProfiles = [...profiles]
    setProfiles(profiles.map(p => 
      p.id === userToUpdate.id ? { ...p, plan: newPlan } : p
    ))
    if (selectedUser && selectedUser.id === userToUpdate.id) {
      setSelectedUser({ ...selectedUser, plan: newPlan })
    }

    const result = await changePlan(userToUpdate.id, newPlan)
    
    setActionLoading(null)
    if (result.success) {
      showToast(`Pla de ${userToUpdate.full_name || 'l\'usuari'} actualitzat a ${newPlan.toUpperCase()} correctament!`)
    } else {
      // Revert if error
      setProfiles(prevProfiles)
      if (selectedUser && selectedUser.id === userToUpdate.id) {
        setSelectedUser(userToUpdate)
      }
      showToast(result.error || 'Error al canviar el pla', 'error')
    }
  }

  // Handle AI Reset
  const handleAIReset = async (userToUpdate) => {
    setActionLoading('reset_ia')
    
    // Optimistic Update
    const prevProfiles = [...profiles]
    setProfiles(profiles.map(p => 
      p.id === userToUpdate.id ? { ...p, outfit_generations_used: 0 } : p
    ))
    if (selectedUser && selectedUser.id === userToUpdate.id) {
      setSelectedUser({ ...selectedUser, outfit_generations_used: 0 })
    }

    const result = await resetAIUsage(userToUpdate.id)
    
    setActionLoading(null)
    if (result.success) {
      showToast(`Generacions de IA de ${userToUpdate.full_name || 'l\'usuari'} restablertes a 0!`)
    } else {
      // Revert if error
      setProfiles(prevProfiles)
      if (selectedUser && selectedUser.id === userToUpdate.id) {
        setSelectedUser(userToUpdate)
      }
      showToast(result.error || 'Error al restablir l\'ús de la IA', 'error')
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    showToast('ID copiat al porta-retalls!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtering Logic
  const filteredProfiles = profiles.filter(profile => {
    const nameMatch = (profile.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const idMatch = profile.id.toLowerCase().includes(searchTerm.toLowerCase())
    const searchMatch = nameMatch || idMatch

    const planMatch = filterPlan === 'all' || profile.plan === filterPlan

    let activityMatch = true
    if (filterActivity === 'high_ia') {
      activityMatch = profile.outfit_generations_used > 5
    } else if (filterActivity === 'large_wardrobe') {
      activityMatch = profile.garments_count > 5
    }

    return searchMatch && planMatch && activityMatch
  })

  // Circular progress math for selected user (limit = 20)
  const renderAIUsageCircle = (used = 0) => {
    const limit = 20
    const radius = 34
    const circumference = 2 * Math.PI * radius
    const percentage = Math.min((used / limit) * 100, 100)
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-brand-accent transition-all duration-500 ease-out"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-white">{used}</span>
          <span className="text-[10px] text-zinc-500 font-bold">/ {limit}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-24">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl glass-strong border border-white/10 shadow-2xl animate-fadeInUp max-w-[90vw] text-sm">
          {toast.type === 'error' ? (
            <AlertCircle className="text-red-400 shrink-0" size={18} />
          ) : (
            <CheckCircle2 className="text-brand-accent shrink-0" size={18} />
          )}
          <span className="font-semibold text-white">{toast.message}</span>
        </div>
      )}

      {/* ─── HERO STATS CARDS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Total Users */}
        <div className="glass rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Usuaris</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black text-white">{stats.totalUsers}</span>
            <span className="text-xs text-zinc-500 font-semibold">actius</span>
          </div>
        </div>

        {/* Pro Conversion */}
        <div className="glass rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform text-brand-accent">
            <Crown size={40} />
          </div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
            Pro Users
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-brand-accent">{stats.proUsers}</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-brand-accent/15 text-brand-accent text-[9px] font-black">
              <TrendingUp size={8} /> {stats.proConversion}%
            </span>
          </div>
        </div>

        {/* Total Clothes (Garments) */}
        <div className="glass rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform text-brand-primary">
            <Shirt size={40} />
          </div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Armari</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black text-white">{stats.totalGarments}</span>
            <span className="text-xs text-zinc-500 font-semibold">peces</span>
          </div>
        </div>

        {/* Total Generated Outfits */}
        <div className="glass rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform text-brand-secondary">
            <Sparkles size={40} />
          </div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Outfits Creats</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black text-white">{stats.totalOutfits}</span>
            <span className="text-xs text-zinc-500 font-semibold">outfits</span>
          </div>
        </div>

      </div>

      {/* ─── FILTERS & SEARCH PANEL ─── */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-3.5">
        
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Cerca per nom o ID de perfil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 focus:border-brand-accent/30 focus:bg-white/10 outline-none text-sm text-white placeholder-zinc-500 transition-all font-semibold"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full text-zinc-400"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Pills */}
        <div className="flex flex-col gap-2.5">
          {/* Plan filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider shrink-0 mr-1">Pla:</span>
            <button
              onClick={() => setFilterPlan('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                filterPlan === 'all' 
                  ? 'bg-brand-accent text-zinc-950 shadow-[0_0_10px_rgba(3,218,198,0.3)]' 
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400 border border-transparent'
              }`}
            >
              Tots ({profiles.length})
            </button>
            <button
              onClick={() => setFilterPlan('pro')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                filterPlan === 'pro' 
                  ? 'bg-gradient-to-r from-brand-accent to-emerald-400 text-zinc-950 shadow-[0_0_10px_rgba(3,218,198,0.3)]' 
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400'
              }`}
            >
              <Crown size={10} strokeWidth={3} /> Pro ({profiles.filter(p => p.plan === 'pro').length})
            </button>
            <button
              onClick={() => setFilterPlan('free')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                filterPlan === 'free' 
                  ? 'bg-zinc-100 text-zinc-950' 
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400'
              }`}
            >
              Free ({profiles.filter(p => p.plan === 'free').length})
            </button>
          </div>

          {/* Activity filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider shrink-0 mr-1">Actiu:</span>
            <button
              onClick={() => setFilterActivity('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                filterActivity === 'all' 
                  ? 'bg-zinc-200 text-zinc-950' 
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400'
              }`}
            >
              Qualsevol
            </button>
            <button
              onClick={() => setFilterActivity('high_ia')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                filterActivity === 'high_ia' 
                  ? 'bg-brand-secondary text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400'
              }`}
            >
              <Flame size={10} /> IA &gt; 5 cops
            </button>
            <button
              onClick={() => setFilterActivity('large_wardrobe')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                filterActivity === 'large_wardrobe' 
                  ? 'bg-brand-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400'
              }`}
            >
              <Shirt size={10} /> Armari &gt; 5 peces
            </button>
          </div>
        </div>

      </div>

      {/* ─── USERS MOBILE CARD LIST ─── */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Llista de perfils ({filteredProfiles.length})</h2>
          <span className="text-xs text-zinc-500 font-bold">Clica per gestionar</span>
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-zinc-500 font-semibold">
            {"No s'han trobat perfils que coincideixin."}
          </div>
        ) : (
          filteredProfiles.map((profile, index) => {
            const initials = (profile.full_name || 'Sense Nom').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            
            return (
              <div
                key={profile.id}
                onClick={() => setSelectedUser(profile)}
                className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 active:scale-[0.99] transition-all cursor-pointer group"
                style={{
                  animation: `fadeInUp 0.3s ease-out both`,
                  animationDelay: `${Math.min(index * 40, 500)}ms`
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Dynamic Gradient Avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 shadow-lg ${
                    profile.plan === 'pro' 
                      ? 'bg-gradient-to-tr from-amber-400 via-brand-accent to-emerald-400' 
                      : 'bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-white/10'
                  }`}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : initials}
                  </div>

                  {/* User Meta */}
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-[15px] group-hover:text-brand-accent transition-colors flex items-center gap-1.5">
                      {profile.full_name || 'Sense nom'}
                      {profile.plan === 'pro' && <Crown size={12} className="text-amber-400 shrink-0" />}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono tracking-tighter truncate max-w-[150px] md:max-w-xs mt-0.5">
                      {profile.id}
                    </span>
                  </div>
                </div>

                {/* Quick stats and Chevron */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2.5 text-zinc-400 text-xs font-bold mr-2">
                    <span className="flex items-center gap-0.5 bg-white/5 px-2 py-1 rounded-lg">
                      <Shirt size={11} className="text-brand-primary" /> {profile.garments_count}
                    </span>
                    <span className="flex items-center gap-0.5 bg-white/5 px-2 py-1 rounded-lg">
                      <Sparkles size={11} className="text-brand-secondary" /> {profile.outfits_count}
                    </span>
                    <span className="flex items-center gap-0.5 bg-white/5 px-2 py-1 rounded-lg">
                      <Flame size={11} className="text-brand-accent" /> {profile.outfit_generations_used}
                    </span>
                  </div>
                  
                  {/* Mobile Plan Badge */}
                  {profile.plan === 'pro' ? (
                    <span className="sm:hidden inline-flex px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent text-[9px] font-black uppercase">
                      Pro
                    </span>
                  ) : (
                    <span className="sm:hidden inline-flex px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase">
                      Free
                    </span>
                  )}

                  <ChevronRight size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ─── MOBILE BOTTOM DRAWER / MODAL ─── */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedUser(null)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Sheet / Card Container */}
          <div 
            className="relative w-full sm:max-w-lg bg-[var(--theme-surface)] rounded-t-[2rem] sm:rounded-[2rem] border-t sm:border border-white/10 shadow-2xl p-6 z-50 flex flex-col gap-6 animate-slide-in-right sm:animate-scaleIn max-h-[92vh] overflow-y-auto"
          >
            {/* Header / Pull bar */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white ${
                  selectedUser.plan === 'pro' 
                    ? 'bg-gradient-to-tr from-amber-400 via-brand-accent to-emerald-400' 
                    : 'bg-zinc-800'
                }`}>
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (selectedUser.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                    {selectedUser.full_name || 'Usuari'}
                    {selectedUser.plan === 'pro' && <Crown size={14} className="text-amber-400" />}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                    {selectedUser.role.toUpperCase()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile UUID block */}
            <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 font-black uppercase text-[9px] tracking-widest">Identificador UUID</span>
                <span className="font-mono text-zinc-300 select-all break-all">{selectedUser.id}</span>
              </div>
              <button
                onClick={() => copyToClipboard(selectedUser.id, 'uuid')}
                className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 active:text-brand-accent shrink-0 transition-colors"
                title="Copiar ID"
              >
                {copiedId === 'uuid' ? <Check size={14} className="text-brand-accent" /> : <Copy size={14} />}
              </button>
            </div>

            {/* AI stats circle and clothing stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* AI circle */}
              <div className="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">Ús IA Mensual</span>
                {renderAIUsageCircle(selectedUser.outfit_generations_used)}
                <span className="text-[10px] text-zinc-500 font-semibold text-center mt-1">Generacions fetes aquest mes</span>
              </div>

              {/* Counts metrics */}
              <div className="flex flex-col gap-3">
                <div className="glass rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shirt className="text-brand-primary" size={18} />
                    <span className="text-xs font-bold text-zinc-300">Peces de roba</span>
                  </div>
                  <span className="text-xl font-black text-white">{selectedUser.garments_count}</span>
                </div>

                <div className="glass rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="text-brand-secondary" size={18} />
                    <span className="text-xs font-bold text-zinc-300">Outfits creats</span>
                  </div>
                  <span className="text-xl font-black text-white">{selectedUser.outfits_count}</span>
                </div>

                <div className="glass rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-brand-accent" size={18} />
                    <span className="text-xs font-bold text-zinc-300">Reseteig de IA</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {selectedUser.outfit_generations_reset_at 
                      ? new Date(selectedUser.outfit_generations_reset_at).toLocaleDateString('ca-ES')
                      : 'Sense data'}
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Stripe Info */}
            <div className="glass rounded-xl p-4 flex flex-col gap-2 text-xs">
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                <CreditCard size={12} /> Facturació Stripe
              </span>
              <div className="flex justify-between">
                <span className="text-zinc-500">Customer ID</span>
                <span className="font-mono text-zinc-300 text-[10px] truncate max-w-[180px]">
                  {selectedUser.stripe_customer_id || 'No disponible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Subscripció</span>
                <span className="font-mono text-zinc-300 text-[10px] truncate max-w-[180px]">
                  {selectedUser.stripe_subscription_id || 'No disponible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Estat Subscripció</span>
                <span className={`font-bold capitalize ${selectedUser.subscription_status === 'active' ? 'text-brand-accent' : 'text-zinc-500'}`}>
                  {selectedUser.subscription_status || 'inactive'}
                </span>
              </div>
            </div>

            {/* ACTIONS PANEL */}
            <div className="flex flex-col gap-2.5 mt-2">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Accions de Gestió</span>
              
              <div className="flex gap-2">
                {/* Pro Toggle */}
                <button
                  disabled={actionLoading !== null}
                  onClick={() => handlePlanToggle(selectedUser)}
                  className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    selectedUser.plan === 'free'
                      ? 'bg-gradient-to-r from-amber-400 to-emerald-400 text-zinc-950 hover:shadow-[0_0_20px_rgba(3,218,198,0.25)] active:scale-[0.98]'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white active:scale-[0.98]'
                  } disabled:opacity-50`}
                >
                  {actionLoading === 'plan' ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : selectedUser.plan === 'free' ? (
                    <>
                      <Crown size={16} strokeWidth={3} /> Fer Pro
                    </>
                  ) : (
                    <>
                      <User size={16} /> Treure Pro
                    </>
                  )}
                </button>

                {/* Reset AI usage */}
                <button
                  disabled={actionLoading !== null}
                  onClick={() => handleAIReset(selectedUser)}
                  className="flex-1 py-3 rounded-xl font-black text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {actionLoading === 'reset_ia' ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      <RefreshCw size={16} /> Restablir IA
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
