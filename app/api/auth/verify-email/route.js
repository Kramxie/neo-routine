import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import rateLimit from '@/lib/rateLimit';

/**
 * POST /api/auth/verify-email
 * Verify user's email with 6-digit code
 * Body: { email, code }
 */
export async function POST(request) {
  // Rate limit: 5 attempts per 15 minutes to prevent brute-force on 6-digit code
  const limited = rateLimit(request, 'verifyEmail');
  if (limited) return limited;

  try {
    const { email, code } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { message: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { message: 'Invalid code format. Please enter a 6-digit code.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user with matching email and include verification fields
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+emailVerificationCode +emailVerificationExpires');

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified. You can log in.' },
        { status: 400 }
      );
    }

    // Check if code matches
    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: 'Email verified successfully! Welcome to Neo Routine.',
      data: {
        email: user.email,
        verified: true,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify email', ...(process.env.NODE_ENV === 'development' && { error: error.message }) },
      { status: 500 }
    );
  }
}
