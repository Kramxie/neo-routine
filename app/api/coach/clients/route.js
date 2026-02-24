import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import CheckIn from '@/models/CheckIn';
import Routine from '@/models/Routine';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/coach/clients
 * Get all clients for the current coach
 */
export async function GET(request) {
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
    const dbUser = await User.findById(user.userId).select('role');
    if (!dbUser || (dbUser.role !== 'coach' && dbUser.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Coach access required' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active'; // 'active', 'pending', 'all'

    // Build query
    const query = { 'coaching.coachId': user.userId };
    if (status !== 'all') {
      query['coaching.status'] = status;
    }

    const clients = await User.find(query)
      .select('name email analytics coaching createdAt')
      .sort({ 'coaching.joinedAt': -1 })
      .lean();

    // Get activity stats for each client
    const today = new Date().toISOString().split('T')[0];
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        // Count routines
        const routineCount = await Routine.countDocuments({
          userId: client._id,
          isArchived: false,
        });

        // Check if active today
        const todayCheckIns = await CheckIn.countDocuments({
          userId: client._id,
          date: today,
        });

        return {
          id: client._id,
          name: client.name,
          email: client.email,
          joinedAt: client.coaching?.joinedAt,
          status: client.coaching?.status,
          stats: {
            currentStreak: client.analytics?.currentStreak || 0,
            totalCheckIns: client.analytics?.totalCheckIns || 0,
            routineCount,
            activeToday: todayCheckIns > 0,
          },
        };
      })
    );

    return NextResponse.json({
      clients: clientsWithStats,
      total: clients.length,
    });
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coach/clients
 * Generate invite link for new client
 */
export async function POST(_request) {
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
    const dbUser = await User.findById(user.userId).select('role tier coachProfile');
    if (!dbUser || (dbUser.role !== 'coach' && dbUser.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Coach access required' },
        { status: 403 }
      );
    }

    // Check client limits based on tier
    const clientCount = await User.countDocuments({
      'coaching.coachId': user.userId,
      'coaching.status': { $in: ['active', 'pending'] },
    });

    const limits = {
      free: 5,
      premium: 25,
      premium_plus: Infinity,
    };
    const maxClients = limits[dbUser.tier] || 5;

    if (clientCount >= maxClients) {
      return NextResponse.json(
        {
          message: `Client limit reached (${maxClients}). Upgrade to add more!`,
          error: 'CLIENT_LIMIT_REACHED',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Generate unique invite code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let inviteCode = '';
    for (let i = 0; i < 8; i++) {
      inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Store invite code in coach profile (or could use a separate Invites collection)
    // For simplicity, we'll just return the code - in production you'd want to store it
    const inviteLink = `/join/${inviteCode}?coach=${user.userId}`;

    return NextResponse.json({
      message: 'Invite link generated',
      inviteCode,
      inviteLink,
      coachName: dbUser.coachProfile?.brandName || dbUser.name,
    });
  } catch (error) {
    console.error('Generate invite error:', error);
    return NextResponse.json(
      { message: 'Failed to generate invite' },
      { status: 500 }
    );
  }
}
