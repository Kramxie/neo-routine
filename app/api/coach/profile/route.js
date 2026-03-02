import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeString } from '@/lib/validators';

/**
 * GET /api/coach/profile
 * Get current user's coach profile (if they are a coach)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const dbUser = await User.findById(user.userId).select(
      'name email role coachProfile'
    );

    if (!dbUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is a coach
    if (dbUser.role !== 'coach' && dbUser.role !== 'admin') {
      return NextResponse.json({
        isCoach: false,
        message: 'Apply to become a coach to access this feature',
      });
    }

    return NextResponse.json({
      isCoach: true,
      profile: {
        name: dbUser.name,
        email: dbUser.email,
        brandName: dbUser.coachProfile?.brandName || dbUser.name,
        bio: dbUser.coachProfile?.bio || '',
        specializations: dbUser.coachProfile?.specializations || [],
        socialLinks: dbUser.coachProfile?.socialLinks || {},
        brandColor: dbUser.coachProfile?.brandColor || '#0ea5e9',
        avatarUrl: dbUser.coachProfile?.avatarUrl || '',
        isVerified: dbUser.coachProfile?.isVerified || false,
        activeSince: dbUser.coachProfile?.activeSince,
      },
    });
  } catch (error) {
    console.error('Get coach profile error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch coach profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coach/profile
 * Apply to become a coach — submits an application (pending admin approval)
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const dbUser = await User.findById(user.userId);

    if (!dbUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Already a coach
    if (dbUser.role === 'coach') {
      return NextResponse.json(
        { message: 'Already a coach' },
        { status: 400 }
      );
    }

    // Already has a pending application
    if (dbUser.coachProfile?.applicationStatus === 'pending') {
      return NextResponse.json(
        { message: 'Your coach application is already pending review' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.brandName || body.brandName.trim().length < 2) {
      return NextResponse.json(
        { message: 'Brand name is required (min 2 characters)' },
        { status: 400 }
      );
    }

    // Save application (role stays 'user' until admin approves)
    dbUser.coachProfile = {
      brandName: sanitizeString(body.brandName, 100),
      bio: sanitizeString(body.bio || '', 500),
      specializations: Array.isArray(body.specializations)
        ? body.specializations.slice(0, 5).map((s) => sanitizeString(s, 30))
        : [],
      socialLinks: {
        website: sanitizeString(body.socialLinks?.website || '', 200),
        instagram: sanitizeString(body.socialLinks?.instagram || '', 100),
        twitter: sanitizeString(body.socialLinks?.twitter || '', 100),
        youtube: sanitizeString(body.socialLinks?.youtube || '', 200),
      },
      brandColor: body.brandColor || '#0ea5e9',
      avatarUrl: sanitizeString(body.avatarUrl || '', 500),
      isVerified: false,
      applicationStatus: 'pending',
      appliedAt: new Date(),
    };

    await dbUser.save();

    return NextResponse.json({
      message: 'Coach application submitted! An admin will review your application.',
      application: {
        brandName: dbUser.coachProfile.brandName,
        status: 'pending',
        appliedAt: dbUser.coachProfile.appliedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Apply as coach error:', error);
    return NextResponse.json(
      { message: 'Failed to submit coach application' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/coach/profile
 * Update coach profile
 */
export async function PATCH(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const dbUser = await User.findById(user.userId);

    if (!dbUser || (dbUser.role !== 'coach' && dbUser.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Not authorized as a coach' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build updates
    const updates = {};

    if (body.brandName !== undefined) {
      updates['coachProfile.brandName'] = sanitizeString(body.brandName, 100);
    }
    if (body.bio !== undefined) {
      updates['coachProfile.bio'] = sanitizeString(body.bio, 500);
    }
    if (body.specializations !== undefined) {
      updates['coachProfile.specializations'] = Array.isArray(body.specializations)
        ? body.specializations.slice(0, 5).map((s) => sanitizeString(s, 30))
        : [];
    }
    if (body.socialLinks !== undefined) {
      updates['coachProfile.socialLinks'] = {
        website: sanitizeString(body.socialLinks?.website || '', 200),
        instagram: sanitizeString(body.socialLinks?.instagram || '', 100),
        twitter: sanitizeString(body.socialLinks?.twitter || '', 100),
        youtube: sanitizeString(body.socialLinks?.youtube || '', 200),
      };
    }
    if (body.brandColor !== undefined) {
      updates['coachProfile.brandColor'] = body.brandColor;
    }
    if (body.avatarUrl !== undefined) {
      updates['coachProfile.avatarUrl'] = sanitizeString(body.avatarUrl, 500);
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $set: updates },
      { new: true }
    ).select('coachProfile');

    return NextResponse.json({
      message: 'Coach profile updated',
      profile: updatedUser.coachProfile,
    });
  } catch (error) {
    console.error('Update coach profile error:', error);
    return NextResponse.json(
      { message: 'Failed to update coach profile' },
      { status: 500 }
    );
  }
}
