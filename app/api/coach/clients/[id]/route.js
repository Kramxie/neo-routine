import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';
import CheckIn from '@/models/CheckIn';
import Routine from '@/models/Routine';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/coach/clients/[id]
 * Get detailed stats for a specific client
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

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

    // Get client
    const client = await User.findById(id).select(
      'name email analytics coaching createdAt preferences'
    );

    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify this is the coach's client
    if (client.coaching?.coachId?.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Not your client' },
        { status: 403 }
      );
    }

    // Get client's routines
    const routines = await Routine.find({
      userId: id,
      isArchived: false,
    })
      .select('title tasks color')
      .lean();

    // Get check-in history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const checkIns = await CheckIn.find({
      userId: id,
      dateISO: { $gte: dateStr },
    })
      .select('dateISO routineId taskId')
      .sort({ date: -1 })
      .lean();

    // Calculate activity by day
    const activityByDay = {};
    checkIns.forEach((checkIn) => {
      if (!activityByDay[checkIn.dateISO]) {
        activityByDay[checkIn.dateISO] = 0;
      }
      activityByDay[checkIn.dateISO]++;
    });

    // Get weekly completion rate
    const daysWithActivity = Object.keys(activityByDay).length;
    const weeklyRate = Math.round((daysWithActivity / 30) * 100);

    return NextResponse.json({
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        joinedAt: client.coaching?.joinedAt,
        status: client.coaching?.status,
        memberSince: client.createdAt,
      },
      stats: {
        currentStreak: client.analytics?.currentStreak || 0,
        longestStreak: client.analytics?.longestStreak || 0,
        totalCheckIns: client.analytics?.totalCheckIns || 0,
        checkInsLast30Days: checkIns.length,
        activeDays: daysWithActivity,
        weeklyCompletionRate: weeklyRate,
      },
      routines: routines.map((r) => ({
        id: r._id,
        title: r.title,
        taskCount: r.tasks?.length || 0,
        color: r.color,
      })),
      activityByDay,
    });
  } catch (error) {
    console.error('Get client detail error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch client details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/coach/clients/[id]
 * Update client status (accept, pause, etc.)
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid client ID' },
        { status: 400 }
      );
    }

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

    // Get client
    const client = await User.findById(id);

    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify this is the coach's client
    if (client.coaching?.coachId?.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Not your client' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update status
    if (body.status) {
      const validStatuses = ['pending', 'active', 'paused', 'ended'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { message: 'Invalid status' },
          { status: 400 }
        );
      }
      client.coaching.status = body.status;
    }

    await client.save();

    return NextResponse.json({
      message: `Client status updated to ${client.coaching.status}`,
      status: client.coaching.status,
    });
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json(
      { message: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/coach/clients/[id]
 * Remove client from coach
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

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

    // Get client
    const client = await User.findById(id);

    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify this is the coach's client
    if (client.coaching?.coachId?.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Not your client' },
        { status: 403 }
      );
    }

    // Remove coaching relationship
    client.coaching = undefined;
    await client.save();

    return NextResponse.json({
      message: 'Client removed from your roster',
    });
  } catch (error) {
    console.error('Remove client error:', error);
    return NextResponse.json(
      { message: 'Failed to remove client' },
      { status: 500 }
    );
  }
}
