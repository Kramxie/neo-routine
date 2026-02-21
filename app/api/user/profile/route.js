import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Demo mode
    if (user.userId === 'demo-user-123') {
      return NextResponse.json({
        user: {
          _id: 'demo-user-123',
          name: 'Demo User',
          email: 'demo@neoroutine.com',
          bio: 'This is a demo account',
          createdAt: new Date().toISOString(),
        },
        isDemo: true,
      });
    }

    await connectDB();

    const dbUser = await User.findById(user.userId)
      .select('name email bio avatar createdAt preferences subscription analytics')
      .lean();

    if (!dbUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        ...dbUser,
        _id: dbUser._id.toString(),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Demo mode
    if (user.userId === 'demo-user-123') {
      const body = await request.json();
      return NextResponse.json({
        message: 'Profile updated (demo mode)',
        user: {
          _id: 'demo-user-123',
          name: body.name || 'Demo User',
          email: 'demo@neoroutine.com',
          bio: body.bio || '',
        },
        isDemo: true,
      });
    }

    await connectDB();

    const body = await request.json();
    const { name, bio, avatar } = body;

    // Validate name if provided
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json(
        { message: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim().slice(0, 500);
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('name email bio avatar createdAt preferences subscription');

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        ...updatedUser.toObject(),
        _id: updatedUser._id.toString(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
