import { PLAN_LIMITS } from './plans';

/**
 * Construeix el pla d'usuari a partir de dades ja carregades.
 * Evita queries duplicades quan el profile i el recompte de peces
 * ja s'han obtingut al layout.
 */
export function buildUserPlan(profile, garmentsCount, supabase = null, userId = null) {
  if (!profile) return null;

  let outfitGenerationsUsed = profile.outfit_generations_used;
  const resetAt = new Date(profile.outfit_generations_reset_at);
  const nextReset = new Date(resetAt);
  nextReset.setMonth(nextReset.getMonth() + 1);
  const now = new Date();

  // Si ha passat un mes des de l'últim reset, reiniciem el comptador
  if (now > nextReset) {
    outfitGenerationsUsed = 0;
    // Actualitzem a la BD de forma asíncrona per no bloquejar el request
    if (supabase && userId) {
      supabase
        .from('profiles')
        .update({
          outfit_generations_used: 0,
          outfit_generations_reset_at: now.toISOString()
        })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.error('Error resetting outfit generations:', error);
        });
    }
  }

  const limits = PLAN_LIMITS[profile.plan] || PLAN_LIMITS.free;

  return {
    role: profile.role,
    plan: profile.plan,
    garmentsUsed: garmentsCount,
    outfitGenerationsUsed,
    limits,
  };
}

/**
 * @deprecated Utilitza buildUserPlan() amb dades ja carregades per evitar queries duplicades.
 * Mantingut per compatibilitat amb codi que no carrega el profile prèviament.
 */
export async function getUserPlan(supabase, userId) {
  if (!userId) return null;

  const [profileResult, garmentsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('role, plan, outfit_generations_used, outfit_generations_reset_at')
      .eq('id', userId)
      .single(),
    supabase
      .from('garments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const { data: profile, error } = profileResult;
  const { count: garmentsUsed, error: garmentsError } = garmentsResult;

  if (error || !profile) {
    console.error('Error fetching user plan:', error);
    return null;
  }

  if (garmentsError) {
    console.error('Error counting garments:', garmentsError);
  }

  return buildUserPlan(profile, garmentsUsed || 0, supabase, userId);
}
