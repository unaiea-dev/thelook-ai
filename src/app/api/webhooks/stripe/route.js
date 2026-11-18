import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Cliente admin con service_role — bypassa RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  // 1. Verificar firma del webhook
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log(`📩 Webhook received: ${event.type}`);

  // 2. Procesar eventos
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`ℹ️ Evento no manejado: ${event.type}`);
    }
  } catch (err) {
    console.error('❌ Error processing webhook event:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// --- Helpers ---

/**
 * Busca el perfil por stripe_customer_id.
 * Si no lo encuentra, busca el customer en Stripe para obtener
 * el supabase_user_id de los metadata y actualiza el customer_id en profiles.
 */
async function findProfileByCustomerId(customerId) {
  // Intento 1: buscar directamente por stripe_customer_id
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profile) return profile.id;

  // Intento 2: buscar por supabase_user_id en metadata de Stripe
  console.log(`⚠️ Profile not found by stripe_customer_id, checking Stripe metadata...`);
  const customer = await stripe.customers.retrieve(customerId);
  const supabaseUserId = customer.metadata?.supabase_user_id;

  if (!supabaseUserId) {
    console.error(`❌ No supabase_user_id found in Stripe metadata for customer ${customerId}`);
    return null;
  }

  // Actualizar el stripe_customer_id en el perfil (arregla el link para futuras queries)
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customerId })
    .eq('id', supabaseUserId);

  if (error) {
    console.error(`❌ Error linking stripe_customer_id to profile:`, error);
  } else {
    console.log(`🔗 Linked customer ${customerId} to profile ${supabaseUserId}`);
  }

  return supabaseUserId;
}

// --- Event Handlers ---

async function handleCheckoutCompleted(session) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Recuperar la suscripción para obtener el intervalo
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const interval = subscription.items.data[0]?.price?.recurring?.interval;

  const profileId = await findProfileByCustomerId(customerId);
  if (!profileId) {
    console.error('❌ Could not find profile for checkout.session.completed');
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'pro',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      billing_interval: interval || 'month',
    })
    .eq('id', profileId);

  if (error) {
    console.error('❌ Error updating profile after checkout:', error);
    throw error;
  }

  console.log(`✅ User ${profileId} upgraded to Pro (customer: ${customerId})`);
}

async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;
  const status = subscription.status;
  const interval = subscription.items.data[0]?.price?.recurring?.interval;

  // Estats on l'usuari manté accés Pro:
  // - active: subscripció activa normal
  // - trialing: període de prova (futur)
  // - past_due: pagament fallat però Stripe reintenta (grace period)
  const PRO_STATUSES = ['active', 'trialing', 'past_due'];
  const plan = PRO_STATUSES.includes(status) ? 'pro' : 'free';

  const profileId = await findProfileByCustomerId(customerId);
  if (!profileId) {
    console.error('❌ Could not find profile for customer.subscription.updated');
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan,
      subscription_status: status,
      billing_interval: interval || null,
    })
    .eq('id', profileId);

  if (error) {
    console.error('❌ Error updating subscription status:', error);
    throw error;
  }

  console.log(`🔄 Subscription updated: ${status} for profile ${profileId}`);
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;

  const profileId = await findProfileByCustomerId(customerId);
  if (!profileId) {
    console.error('❌ Could not find profile for customer.subscription.deleted');
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'free',
      stripe_subscription_id: null,
      subscription_status: 'canceled',
      billing_interval: null,
    })
    .eq('id', profileId);

  if (error) {
    console.error('❌ Error downgrading user after cancellation:', error);
    throw error;
  }

  console.log(`⬇️ User ${profileId} downgraded to Free`);
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;

  const profileId = await findProfileByCustomerId(customerId);
  if (!profileId) return;

  console.warn(`⚠️ Payment failed for profile ${profileId}`);
  
  await supabaseAdmin
    .from('profiles')
    .update({ subscription_status: 'past_due' })
    .eq('id', profileId);
}
