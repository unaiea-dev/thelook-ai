import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

/**
 * Sessió d'autenticació cacheada per request.
 * React.cache() assegura que getUser() només s'executa UNA vegada
 * per renderització del servidor, encara que el cridin layout + page + getUserPlan.
 * 
 * IMPORTANT: Cada page/component ha de crear el seu propi client Supabase
 * per a queries de dades (via createClient), però pot reutilitzar l'usuari cachejat.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
})
