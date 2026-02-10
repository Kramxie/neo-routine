import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * GET /api/user/preferences
 * Get current user's preferences
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

    const user = await User.findById(authUser.userId).select('preferences analytics name email');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      preferences: user.preferences,
      analytics: user.analytics,
      profile: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/preferences
 * Update user preferences
 */
export async function PATCH(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences, profile } = body;

    await connectDB();

    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update preferences if provided
    if (preferences) {
      const allowedPrefs = [
        'reminderTime',
        'timezone',
        'reminderFrequency',
        'activeDays',
        'theme',
        'weeklyDigest',
        'celebrations',
      ];

      allowedPrefs.forEach((key) => {
        if (preferences[key] !== undefined) {
          user.preferences[key] = preferences[key];
        }
      });
    }

    // Update profile if provided
    if (profile) {
      if (profile.name) {
        user.name = profile.name.trim();
      }
      // Email changes could require verification in production
    }

    await user.save();

    return NextResponse.json({
      message: 'Preferences updated',
      preferences: user.preferences,
      profile: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
