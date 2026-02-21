import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

/**
 * GET /api/prices
 * Fetch subscription prices from Stripe
 * Returns formatted pricing data for display
 */
export async function GET() {
  try {
    // Get price IDs from environment
    const priceIds = {
      premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
      premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
      premium_plus_monthly: process.env.STRIPE_PRICE_PREMIUM_PLUS_MONTHLY,
      premium_plus_yearly: process.env.STRIPE_PRICE_PREMIUM_PLUS_YEARLY,
    };

    // Fetch all configured prices from Stripe
    const prices = {};
    
    for (const [planId, priceId] of Object.entries(priceIds)) {
      if (priceId) {
        try {
          const price = await stripe.prices.retrieve(priceId, {
            expand: ['product'],
          });
          
          prices[planId] = {
            id: planId,
            priceId: price.id,
            amount: price.unit_amount / 100, // Convert cents to dollars
            currency: price.currency.toUpperCase(),
            interval: price.recurring?.interval || 'one_time',
            intervalCount: price.recurring?.interval_count || 1,
            productName: price.product?.name || planId,
            active: price.active,
          };
        } catch (err) {
          console.error(`Failed to fetch price ${planId}:`, err.message);
        }
      }
    }

    // Calculate savings for yearly plans
    if (prices.premium_monthly && prices.premium_yearly) {
      const monthlyTotal = prices.premium_monthly.amount * 12;
      const yearlySavings = ((monthlyTotal - prices.premium_yearly.amount) / monthlyTotal) * 100;
      prices.premium_yearly.savings = Math.round(yearlySavings);
      prices.premium_yearly.monthlyEquivalent = (prices.premium_yearly.amount / 12).toFixed(2);
    }

    if (prices.premium_plus_monthly && prices.premium_plus_yearly) {
      const monthlyTotal = prices.premium_plus_monthly.amount * 12;
      const yearlySavings = ((monthlyTotal - prices.premium_plus_yearly.amount) / monthlyTotal) * 100;
      prices.premium_plus_yearly.savings = Math.round(yearlySavings);
      prices.premium_plus_yearly.monthlyEquivalent = (prices.premium_plus_yearly.amount / 12).toFixed(2);
    }

    // Add tier features
    const tierFeatures = {
      free: {
        name: 'Free',
        features: [
          'Up to 3 routines',
          'Up to 5 tasks per routine',
          '7 days of insights history',
          'Daily reminders',
          'Basic analytics',
        ],
      },
      premium: {
        name: 'Premium',
        features: [
          'Up to 10 routines',
          'Up to 15 tasks per routine',
          '90 days of insights history',
          'Custom routine colors',
          'Advanced analytics',
          'Data export (CSV)',
          'Dark mode',
        ],
      },
      premium_plus: {
        name: 'Premium+',
        features: [
          'Unlimited routines',
          'Unlimited tasks',
          'Full year of insights',
          'Priority support',
          'Coach access',
          'API access',
          'Everything in Premium',
        ],
      },
    };

    return NextResponse.json({
      success: true,
      prices,
      features: tierFeatures,
    });
  } catch (error) {
    console.error('Fetch prices error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
