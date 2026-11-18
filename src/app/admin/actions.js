'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changePlan(userId, newPlan) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autoritzat' }

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'No tens permisos' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', userId)

    if (error) {
      console.error('Update error:', error)
      return { error: 'No s\'ha pogut actualitzar a la base de dades' }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error changing plan:', error)
    return { error: 'Error al canviar el pla' }
  }
}

export async function resetAIUsage(userId) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autoritzat' }

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { error: 'No tens permisos' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ outfit_generations_used: 0 })
      .eq('id', userId)

    if (error) {
      console.error('Reset AI error:', error)
      return { error: 'No s\'ha pogut actualitzar a la base de dades' }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error resetting AI usage:', error)
    return { error: 'Error al restablir l\'ús de la IA' }
  }
}

