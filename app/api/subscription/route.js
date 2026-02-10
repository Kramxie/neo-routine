import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { 
  plans, 
  freeTierFeatures, 
  tierLimits, 
  getEffectiveTier,
  isSubscriptionActive 
} from '@/lib/features';

/**
 * GET /api/subscription
 * Get current user's subscription status and available plans
 */
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(authUser.userId).select('tier subscription role');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const effectiveTier = getEffectiveTier(user);
    const isActive = isSubscriptionActive(user.subscription);

    return NextResponse.json({
      currentTier: effectiveTier,
      subscription: {
        status: user.subscription?.status || 'none',
        plan: user.subscription?.plan || 'none',
        currentPeriodEnd: user.subscription?.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd || false,
        isActive,
      },
      limits: tierLimits[effectiveTier],
      plans: Object.values(plans),
      freeTierFeatures,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription
 * Create/upgrade subscription (mock implementation - would integrate with Stripe)
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

    if (!planId || !plans[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const selectedPlan = plans[planId];

    await connectDB();

    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // In production, this would create a Stripe checkout session
    // For now, we simulate the subscription activation
    
    const now = new Date();
    const periodEnd = new Date();
    
    // Set period end based on interval
    if (selectedPlan.interval === 'month') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (selectedPlan.interval === 'year') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Update user subscription
    user.tier = selectedPlan.tier;
    user.subscription = {
      status: 'active',
      plan: planId,
      stripeCustomerId: `cus_mock_${user._id}`,
      stripeSubscriptionId: `sub_mock_${Date.now()}`,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    };

    await user.save();

    return NextResponse.json({
      message: 'Subscription activated successfully',
      subscription: {
        status: 'active',
        plan: planId,
        tier: selectedPlan.tier,
        currentPeriodEnd: periodEnd,
      },
      // In production, this would be a Stripe checkout URL
      checkoutUrl: null,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscription
 * Cancel subscription (sets to cancel at period end)
 */
export async function DELETE() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    if (!user.subscription || user.subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      );
    }

    // In production, this would cancel via Stripe API
    // Subscription remains active until period end
    user.subscription.cancelAtPeriodEnd = true;
    user.subscription.canceledAt = new Date();

    await user.save();

    return NextResponse.json({
      message: 'Subscription will be canceled at the end of the billing period',
      subscription: {
        status: user.subscription.status,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
