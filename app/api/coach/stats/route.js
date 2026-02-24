import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import RoutineTemplate from '@/models/RoutineTemplate';
import _Routine from '@/models/Routine';
import CheckIn from '@/models/CheckIn';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/coach/stats
 * Get coach dashboard statistics
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify coach status
    const dbUser = await User.findById(user.userId).select('role coachProfile');
    if (!dbUser || (dbUser.role !== 'coach' && dbUser.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Coach access required' },
        { status: 403 }
      );
    }

    // Get client count
    const clientCount = await User.countDocuments({
      'coaching.coachId': user.userId,
      'coaching.status': 'active',
    });

    // Get pending clients
    const pendingCount = await User.countDocuments({
      'coaching.coachId': user.userId,
      'coaching.status': 'pending',
    });

    // Get template stats
    const templates = await RoutineTemplate.find({ coachId: user.userId })
      .select('stats isPublished')
      .lean();

    const templateStats = {
      total: templates.length,
      published: templates.filter((t) => t.isPublished).length,
      totalAdoptions: templates.reduce((sum, t) => sum + (t.stats?.adoptions || 0), 0),
      totalViews: templates.reduce((sum, t) => sum + (t.stats?.views || 0), 0),
    };

    // Get client activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeClients = await User.find({
      'coaching.coachId': user.userId,
      'coaching.status': 'active',
    }).select('_id');

    const clientIds = activeClients.map((c) => c._id);

    // Get recent check-ins from clients
    const recentCheckIns = await CheckIn.countDocuments({
      userId: { $in: clientIds },
      date: { $gte: sevenDaysAgo.toISOString().split('T')[0] },
    });

    // Calculate engagement rate (check-ins per client per day)
    const engagementRate =
      clientIds.length > 0
        ? Math.round((recentCheckIns / (clientIds.length * 7)) * 100)
        : 0;

    // Get top performing template
    const _topTemplate = templates
      .filter((t) => t.isPublished)
      .sort((a, b) => (b.stats?.adoptions || 0) - (a.stats?.adoptions || 0))[0];

    // Get new clients this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newClientsThisMonth = await User.countDocuments({
      'coaching.coachId': user.userId,
      'coaching.joinedAt': { $gte: startOfMonth },
    });

    return NextResponse.json({
      overview: {
        activeClients: clientCount,
        pendingClients: pendingCount,
        newClientsThisMonth,
        engagementRate,
      },
      templates: templateStats,
      activity: {
        clientCheckInsLast7Days: recentCheckIns,
        avgCheckInsPerClient: clientIds.length > 0 
          ? Math.round(recentCheckIns / clientIds.length) 
          : 0,
      },
      coachProfile: {
        brandName: dbUser.coachProfile?.brandName || dbUser.name,
        isVerified: dbUser.coachProfile?.isVerified || false,
        activeSince: dbUser.coachProfile?.activeSince,
      },
    });
  } catch (error) {
    console.error('Get coach stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch coach statistics' },
      { status: 500 }
    );
  }
}
