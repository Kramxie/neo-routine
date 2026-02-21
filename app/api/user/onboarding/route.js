import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * POST /api/user/onboarding
 * Mark onboarding as complete
 */
export async function POST(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { completed } = body;

    await connectDB();

    await User.findByIdAndUpdate(authUser.userId, {
      onboardingCompleted: completed === true,
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding status updated',
    });
  } catch (error) {
    console.error('Onboarding update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update onboarding status' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/onboarding
 * Get onboarding status
 */
export async function GET(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(authUser.userId).select('onboardingCompleted');

    return NextResponse.json({
      success: true,
      data: {
        onboardingCompleted: user?.onboardingCompleted || false,
      },
    });
  } catch (error) {
    console.error('Onboarding fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}
