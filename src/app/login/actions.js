'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Soporte para redirect dinámico (blog vs app)
  const redirectTo = formData.get('redirectTo')
  
  revalidatePath('/', 'layout')
  redirect(redirectTo || '/app')
}

export async function signup(formData) {
  const supabase = await createClient()

  const fullName = formData.get('fullName')

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    options: {
      data: {
        full_name: fullName,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Si venía del blog, indicamos que tras confirmar el email puede volver al blog
  const redirectTo = formData.get('redirectTo')

  revalidatePath('/', 'layout')
  
  return { 
    success: 'Revisa el teu correu electrònic per confirmar el compte.',
    redirectTo: redirectTo || '/app'
  }
}
