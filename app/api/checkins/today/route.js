import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CheckIn from '@/models/CheckIn';
import Routine from '@/models/Routine';
import { getCurrentUser } from '@/lib/auth';
import { getGentleMessage } from '@/lib/reminderEngine';

// Demo data for testing without database
const DEMO_TODAY_DATA = {
  date: new Date().toISOString().split('T')[0],
  checkIns: [],
  totalTasks: 5,
  completedCount: 0,
  completionPercent: 0,
  weeklyData: [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 3, total: 5 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 4, total: 5 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 5, total: 5 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 2, total: 5 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 4, total: 5 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 5, total: 5 },
    { date: new Date().toISOString().split('T')[0], completed: 0, total: 5 },
  ],
  reminderMessage: 'Welcome to Neo Routine! 🌊 Each small ripple creates waves of change.',
  isDemo: true,
};

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

    // Demo mode - return sample data
    if (user.userId === 'demo-user-123') {
      return NextResponse.json(DEMO_TODAY_DATA);
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

    // Create a set of unique routine_task combos for today's checks (prevents double-counting)
    const todayUnique = new Set(checkIns.map((c) => `${String(c.routineId)}_${String(c.taskId)}`));

    // Calculate completion percentage using unique checked tasks
    const completedCount = todayUnique.size;
    const completionPercent = totalTasks > 0
      ? Math.round((completedCount / totalTasks) * 100)
      : 0;

    // Get weekly stats (last 7 days) based on the requested dateISO (prevents server local timezone shifts)
    const endDate = new Date(dateISO + 'T00:00:00');
    // Find Monday of the week containing endDate (ISO week start)
    const day = endDate.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = (day + 6) % 7; // 0 for Mon, 6 for Sun
    const weekStart = new Date(endDate);
    weekStart.setDate(endDate.getDate() - diffToMonday);
    const weekStartISO = weekStart.toISOString().split('T')[0];

    const weeklyCheckIns = await CheckIn.find({
      userId: user.userId,
      dateISO: { $gte: weekStartISO, $lte: dateISO },
    }).lean();

    // Group check-ins by date and dedupe per routine_task to avoid double-counting
    const checkInsByDate = {};
    weeklyCheckIns.forEach((c) => {
      const key = `${c.dateISO}:${String(c.routineId)}_${String(c.taskId)}`;
      // ensure we count unique routine-task per date
      if (!checkInsByDate[c.dateISO]) checkInsByDate[c.dateISO] = new Set();
      checkInsByDate[c.dateISO].add(`${String(c.routineId)}_${String(c.taskId)}`);
    });

    // Build weekly data from Monday -> Sunday
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const iso = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const daySet = checkInsByDate[iso] || new Set();
      const count = daySet.size || 0;
      const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      weeklyData.push({
        date: iso,
        day: dayName,
        count,
        percent: Math.max(0, Math.min(100, percent)),
        isToday: iso === dateISO,
      });
    }

    // Calculate weekly completion rate using unique routine-task per day
    let weeklyTotalUnique = 0;
    Object.values(checkInsByDate).forEach((s) => {
      weeklyTotalUnique += (s && s.size) || 0;
    });
    const weeklyPossible = totalTasks * 7;
    const weeklyPercent = weeklyPossible > 0
      ? Math.round((weeklyTotalUnique / weeklyPossible) * 100)
      : 0;

    // Get gentle micro-message based on progress
    const gentleMessage = getGentleMessage(completionPercent, weeklyPercent);

    // Debug output (temporary)
    try {
      console.table({ dateISO, completedCount, totalTasks, completionPercent, weeklyTotalUnique, weeklyPossible, weeklyPercent });
      console.table(weeklyData.map((d) => ({ date: d.date, count: d.count, percent: d.percent })));
    } catch (e) {
      // ignore
    }

    return NextResponse.json(
      {
        message: 'Check-ins retrieved successfully',
        data: {
          date: dateISO,
          checkIns: checkIns.map((c) => ({
            id: String(c._id),
            routineId: String(c.routineId),
            taskId: String(c.taskId),
            note: c.note,
            createdAt: c.createdAt,
          })),
          checkedTaskIds: Array.from(todayUnique).map(String),
          stats: {
            today: {
              completed: completedCount,
              total: totalTasks,
              percent: Math.max(0, Math.min(100, completionPercent)),
            },
            weekly: {
              completed: weeklyTotalUnique,
              possible: weeklyPossible,
              percent: Math.max(0, Math.min(100, weeklyPercent)),
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
