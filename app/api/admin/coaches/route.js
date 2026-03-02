import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/coaches
 * List all coach applications (pending, approved, rejected)
 * Admin only
 */
export async function GET(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending'; // pending | approved | rejected | all

    // Build query
    const query = {};
    if (status === 'pending') {
      query['coachProfile.applicationStatus'] = 'pending';
    } else if (status === 'approved') {
      query.role = 'coach';
    } else if (status === 'rejected') {
      query['coachProfile.applicationStatus'] = 'rejected';
    } else {
      // 'all' — anyone who has a coachProfile
      query.coachProfile = { $exists: true, $ne: null };
    }

    const users = await User.find(query)
      .select('name email role coachProfile createdAt')
      .sort({ 'coachProfile.appliedAt': -1 })
      .lean();

    return NextResponse.json({
      applications: users.map((u) => ({
        userId: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        brandName: u.coachProfile?.brandName,
        bio: u.coachProfile?.bio,
        specializations: u.coachProfile?.specializations,
        applicationStatus: u.coachProfile?.applicationStatus || (u.role === 'coach' ? 'approved' : 'unknown'),
        appliedAt: u.coachProfile?.appliedAt,
        activeSince: u.coachProfile?.activeSince,
        isVerified: u.coachProfile?.isVerified,
        createdAt: u.createdAt,
      })),
      count: users.length,
    });
  } catch (error) {
    console.error('[Admin] Get coach applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach applications' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/coaches
 * Approve or reject a coach application
 * Body: { userId, action: 'approve' | 'reject', reason?: string }
 * Admin only
 */
export async function PATCH(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.coachProfile) {
      return NextResponse.json(
        { error: 'User has not applied to be a coach' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      user.role = 'coach';
      user.coachProfile.applicationStatus = 'approved';
      user.coachProfile.activeSince = new Date();
      user.coachProfile.reviewedBy = admin.userId;
      user.coachProfile.reviewedAt = new Date();
    } else {
      user.coachProfile.applicationStatus = 'rejected';
      user.coachProfile.rejectionReason = reason || 'Application not approved at this time';
      user.coachProfile.reviewedBy = admin.userId;
      user.coachProfile.reviewedAt = new Date();
    }

    await user.save();

    return NextResponse.json({
      message: `Coach application ${action}d successfully`,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        applicationStatus: user.coachProfile.applicationStatus,
      },
    });
  } catch (error) {
    console.error('[Admin] Coach application action error:', error);
    return NextResponse.json(
      { error: 'Failed to process coach application' },
      { status: 500 }
    );
  }
}
