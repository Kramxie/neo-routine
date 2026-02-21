import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * POST /api/notifications/subscribe
 * Save a Web Push subscription for the current user
 *
 * DELETE /api/notifications/subscribe
 * Remove a Web Push subscription (unsubscribe)
 */

export async function POST(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription?.endpoint || !subscription?.keys?.auth || !subscription?.keys?.p256dh) {
      return NextResponse.json({ error: 'Invalid push subscription object' }, { status: 400 });
    }

    await connectDB();

    // Remove any existing subscription with the same endpoint first (upsert)
    await User.findByIdAndUpdate(authUser.userId, {
      $pull: { pushSubscriptions: { endpoint: subscription.endpoint } },
    });

    // Add the new subscription
    await User.findByIdAndUpdate(authUser.userId, {
      $push: {
        pushSubscriptions: {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.keys.auth,
            p256dh: subscription.keys.p256dh,
          },
          subscribedAt: new Date(),
        },
      },
    });

    console.log('[Push] Subscription saved for user:', authUser.userId);
    return NextResponse.json({ success: true, message: 'Push subscription saved' });
  } catch (error) {
    console.error('[Push] Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    await connectDB();

    await User.findByIdAndUpdate(authUser.userId, {
      $pull: { pushSubscriptions: { endpoint } },
    });

    console.log('[Push] Subscription removed for user:', authUser.userId);
    return NextResponse.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (error) {
    console.error('[Push] Unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
