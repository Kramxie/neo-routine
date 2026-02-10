import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CheckIn from '@/models/CheckIn';
import Routine from '@/models/Routine';
import { getCurrentUser } from '@/lib/auth';
import { getGentleMessage } from '@/lib/reminderEngine';

/**
 * GET /api/checkins/today
 * Get all check-ins for today (or specified date)
 * Query params: ?date=YYYY-MM-DD (optional, defaults to today)
 */
export async function GET(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    // Get date from query params or use today
    const { searchParams } = new URL(request.url);
    const dateISO = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
      return NextResponse.json(
        { message: 'Invalid date format. Use YYYY-MM-DD', data: null },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get today's check-ins
    const checkIns = await CheckIn.find({
      userId: user.userId,
      dateISO,
    }).lean();

    // Get user's active routines to calculate progress
    const routines = await Routine.find({
      userId: user.userId,
      isArchived: false,
    }).lean();

    // Calculate total active tasks
    const totalTasks = routines.reduce(
      (sum, routine) => sum + routine.tasks.filter((t) => t.isActive).length,
      0
    );

    // Create a map of checked tasks
    const checkedTaskIds = new Set(
      checkIns.map((c) => `${c.routineId}_${c.taskId}`)
    );

    // Calculate completion percentage
    const completedCount = checkIns.length;
    const completionPercent = totalTasks > 0
      ? Math.round((completedCount / totalTasks) * 100)
      : 0;

    // Get weekly stats (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartISO = weekStart.toISOString().split('T')[0];

    const weeklyCheckIns = await CheckIn.find({
      userId: user.userId,
      dateISO: { $gte: weekStartISO, $lte: dateISO },
    }).lean();

    // Group check-ins by date
    const checkInsByDate = {};
    weeklyCheckIns.forEach((c) => {
      checkInsByDate[c.dateISO] = (checkInsByDate[c.dateISO] || 0) + 1;
    });

    // Build weekly data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const iso = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })[0];
      weeklyData.push({
        date: iso,
        day: dayName,
        count: checkInsByDate[iso] || 0,
        percent: totalTasks > 0 ? Math.round(((checkInsByDate[iso] || 0) / totalTasks) * 100) : 0,
      });
    }

    // Calculate weekly completion rate
    const weeklyTotal = weeklyCheckIns.length;
    const weeklyPossible = totalTasks * 7;
    const weeklyPercent = weeklyPossible > 0
      ? Math.round((weeklyTotal / weeklyPossible) * 100)
      : 0;

    // Get gentle micro-message based on progress
    const gentleMessage = getGentleMessage(completionPercent, weeklyPercent);

    return NextResponse.json(
      {
        message: 'Check-ins retrieved successfully',
        data: {
          date: dateISO,
          checkIns: checkIns.map((c) => ({
            id: c._id,
            routineId: c.routineId,
            taskId: c.taskId,
            note: c.note,
            createdAt: c.createdAt,
          })),
          checkedTaskIds: Array.from(checkedTaskIds),
          stats: {
            today: {
              completed: completedCount,
              total: totalTasks,
              percent: completionPercent,
            },
            weekly: {
              completed: weeklyTotal,
              possible: weeklyPossible,
              percent: weeklyPercent,
              data: weeklyData,
            },
          },
          microMessage: gentleMessage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get today check-ins error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch check-ins', data: { error: error.message } },
      { status: 500 }
    );
  }
}
