import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { validateRegister, sanitizeString } from '@/lib/validators';

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Sanitize inputs
    const data = {
      name: sanitizeString(body.name, 50),
      email: sanitizeString(body.email, 100).toLowerCase(),
      password: body.password, // Don't sanitize password
    };

    // Validate input
    const validation = validateRegister(data);
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        {
          message: 'An account with this email already exists',
          data: { errors: { email: 'Email is already registered' } },
        },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      name: data.name,
      email: data.email,
      passwordHash: data.password, // Will be hashed by pre-save middleware
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    await setTokenCookie(token);

    // Return success response
    return NextResponse.json(
      {
        message: 'Account created successfully. Welcome to Neo Routine!',
        data: {
          user: user.toSafeObject(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: 'An account with this email already exists',
          data: { errors: { email: 'Email is already registered' } },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: 'Registration failed. Please try again.',
        data: { error: error.message },
      },
      { status: 500 }
    );
  }
}
