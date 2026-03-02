import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/users/[id]
 * Get detailed user info
 * Admin only
 */
export async function GET(_request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    await connectDB();

    const user = await User.findById(id)
      .select('-passwordHash -emailVerificationCode -passwordResetToken')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    console.error('[Admin] Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user role or tier (admin override)
 * Body: { role?, tier?, suspended? }
 * Admin only
 */
export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { role, tier, suspended } = body;

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admins from demoting themselves
    if (id === admin.userId && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change your own admin role' },
        { status: 400 }
      );
    }

    // Apply updates
    const updates = {};
    if (role && ['user', 'coach', 'admin'].includes(role)) {
      user.role = role;
      updates.role = role;
      // If promoting to coach, set activeSince
      if (role === 'coach' && user.coachProfile) {
        user.coachProfile.applicationStatus = 'approved';
        user.coachProfile.activeSince = user.coachProfile.activeSince || new Date();
        user.coachProfile.reviewedBy = admin.userId;
        user.coachProfile.reviewedAt = new Date();
      }
    }
    if (tier && ['free', 'premium', 'premium_plus'].includes(tier)) {
      user.tier = tier;
      updates.tier = tier;
    }
    if (typeof suspended === 'boolean') {
      user.isSuspended = suspended;
      updates.suspended = suspended;
    }

    await user.save();

    return NextResponse.json({
      message: 'User updated successfully',
      updates,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    console.error('[Admin] Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
