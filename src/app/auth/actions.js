'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState, formData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  redirect('/app')
}

export async function register(prevState, formData) {
  const supabase = await createClient()
  
  // Server validation
  const email = formData.get('email')
  const password = formData.get('password')
  const confirm = formData.get('confirm')
  const name = formData.get('name')

  if (password !== confirm) {
    return { error: 'Les contrasenyes no coincideixen' }
  }

  if (password.length < 8) {
    return { error: 'La contrasenya ha de tenir mínim 8 caràcters' }
  }

  const data = {
    email,
    password,
    options: {
      data: { full_name: name }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)
  
  if (error) {
    return { error: error.message }
  }

  // Check if email confirmation is required (Supabase standard behavior)
  if (authData?.user && authData?.session === null) {
    return { success: 'Revisa el teu correu electrònic per confirmar el compte.' }
  }
  
  revalidatePath('/', 'layout')
  redirect('/app')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
