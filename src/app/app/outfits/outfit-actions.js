'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveOutfit({ garment_ids, occasion, weather, style, explanation, style_tip, match_score }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No estàs autenticat' }
    }

    const { data, error } = await supabase
      .from('outfits')
      .insert({
        user_id: user.id,
        garment_ids,
        occasion,
        weather,
        style,
        explanation,
        style_tip,
        match_score
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/app/armari')
    revalidatePath('/app/outfits')
    revalidatePath('/app')
    return { success: true, outfit: data }
  } catch (error) {
    console.error('Error saving outfit:', error)
    return { error: 'Error al guardar l\'outfit' }
  }
}

export async function deleteOutfit(outfitId) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No estàs autenticat' }
    }

    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', outfitId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/app/armari')
    revalidatePath('/app/outfits')
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error deleting outfit:', error)
    return { error: 'Error al eliminar l\'outfit' }
  }
}

export async function toggleFavorite(outfitId, isFavorite) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No estàs autenticat' }
    }

    const { error } = await supabase
      .from('outfits')
      .update({ is_favorite: !isFavorite })
      .eq('id', outfitId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/app/armari')
    revalidatePath('/app/outfits')
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error updating outfit:', error)
    return { error: 'Error al actualitzar favorit' }
  }
}
