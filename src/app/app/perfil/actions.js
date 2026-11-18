'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No estàs autenticat' }
    }

    const name = formData.get('name')
    if (!name || name.trim().length < 2) {
      return { error: 'El nom ha de tenir almenys 2 caràcters' }
    }

    // Try to update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('id', user.id)

    // Also update auth user metadata just in case
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: name.trim() }
    })

    if (profileError && authError) {
       console.error('Error updating profile:', profileError, authError)
       return { error: 'Error al actualitzar el perfil' }
    }

    revalidatePath('/app/perfil')
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error: 'Error intern del servidor' }
  }
}
