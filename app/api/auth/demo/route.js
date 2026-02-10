import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/demo
 * Demo login - creates a test session without database
 * For testing purposes only
 */
export async function POST() {
  try {
    // Demo user data
    const demoUser = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@neoroutine.app',
      role: 'user',
      tier: 'premium', // Give premium for testing all features
    };

    // Create JWT token
    const token = generateToken({
      _id: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('neo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      message: 'Demo login successful! Welcome to Neo Routine.',
      data: {
        user: demoUser,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { message: 'Demo login failed', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/demo
 * Get demo user info
 */
export async function GET() {
  return NextResponse.json({
    message: 'Demo mode available',
    credentials: {
      email: 'demo@neoroutine.app',
      note: 'Click "Try Demo" on login page - no password needed!',
    },
  });
}
