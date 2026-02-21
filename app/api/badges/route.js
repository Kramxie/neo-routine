import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import Badge from '@/models/Badge';

/**
 * GET /api/badges - Get user's badges
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const badges = await Badge.find({ userId: user.userId })
      .sort({ earnedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        badges,
        count: badges.length,
        unseenCount: badges.filter(b => !b.seen).length,
      },
    });
  } catch (error) {
    console.error('[Badges] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/badges - Award a badge to user
 * Body: { badgeId: string, context?: object }
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { badgeId, context } = body;

    if (!badgeId) {
      return NextResponse.json(
        { success: false, error: 'Badge ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if badge already exists
    const existingBadge = await Badge.findOne({
      userId: user.userId,
      badgeId,
    });

    if (existingBadge) {
      return NextResponse.json({
        success: true,
        data: { badge: existingBadge, alreadyEarned: true },
      });
    }

    // Create new badge
    const badge = await Badge.create({
      userId: user.userId,
      badgeId,
      context,
      seen: false,
    });

    return NextResponse.json({
      success: true,
      data: { badge, isNew: true },
    });
  } catch (error) {
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        data: { alreadyEarned: true },
      });
    }

    console.error('[Badges] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/badges - Mark badges as seen
 * Body: { badgeIds?: string[] } - if not provided, marks all as seen
 */
export async function PATCH(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { badgeIds } = body;

    await connectDB();

    const filter = { userId: user.userId, seen: false };
    if (badgeIds?.length > 0) {
      filter._id = { $in: badgeIds };
    }

    const result = await Badge.updateMany(filter, { $set: { seen: true } });

    return NextResponse.json({
      success: true,
      data: { markedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error('[Badges] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update badges' },
      { status: 500 }
    );
  }
}
