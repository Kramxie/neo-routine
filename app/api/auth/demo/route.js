import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import rateLimit from '@/lib/rateLimit';

/**
 * POST /api/auth/demo
 * Demo login - creates a test session without database
 * For testing/development purposes only — disabled in production
 */
export async function POST(request) {
  // Block demo login in production (allow in CI/E2E via ALLOW_DEMO)
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO !== 'true') {
    return NextResponse.json(
      { message: 'Demo mode is not available in production' },
      { status: 403 }
    );
  }

  // Rate limit: 5 demo logins per 15 minutes
  const limited = rateLimit(request, 'login');
  if (limited) return limited;

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
      { message: 'Demo login failed', ...(process.env.NODE_ENV === 'development' && { error: error.message }) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/demo
 * Get demo user info
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO !== 'true') {
    return NextResponse.json(
      { message: 'Demo mode is not available in production' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Demo mode available',
    credentials: {
      email: 'demo@neoroutine.app',
      note: 'Click "Try Demo" on login page - no password needed!',
    },
  });
}
