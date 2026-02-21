import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

/**
 * POST /api/auth/forgot-password
 * Send password reset email to user
 */
export async function POST(request) {
  try {
    var body = await request.json();
    var email = body.email;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    var user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with that email, a reset link will be sent.',
      });
    }

    // Generate reset token
    var resetToken = crypto.randomBytes(32).toString('hex');
    var hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token and expiration (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send email
    var result = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    if (!result.success) {
      console.error('[FORGOT-PASSWORD] Failed to send email:', result.error);
      // In development, include the reset URL in response for testing
      if (process.env.NODE_ENV === 'development' && result.fallback) {
        return NextResponse.json({
          message: 'Email delivery failed. Use the reset URL from the console or below.',
          resetUrl: result.resetUrl,
          debug: true,
        });
      }
    } else {
      console.log('[FORGOT-PASSWORD] Email sent successfully to:', user.email);
    }

    // In development with fallback, include reset URL
    if (process.env.NODE_ENV === 'development' && result.fallback) {
      return NextResponse.json({
        message: 'If an account exists with that email, a reset link will be sent.',
        resetUrl: result.resetUrl,
        debug: true,
      });
    }

    return NextResponse.json({
      message: 'If an account exists with that email, a reset link will be sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Failed to process request' },
      { status: 500 }
    );
  }
}
