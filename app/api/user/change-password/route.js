import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

/**
 * POST /api/user/change-password
 * Change current user's password (requires current password)
 */
export async function POST(request) {
  try {
    // Rate limiting - 5 attempts per 15 min
    const rateLimitResult = rateLimit(request, 'resetPassword');
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
        { message: 'Cannot change password in demo mode' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { message: 'Password cannot exceed 128 characters' },
        { status: 400 }
      );
    }

    // Require at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { message: 'Password must contain at least one letter and one number' },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch user with password hash
    const user = await User.findById(authUser.userId).select('+passwordHash');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Prevent reusing the same password
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return NextResponse.json(
        { message: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Update password (pre-save hook will hash it)
    user.passwordHash = newPassword;
    await user.save();

    return NextResponse.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'Failed to change password' },
      { status: 500 }
    );
  }
}
