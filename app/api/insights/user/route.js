import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserInsights } from '@/lib/analytics';

/**
 * GET /api/insights/user?range=30
 */
export async function GET(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const range = parseInt(url.searchParams.get('range') || '30', 10);

    const data = await getUserInsights(authUser.userId, isNaN(range) ? 30 : range);

    return NextResponse.json(data);
  } catch (error) {
    console.error('User insights error:', error);
    return NextResponse.json({ error: 'Failed to get user insights' }, { status: 500 });
  }
}
