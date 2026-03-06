import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CheckIn from '@/models/CheckIn';
import Routine from '@/models/Routine';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { getTodayInTimezone } from '@/lib/timezone';
import { runBadgeChecks } from '@/lib/badgeEngine';

// In-memory store for demo check-ins (resets on server restart)
const demoCheckIns = new Map();

/**
 * GET /api/checkins?year=YYYY&month=MM
 * Get check-in summary for a given month (used by Calendar page)
 * Returns: { checkIns: [{ date, completionRate, tasksCompleted, routinesWorkedOn }] }
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year'));
    const month = parseInt(searchParams.get('month'));

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { message: 'Valid year and month (1-12) are required', data: null },
        { status: 400 }
      );
    }

    // Demo mode
    if (user.userId === 'demo-user-123') {
      return NextResponse.json({ checkIns: [] });
    }

    await connectDB();

    // Build date range for the month
    const monthStr = String(month).padStart(2, '0');
    const daysInMonth = new Date(year, month, 0).getDate();
    const startISO = `${year}-${monthStr}-01`;
    const endISO = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

    // Get all check-ins for this month
    const checkIns = await CheckIn.find({
      userId: user.userId,
      dateISO: { $gte: startISO, $lte: endISO },
    }).lean();

    // Get user's active routines to calculate completion rates
    const routines = await Routine.find({
      userId: user.userId,
      isArchived: { $ne: true },
    }).lean();

    const totalActiveTasks = routines.reduce(
      (sum, r) => sum + r.tasks.filter((t) => t.isActive !== false).length,
      0
    );

    // Group check-ins by date
    const byDate = {};
    checkIns.forEach((ci) => {
      if (!byDate[ci.dateISO]) {
        byDate[ci.dateISO] = { tasks: new Set(), routines: new Set() };
      }
      byDate[ci.dateISO].tasks.add(ci.taskId.toString());
      byDate[ci.dateISO].routines.add(ci.routineId.toString());
    });

    // Build response
    const result = Object.entries(byDate).map(([date, info]) => ({
      date,
      tasksCompleted: info.tasks.size,
      routinesWorkedOn: info.routines.size,
      completionRate: totalActiveTasks > 0
        ? Math.round((info.tasks.size / totalActiveTasks) * 100)
        : 0,
    }));

    return NextResponse.json({ checkIns: result });
  } catch (error) {
    console.error('Get check-ins error:', error);
    return NextResponse.json(
      { message: 'Failed to get check-ins', data: null },
      { status: 500 }
    );
  }
}

/**
 * POST /api/checkins
 * Create a new check-in (mark a task as completed for a day)
 * Body: { routineId, taskId, dateISO?, note? }
 */
export async function POST(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { routineId, taskId, note } = body;
    
    // Get user's timezone for accurate "today" calculation
    let userTimezone = 'UTC';
    if (user.userId !== 'demo-user-123') {
      await connectDB();
      const dbUser = await User.findById(user.userId).select('preferences.timezone');
      userTimezone = dbUser?.preferences?.timezone || 'UTC';
    }
    
    // Use provided date or today in user's timezone
    const dateISO = body.dateISO || getTodayInTimezone(userTimezone);

    // Validate required fields
    if (!routineId) {
      return NextResponse.json(
        { message: 'Routine ID is required', data: null },
        { status: 400 }
      );
    }

    if (!taskId) {
      return NextResponse.json(
        { message: 'Task ID is required', data: null },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
      return NextResponse.json(
        { message: 'Invalid date format. Use YYYY-MM-DD', data: null },
        { status: 400 }
      );
    }

    // Demo mode - use in-memory storage
    if (user.userId === 'demo-user-123') {
      const key = `${routineId}_${taskId}_${dateISO}`;
      demoCheckIns.set(key, {
        id: `demo-checkin-${Date.now()}`,
        routineId,
        taskId,
        dateISO,
        note: note || null,
        createdAt: new Date().toISOString(),
      });
      
      return NextResponse.json({
        message: 'Check-in created',
        checkIn: demoCheckIns.get(key),
        isDemo: true,
      });
    }

    // Verify routine exists and belongs to user
    const routine = await Routine.findOne({
      _id: routineId,
      userId: user.userId,
      isArchived: false,
    });

    if (!routine) {
      return NextResponse.json(
        { message: 'Routine not found', data: null },
        { status: 404 }
      );
    }

    // Verify task exists in routine
    const task = routine.tasks.find(
      (t) => t._id.toString() === taskId && t.isActive
    );

    if (!task) {
      return NextResponse.json(
        { message: 'Task not found in routine', data: null },
        { status: 404 }
      );
    }

    // Check if already checked in
    const existingCheckIn = await CheckIn.findOne({
      userId: user.userId,
      routineId,
      taskId,
      dateISO,
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { 
          message: 'Task already completed for this day',
          data: { checkIn: existingCheckIn.toSafeObject() },
        },
        { status: 200 }
      );
    }

    // Create check-in
    const checkIn = new CheckIn({
      userId: user.userId,
      routineId,
      taskId,
      dateISO,
      note: note ? note.trim().substring(0, 200) : '',
    });

    await checkIn.save();

    // Update user analytics
    const dbUser = await User.findById(user.userId);
    if (dbUser) {
      // Calculate streak using dateISO (user's local date), not server clock
      const checkDate = new Date(dateISO + 'T12:00:00Z');
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayISO = checkDate.toISOString().split('T')[0];
      const lastActive = dbUser.analytics?.lastActiveDate;
      
      let newStreak = dbUser.analytics?.currentStreak || 0;
      
      if (lastActive === dateISO) {
        // Already active today, no streak change
      } else if (lastActive === yesterdayISO) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else if (!lastActive) {
        // First ever check-in
        newStreak = 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
      
      const longestStreak = Math.max(dbUser.analytics?.longestStreak || 0, newStreak);
      
      await User.findByIdAndUpdate(user.userId, {
        $inc: { 'analytics.totalCheckIns': 1 },
        $set: {
          'analytics.currentStreak': newStreak,
          'analytics.longestStreak': longestStreak,
          'analytics.lastActiveDate': dateISO,
        },
      });
      
      // Check and award badges (fire and forget)
      runBadgeChecks(user.userId, { todayPercent: 0 }).catch(err =>
        console.error('[Badge] Check-in badge check failed:', err)
      );
    }

    // Get encouraging message based on today's progress
    const todayCheckIns = await CheckIn.countDocuments({
      userId: user.userId,
      dateISO,
    });

    const messages = [
      'Another drop in your progress pool!',
      'Keep the flow going!',
      'Your consistency is building something beautiful.',
      'One more step forward.',
      'Ripples of progress!',
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return NextResponse.json(
      {
        message: randomMessage,
        data: {
          checkIn: checkIn.toSafeObject(),
          todayCount: todayCheckIns,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create check-in error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Task already completed for this day', data: null },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create check-in', data: process.env.NODE_ENV === 'development' ? { error: error.message } : null },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/checkins
 * Remove a check-in (uncheck a task)
 * Body: { routineId, taskId, dateISO? }
 */
export async function DELETE(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { routineId, taskId } = body;
    
    // Get user's timezone for accurate "today" calculation
    let userTimezone = 'UTC';
    if (user.userId !== 'demo-user-123') {
      await connectDB();
      const dbUser = await User.findById(user.userId).select('preferences.timezone');
      userTimezone = dbUser?.preferences?.timezone || 'UTC';
    }
    
    const dateISO = body.dateISO || getTodayInTimezone(userTimezone);

    // Validate required fields
    if (!routineId || !taskId) {
      return NextResponse.json(
        { message: 'Routine ID and Task ID are required', data: null },
        { status: 400 }
      );
    }

    // Demo mode - use in-memory storage
    if (user.userId === 'demo-user-123') {
      const key = `${routineId}_${taskId}_${dateISO}`;
      demoCheckIns.delete(key);
      
      return NextResponse.json({
        message: 'Check-in removed',
        isDemo: true,
      });
    }

    // Delete check-in
    const result = await CheckIn.deleteOne({
      userId: user.userId,
      routineId,
      taskId,
      dateISO,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Check-in not found', data: null },
        { status: 404 }
      );
    }

    // Recalculate streak after deletion
    const remainingToday = await CheckIn.countDocuments({
      userId: user.userId,
      dateISO,
    });

    if (remainingToday === 0) {
      // No more check-ins for this day — recalculate streak
      const dbUser = await User.findById(user.userId).select('analytics');

      if (dbUser && dbUser.analytics?.lastActiveDate === dateISO) {
        // Find the most recent day before dateISO that still has check-ins
        const previousCheckIn = await CheckIn.findOne({
          userId: user.userId,
          dateISO: { $lt: dateISO },
        }).sort({ dateISO: -1 }).select('dateISO').lean();

        const newLastActive = previousCheckIn?.dateISO || null;

        // Walk backwards from newLastActive to count current streak
        let newStreak = 0;
        if (newLastActive) {
          newStreak = 1;
          let walkDate = new Date(newLastActive + 'T12:00:00Z');
          while (newStreak < 1000) {
            walkDate.setDate(walkDate.getDate() - 1);
            const prevISO = walkDate.toISOString().split('T')[0];
            const exists = await CheckIn.countDocuments({
              userId: user.userId,
              dateISO: prevISO,
            });
            if (exists > 0) {
              newStreak++;
            } else {
              break;
            }
          }
        }

        await User.findByIdAndUpdate(user.userId, {
          $inc: { 'analytics.totalCheckIns': -1 },
          $set: {
            'analytics.currentStreak': newStreak,
            'analytics.lastActiveDate': newLastActive,
          },
        });
      } else {
        // Deleted a check-in from a day that isn't lastActiveDate — just decrement count
        await User.findByIdAndUpdate(user.userId, {
          $inc: { 'analytics.totalCheckIns': -1 },
        });
      }
    } else {
      // Still have check-ins for this day — just decrement count
      await User.findByIdAndUpdate(user.userId, {
        $inc: { 'analytics.totalCheckIns': -1 },
      });
    }

    return NextResponse.json(
      {
        message: 'No worries, take your time.',
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete check-in error:', error);
    return NextResponse.json(
      { message: 'Failed to remove check-in', data: process.env.NODE_ENV === 'development' ? { error: error.message } : null },
      { status: 500 }
    );
  }
}
