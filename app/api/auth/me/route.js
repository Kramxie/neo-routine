import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
export async function GET() {
  try {
    // Get user from token
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json(
        {
          message: 'Not authenticated',
          data: null,
        },
        { status: 401 }
      );
    }

    // Demo user — return mock data without DB lookup
    if (tokenUser.userId === 'demo-user-123') {
      return NextResponse.json(
        {
          message: 'User retrieved successfully',
          data: {
            user: {
              _id: 'demo-user-123',
              name: 'Demo User',
              email: 'demo@neoroutine.app',
              role: 'user',
              tier: 'premium',
              isEmailVerified: true,
              onboardingCompleted: true,
              preferences: { timezone: 'UTC', theme: 'light' },
              analytics: {
                currentStreak: 3,
                longestStreak: 7,
                totalCheckIns: 42,
                lastActiveDate: new Date().toISOString().split('T')[0],
              },
              createdAt: new Date().toISOString(),
            },
          },
        },
        { status: 200 }
      );
    }

    // Connect to database
    await connectDB();

    // Get fresh user data from database
    const user = await User.findById(tokenUser.userId);

    if (!user) {
      return NextResponse.json(
        {
          message: 'User not found',
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'User retrieved successfully',
        data: {
          user: user.toSafeObject(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);

    return NextResponse.json(
      {
        message: 'Failed to get user',
        data: process.env.NODE_ENV === 'development' ? { error: error.message } : null,
      },
      { status: 500 }
    );
  }
}
