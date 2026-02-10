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
        data: { error: error.message },
      },
      { status: 500 }
    );
  }
}
