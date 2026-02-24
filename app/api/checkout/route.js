import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import _stripe, { getOrCreateCustomer, createCheckoutSession, STRIPE_PRICES } from '@/lib/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * POST /api/checkout
 * Create a Stripe Checkout session for subscription purchase
 */
export async function POST(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId } = body;

    // Validate plan ID
    const validPlans = ['premium_monthly', 'premium_yearly', 'premium_plus_monthly', 'premium_plus_yearly'];
    if (!planId || !validPlans.includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get the price ID for this plan
    const priceId = STRIPE_PRICES[planId];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan. Please contact support.' },
        { status: 500 }
      );
    }

    await connectDB();

    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription
    if (user.subscription?.status === 'active' && user.tier !== 'free') {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please manage it from settings.' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(user);

    // Save customer ID to user if it's new
    if (!user.subscription?.stripeCustomerId) {
      user.subscription = user.subscription || {};
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId,
      priceId,
      userId: user._id.toString(),
      successUrl: `${APP_URL}/dashboard/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${APP_URL}/dashboard/upgrade?canceled=true`,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
