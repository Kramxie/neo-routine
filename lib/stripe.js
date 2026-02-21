/**
 * Stripe Configuration
 * Handles Stripe client initialization and price mappings
 */

import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export default stripe;

// Price ID mappings from environment variables
export const STRIPE_PRICES = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
  premium_plus_monthly: process.env.STRIPE_PRICE_PREMIUM_PLUS_MONTHLY,
  premium_plus_yearly: process.env.STRIPE_PRICE_PREMIUM_PLUS_YEARLY,
};

// Map price IDs to plan details
export const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY]: {
    planId: 'premium_monthly',
    tier: 'premium',
    name: 'Premium Monthly',
  },
  [process.env.STRIPE_PRICE_PREMIUM_YEARLY]: {
    planId: 'premium_yearly',
    tier: 'premium',
    name: 'Premium Yearly',
  },
  [process.env.STRIPE_PRICE_PREMIUM_PLUS_MONTHLY]: {
    planId: 'premium_plus_monthly',
    tier: 'premium_plus',
    name: 'Premium+ Monthly',
  },
  [process.env.STRIPE_PRICE_PREMIUM_PLUS_YEARLY]: {
    planId: 'premium_plus_yearly',
    tier: 'premium_plus',
    name: 'Premium+ Yearly',
  },
};

/**
 * Get or create a Stripe customer for a user
 * @param {Object} user - User document from MongoDB
 * @returns {Promise<string>} - Stripe customer ID
 */
export async function getOrCreateCustomer(user) {
  // If user already has a Stripe customer ID, return it
  if (user.subscription?.stripeCustomerId) {
    return user.subscription.stripeCustomerId;
  }

  // Create a new customer in Stripe
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user._id.toString(),
    },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout session for subscription
 * @param {Object} params - Checkout parameters
 * @returns {Promise<Object>} - Stripe checkout session
 */
export async function createCheckoutSession({ customerId, priceId, userId, successUrl, cancelUrl }) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId,
    },
    subscription_data: {
      metadata: {
        userId: userId,
      },
    },
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session
 * @param {string} customerId - Stripe customer ID
 * @param {string} returnUrl - URL to return to after portal
 * @returns {Promise<Object>} - Portal session
 */
export async function createPortalSession(customerId, returnUrl) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Cancel a subscription at period end
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} - Updated subscription
 */
export async function cancelSubscription(subscriptionId) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a subscription that was set to cancel
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} - Updated subscription
 */
export async function reactivateSubscription(subscriptionId) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
