import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id, garment_ids } = await request.json()

    if (!id || !garment_ids || !Array.isArray(garment_ids)) {
      return NextResponse.json({ error: 'ID i garment_ids són requerits' }, { status: 400 })
    }

    // Update the outfit in Supabase verifying ownership
    const { data, error } = await supabase
      .from('outfits')
      .update({ garment_ids })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, outfit: data })

  } catch (error) {
    console.error('Error updating outfit:', error)
    return NextResponse.json(
      { error: 'Error intern en actualitzar l\'outfit' }, 
      { status: 500 }
    )
  }
}
