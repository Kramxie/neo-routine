import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';

/**
 * POST /api/auth/resend-verification
 * Resend email verification code (6-digit)
 * Body: { email }
 */
export async function POST(request) {
  try {
    // Rate limiting - 5 resends per hour per IP
    const rateLimitResult = rateLimit(request, 'resendVerification');
    if (rateLimitResult) return rateLimitResult;

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists - but still return success-like message
      return NextResponse.json({
        message: 'If an account with that email exists, a verification code has been sent.',
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified. You can log in.' },
        { status: 400 }
      );
    }

    // Generate new 6-digit verification code
    const verificationCode = user.generateEmailVerificationCode();
    await user.save();

    // Send verification email with code
    await sendVerificationEmail(user.email, user.name, verificationCode);

    return NextResponse.json({
      message: 'New verification code sent! Check your inbox.',
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { message: 'Failed to send verification email', ...(process.env.NODE_ENV === 'development' && { error: error.message }) },
      { status: 500 }
    );
  }
}
