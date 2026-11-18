'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserPlan } from '@/lib/getUserPlan'

export async function saveGarment(data) {
  try {
    const supabase = await createClient()
    
    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autoritzat' }
    }

    const { image, category, subcategory, color, secondary_color, pattern, material, formality, warmth, fit, season, brand, description, tags } = data

    if (!image) {
      return { error: 'Falta la imatge' }
    }

    // 1.5. Comprovar límits del pla
    const userPlan = await getUserPlan(supabase, user.id)
    if (userPlan && userPlan.garmentsUsed >= userPlan.limits.maxGarments) {
      return { error: 'Límit de peces assolit. Has de fer-te Pro.', upgrade: true, reason: 'garments' }
    }

    // 2. Upload image to Storage
    const base64Data = image.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Create a unique filename
    const filename = `${crypto.randomUUID()}.jpg`
    const filePath = `${user.id}/${filename}`

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('garment-photos')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
        cacheControl: '31536000'      // 1 any — filename és UUID, immutable
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { error: 'Error al pujar la imatge' }
    }

    // 3. Get public URL (or signed URL depending on bucket privacy, assuming public for now or accessing via client with token)
    const { data: { publicUrl } } = supabase.storage
      .from('garment-photos')
      .getPublicUrl(filePath)

    // 4. Save to Database
    const { data: newGarment, error: dbError } = await supabase
      .from('garments')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        category: category || 'altres',
        subcategory: subcategory || null,
        color: color || '',
        secondary_color: secondary_color || null,
        pattern: pattern || 'llis',
        material: material || null,
        formality: formality || 3,
        warmth: warmth || 3,
        fit: fit || 'regular',
        season: season || [],
        brand: brand || null,
        description: description || '',
        tags: tags || []
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Cleanup the uploaded image if DB insert fails
      await supabase.storage.from('garment-photos').remove([filePath])
      return { error: 'Error al guardar les dades de la peça' }
    }

    // Revalidate wardrobe page
    revalidatePath('/app/armari')
    
    return { success: true, garment: newGarment }
    
  } catch (error) {
    console.error('Save garment error:', error)
    return { error: 'Error intern del servidor' }
  }
}
