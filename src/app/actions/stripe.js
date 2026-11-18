'use server';

import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Crea o recupera el customer de Stripe vinculado al usuario
 */
async function getOrCreateStripeCustomer(supabase, user) {
  // 1. Buscar si ya tiene customer_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // 2. Crear customer en Stripe
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { supabase_user_id: user.id },
  });

  // 3. Guardar en Supabase
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id);

  return customer.id;
}

/**
 * Crea una Checkout Session y redirige al usuario
 * @param {string} priceId - ID del Price de Stripe
 */
export async function createCheckoutSession(priceId) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  const origin = (await headers()).get('origin');
  const customerId = await getOrCreateStripeCustomer(supabase, user);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${origin}/app/perfil?upgrade=success`,
    cancel_url: `${origin}/pricing`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    // Impuestos automáticos (opcional)
    // automatic_tax: { enabled: true },
  });

  redirect(session.url);
}

/**
 * Crea una sesión del Customer Portal para autogestión
 */
export async function createPortalSession() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    redirect('/pricing');
  }

  const origin = (await headers()).get('origin');
  
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/app/perfil`,
  });

  redirect(portalSession.url);
}

/**
 * Obtiene los detalles de la suscripción actual del usuario.
 * Acepta datos pre-cargados para evitar queries redundantes cuando
 * ya se han obtenido en la página que llama.
 * 
 * @param {Object} opts - Opciones con datos pre-cargados
 * @param {string} opts.stripeSubscriptionId - ID de la subscripció Stripe
 * @param {string} opts.billingInterval - Interval de facturació
 * @returns {Object|null} Datos de la suscripción o null
 */
export async function getSubscriptionDetails(opts = {}) {
  let subscriptionId = opts.stripeSubscriptionId;
  let billingInterval = opts.billingInterval;

  // Si no es passen dades pre-carregades, les busquem (backwards compatible)
  if (!subscriptionId) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id, subscription_status, billing_interval')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_subscription_id) return null;
    subscriptionId = profile.stripe_subscription_id;
    billingInterval = profile.billing_interval;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceItem = subscription.items.data[0];

    return {
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end || priceItem?.current_period_end || priceItem?.period?.end,
      currentPeriodStart: subscription.current_period_start || priceItem?.current_period_start || priceItem?.period?.start,
      interval: priceItem?.price?.recurring?.interval || billingInterval,
      amount: priceItem?.price?.unit_amount || 0,
      currency: priceItem?.price?.currency || 'eur',
      created: subscription.created,
    };
  } catch (err) {
    console.error('Error fetching subscription from Stripe:', err);
    return null;
  }
}

/**
 * Cancela la suscripción al final del período actual
 */
export async function cancelSubscription() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { error: 'No autenticat' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return { error: 'No hi ha subscripció activa' };
  }

  try {
    // Cancela al final del período, no inmediatamente
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Actualizar estado en Supabase
    await supabase
      .from('profiles')
      .update({ subscription_status: 'canceling' })
      .eq('id', user.id);

    return { success: true };
  } catch (err) {
    console.error('Error canceling subscription:', err);
    return { error: 'Error al cancel·lar la subscripció' };
  }
}

/**
 * Reactiva una suscripción que estaba marcada para cancelarse
 */
export async function reactivateSubscription() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { error: 'No autenticat' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return { error: 'No hi ha subscripció activa' };
  }

  try {
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', user.id);

    return { success: true };
  } catch (err) {
    console.error('Error reactivating subscription:', err);
    return { error: 'Error al reactivar la subscripció' };
  }
}
