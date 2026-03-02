import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe, { PRICE_TO_PLAN } from '@/lib/stripe';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sendPaymentFailedEmail } from '@/lib/email';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for subscription management
 */
export async function POST(request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else if (process.env.NODE_ENV === 'production') {
      // NEVER skip signature verification in production
      console.error('[Stripe] STRIPE_WEBHOOK_SECRET is not configured in production!');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    } else {
      // Development only: allow unsigned webhooks with a warning
      console.warn('[Stripe] Webhook secret not configured - skipping signature verification (dev only)');
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * Called when a checkout session successfully completes
 */
async function handleCheckoutCompleted(session) {
  console.log('[Stripe] Checkout completed:', session.id);

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error('User not found:', userId);
    return;
  }

  // Update customer ID if not already set
  if (!user.subscription?.stripeCustomerId) {
    user.subscription = user.subscription || {};
    user.subscription.stripeCustomerId = session.customer;
    await user.save();
  }
}

/**
 * Handle subscription created/updated events
 * Updates user tier and subscription details
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('[Stripe] Subscription updated:', subscription.id, 'Status:', subscription.status);

  const customerId = subscription.customer;
  
  // Find user by Stripe customer ID
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Get the price ID from the subscription
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const planInfo = PRICE_TO_PLAN[priceId] || { tier: 'free', planId: 'none' };

  // Update subscription status
  const status = subscription.status;
  let mappedStatus = 'none';

  if (status === 'active') mappedStatus = 'active';
  else if (status === 'trialing') mappedStatus = 'trialing';
  else if (status === 'past_due') mappedStatus = 'past_due';
  else if (status === 'canceled' || status === 'unpaid') mappedStatus = 'canceled';

  // Update user subscription data
  user.subscription = {
    ...user.subscription,
    status: mappedStatus,
    plan: planInfo.planId,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
  };

  // Update tier based on subscription status
  if (mappedStatus === 'active' || mappedStatus === 'trialing') {
    user.tier = planInfo.tier;
  } else {
    user.tier = 'free';
  }

  await user.save();
  console.log('[Stripe] Updated user', user.email, 'to tier:', user.tier, 'status:', mappedStatus);
}

/**
 * Handle subscription deleted event
 * Downgrades user to free tier
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('[Stripe] Subscription deleted:', subscription.id);

  const customerId = subscription.customer;
  
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Downgrade to free tier
  user.tier = 'free';
  user.subscription.status = 'canceled';
  user.subscription.plan = 'none';
  user.subscription.canceledAt = new Date();
  
  await user.save();
  console.log('[Stripe] Downgraded user', user.email, 'to free tier');
}

/**
 * Handle successful invoice payment
 */
async function handlePaymentSucceeded(invoice) {
  console.log('[Stripe] Payment succeeded for invoice:', invoice.id);
  
  // Payment successful - subscription update event will handle tier changes
  // This is useful for logging/analytics
}

/**
 * Handle failed invoice payment
 */
async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  if (!user) {
    return;
  }

  // Update status to past_due
  user.subscription.status = 'past_due';
  await user.save();

  // Send email notification about failed payment
  await sendPaymentFailedEmail(user.email, user.name);
}

// Note: In Next.js App Router, body parsing is handled automatically.
// We use request.text() in the POST handler to get raw body for Stripe signature verification.
