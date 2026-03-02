import { NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Clear session cookie and logout user
 */
export async function POST() {
  try {
    // Remove the auth cookie
    await removeTokenCookie();

    return NextResponse.json(
      {
        message: 'Logged out successfully. See you next time!',
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        message: 'Logout failed',
        data: process.env.NODE_ENV === 'development' ? { error: error.message } : null,
      },
      { status: 500 }
    );
  }
}
