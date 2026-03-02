import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Routine from '@/models/Routine';
import CheckIn from '@/models/CheckIn';
import Goal from '@/models/Goal';
import Badge from '@/models/Badge';
import { getCurrentUser, removeTokenCookie } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

/**
 * DELETE /api/user/delete-account
 * Permanently delete the current user's account and all associated data
 */
export async function DELETE(request) {
  try {
    // Rate limiting - 3 attempts per hour
    const rateLimitResult = rateLimit(request, 'forgotPassword');
    if (rateLimitResult) return rateLimitResult;

    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Demo mode
    if (authUser.userId === 'demo-user-123') {
      return NextResponse.json(
        { message: 'Cannot delete demo account' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { password, confirmation } = body;

    // Require explicit confirmation
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { message: 'Please type "DELETE MY ACCOUNT" to confirm' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required for account deletion' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify password
    const user = await User.findById(authUser.userId).select('+passwordHash');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Cancel Stripe subscription if active
    if (
      user.subscription?.stripeSubscriptionId &&
      !user.subscription.stripeSubscriptionId.startsWith('sub_mock_') &&
      user.subscription.status === 'active'
    ) {
      try {
        const { cancelSubscription } = await import('@/lib/stripe');
        await cancelSubscription(user.subscription.stripeSubscriptionId);
      } catch (stripeErr) {
        console.error('Failed to cancel Stripe subscription during account deletion:', stripeErr);
        // Continue with deletion even if Stripe cancel fails
      }
    }

    // Delete all user data in parallel
    await Promise.all([
      Routine.deleteMany({ userId: authUser.userId }),
      CheckIn.deleteMany({ userId: authUser.userId }),
      Goal.deleteMany({ userId: authUser.userId }),
      Badge.deleteMany({ userId: authUser.userId }),
      User.findByIdAndDelete(authUser.userId),
    ]);

    // Clear auth cookie
    await removeTokenCookie();

    return NextResponse.json({
      message: 'Account and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { message: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
