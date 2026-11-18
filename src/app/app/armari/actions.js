'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateGarment(garmentId, data) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No estàs autenticat' }
    }

    // Construïm l'objecte d'update dinàmicament — només els camps que arriben.
    // Així podem reutilitzar aquesta funció per a edicions parcials (ex: is_favorite)
    // sense sobreescriure la resta de camps amb valors per defecte.
    const ALLOWED_FIELDS = {
      category: v => v,
      subcategory: v => v || null,
      color: v => v,
      secondary_color: v => v || null,
      pattern: v => v || 'llis',
      material: v => v || null,
      formality: v => v || 3,
      warmth: v => v || 3,
      fit: v => v || 'regular',
      season: v => v || [],
      brand: v => v || null,
      description: v => v,
      tags: v => v,
      is_favorite: v => v,
    }

    const updatePayload = {}
    for (const [field, transform] of Object.entries(ALLOWED_FIELDS)) {
      if (data[field] !== undefined) {
        updatePayload[field] = transform(data[field])
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return { error: 'No hi ha camps per actualitzar' }
    }

    const { error } = await supabase
      .from('garments')
      .update(updatePayload)
      .eq('id', garmentId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/app/armari')
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error updating garment:', error)
    return { error: 'Error al actualitzar la peça' }
  }
}

export async function deleteGarment(garmentId) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No estàs autenticat' }
    }

    // 1. Obtenir la peça per saber la URL de la imatge i poder-la esborrar de storage
    const { data: garment, error: fetchError } = await supabase
      .from('garments')
      .select('image_url')
      .eq('id', garmentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !garment) {
      throw new Error('Peça no trobada')
    }

    // Extreure el path del bucket a partir de la URL pública
    // La URL té aquest format: https://[project].supabase.co/storage/v1/object/public/garment-photos/[user_id]/[uuid].jpg
    const urlParts = garment.image_url.split('/garment-photos/')
    if (urlParts.length > 1) {
      const storagePath = urlParts[1]
      
      // 2. Esborrar la foto de Storage
      const { error: storageError } = await supabase
        .storage
        .from('garment-photos')
        .remove([storagePath])
        
      if (storageError) {
        console.error('Error esborrant imatge de storage:', storageError)
        // Continuem amb l'eliminació de la base de dades igualment
      }
    }

    // 3. Obtenir outfits on s'hagi usat aquesta peça per treure-la
    const { data: outfits } = await supabase
      .from('outfits')
      .select('id, garment_ids')
      .eq('user_id', user.id)
      .contains('garment_ids', [garmentId])

    if (outfits && outfits.length > 0) {
      const toDelete = []
      const toUpdate = []

      for (const outfit of outfits) {
        const newGarmentIds = outfit.garment_ids.filter(id => id !== garmentId)
        if (newGarmentIds.length === 0) {
          toDelete.push(outfit.id)
        } else {
          toUpdate.push({ id: outfit.id, garment_ids: newGarmentIds })
        }
      }

      await Promise.all([
        toDelete.length > 0
          ? supabase.from('outfits').delete().in('id', toDelete)
          : Promise.resolve(),
        ...toUpdate.map(o =>
          supabase.from('outfits').update({ garment_ids: o.garment_ids }).eq('id', o.id)
        ),
      ])
    }

    // 4. Finalment, eliminar el registre de la peça (la DB ja ho podria fer en cascada si tinguéssim taula de relació, 
    // però com que garment_ids és un array, ho hem de fer manualment)
    const { error: deleteError } = await supabase
      .from('garments')
      .delete()
      .eq('id', garmentId)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    revalidatePath('/app/armari')
    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error deleting garment:', error)
    return { error: 'Error al eliminar la peça' }
  }
}
