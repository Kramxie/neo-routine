import { NextResponse } from 'next/server';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { getCoachInsights } from '@/lib/analytics';

/**
 * GET /api/insights/coach?range=30
 * Only accessible by coach role (or admin in future)
 */
export async function GET(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(authUser, ['coach', 'admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const range = parseInt(url.searchParams.get('range') || '30', 10);

    // Use the authenticated user's id as coachId
    const coachId = authUser.userId;

    const data = await getCoachInsights(coachId, isNaN(range) ? 30 : range);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Coach insights error:', error);
    return NextResponse.json({ error: 'Failed to get coach insights' }, { status: 500 });
  }
}
