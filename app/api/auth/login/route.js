import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { validateLogin, sanitizeString } from '@/lib/validators';
import { rateLimit, resetRateLimit } from '@/lib/rateLimit';

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request) {
  try {
    // Rate limiting - 5 attempts per 15 minutes
    const rateLimitResult = rateLimit(request, 'login');
    if (rateLimitResult) return rateLimitResult;
    // Parse request body
    const body = await request.json();

    // Sanitize inputs
    const data = {
      email: sanitizeString(body.email, 100).toLowerCase(),
      password: body.password, // Don't sanitize password
    };

    // Validate input
    const validation = validateLogin(data);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          data: { errors: validation.errors },
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: data.email }).select('+passwordHash');

    if (!user) {
      // Use generic message to prevent email enumeration
      return NextResponse.json(
        {
          message: 'Invalid email or password',
          data: { errors: { general: 'Invalid credentials' } },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: 'Invalid email or password',
          data: { errors: { general: 'Invalid credentials' } },
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    await setTokenCookie(token);

    // Reset rate limit on successful login
    resetRateLimit(request, 'login');

    // Return success response
    return NextResponse.json(
      {
        message: 'Welcome back! Your flow continues.',
        data: {
          user: user.toSafeObject(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      {
        message: 'Login failed. Please try again.',
        data: { error: error.message },
      },
      { status: 500 }
    );
  }
}
