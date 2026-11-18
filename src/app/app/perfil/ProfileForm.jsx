'use client'

import { useState } from 'react'
import { updateProfile } from './actions'
import { Pencil } from 'lucide-react'
import useAppStore from '@/store/useAppStore'


export default function ProfileForm({ initialName, email }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(formData) {
    setLoading(true)
    const result = await updateProfile(formData)
    
    if (result.error) {
      alert(result.error)
    } else {
      const newName = formData.get('name')?.trim()
      if (newName) {
        useAppStore.getState().updateProfile({ full_name: newName })
      }
      setIsEditing(false)
    }
    setLoading(false)
  }

  if (isEditing) {
    return (
      <form action={handleSubmit} className="flex flex-col w-full max-w-xs relative z-10 gap-2.5">
        <input 
          type="text" 
          name="name" 
          defaultValue={initialName} 
          className="glass-subtle rounded-xl px-4 py-2.5 text-center text-[var(--theme-text-primary)] font-semibold text-base focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
          autoFocus
          required
        />
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => setIsEditing(false)} 
            className="flex-1 py-2 rounded-lg glass text-xs font-semibold text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] transition-all duration-300"
            disabled={loading}
          >
            Cancel·lar
          </button>
          <button 
            type="submit" 
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-app-primary to-brand-secondary text-white text-xs font-semibold transition-all duration-300 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <span className="w-4 h-4 css-spinner" /> : 'Guardar'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="relative z-10 flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 mb-1 group">
        <h2 className="text-xl font-semibold text-[var(--theme-text-primary)]">{initialName}</h2>
        <button 
          onClick={() => setIsEditing(true)} 
          className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300 sm:opacity-0 group-hover:opacity-100 p-1.5"
          aria-label="Editar nom"
        >
          <Pencil size={12} />
        </button>
      </div>
      <p className="text-[var(--theme-text-muted)] text-xs">{email}</p>
    </div>
  )
}
