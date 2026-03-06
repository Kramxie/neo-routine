import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';
import Routine from '@/models/Routine';
import CheckIn from '@/models/CheckIn';
import Badge from '@/models/Badge';
import Goal from '@/models/Goal';
import { getDailyQuote as _getDailyQuote, getTimeBasedQuote, getStreakQuote } from '@/lib/quotes';
import { getTodayInTimezone } from '@/lib/timezone';

/**
 * GET /api/dashboard/stats
 * Returns comprehensive dashboard data for the motivational dashboard:
 * - User info with streak data
 * - Today's tasks and progress
 * - Motivational quote
 * - Recent badges
 * - Streak-at-risk status
 *
 * Query params: ?date=YYYY-MM-DD (optional, uses client's local date to
 * avoid timezone mismatches between server clock and browser).
 */
export async function GET(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authUser.userId;

    // Demo user — return mock stats without DB lookup
    if (userId === 'demo-user-123') {
      const now = new Date();
      const hour = now.getHours();
      const pad = (n) => String(n).padStart(2, '0');
      const _todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      let greeting;
      if (hour < 12) greeting = 'Good morning, Demo User! ☀️';
      else if (hour < 17) greeting = 'Good afternoon, Demo User! 👋';
      else if (hour < 21) greeting = 'Good evening, Demo User! 🌙';
      else greeting = 'Still going, Demo User? 🦉';

      const weekDates = [];
      for (let i = 6; i >= 0; i--) {
        const dt = new Date(now);
        dt.setDate(dt.getDate() - i);
        weekDates.push(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`);
      }

      return NextResponse.json({
        success: true,
        data: {
          greeting,
          quote: { text: 'Every drop counts. Stay consistent!', author: 'NeoRoutine' },
          user: { name: 'Demo User', tier: 'premium', preferences: { timezone: 'UTC' } },
          stats: {
            currentStreak: 3, longestStreak: 7, totalCheckIns: 42,
            todayPercent: 0, completedTasks: 0, totalTasks: 5, tasksRemaining: 5, activeGoals: 0,
          },
          streakAtRisk: false,
          routineProgress: [
            { id: 'demo-routine-1', title: 'Morning Routine', color: 'neo', totalTasks: 3, completedTasks: 0, percent: 0, isComplete: false },
            { id: 'demo-routine-2', title: 'Evening Wind Down', color: 'calm', totalTasks: 2, completedTasks: 0, percent: 0, isComplete: false },
          ],
          goalsProgress: [],
          badges: [],
          newBadgesCount: 0,
          celebrations: [],
          weeklyData: weekDates.map(dateISO => ({ dateISO, percent: 0 })),
          timestamp: now.toISOString(),
        },
      });
    }

    await connectDB();
    
    // Get today's date — prefer the client-supplied date param so stats
    // align with the user's local calendar, not the server's TZ.
    const now = new Date();
    const hour = now.getHours();
    const pad = (n) => String(n).padStart(2, '0');

    const { searchParams } = new URL(request.url);
    const clientDate = searchParams.get('date');
    // Accept YYYY-MM-DD from client; fall back to user's TZ, then server clock
    const userDoc = await User.findById(userId).select('name email analytics preferences tier');
    const userTimezone = userDoc?.preferences?.timezone || 'UTC';
    const todayISO = (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate))
      ? clientDate
      : getTodayInTimezone(userTimezone);
    
    // Yesterday's date for streak check (relative to todayISO, not server clock)
    const [y, m, d] = todayISO.split('-').map(Number);
    const yesterdayDate = new Date(Date.UTC(y, m - 1, d));
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterdayISO = `${yesterdayDate.getUTCFullYear()}-${pad(yesterdayDate.getUTCMonth() + 1)}-${pad(yesterdayDate.getUTCDate())}`;

    // Parallel data fetching (user already fetched above for timezone)
    // Build 7-day date range for weekly streak data
    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(Date.UTC(y, m - 1, d));
      dt.setUTCDate(dt.getUTCDate() - i);
      weekDates.push(`${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`);
    }
    const weekStartISO = weekDates[0];
    const weekEndISO = weekDates[6];

    const [routines, todayCheckIns, _yesterdayCheckIns, badges, goals, weekCheckIns] = await Promise.all([
      Routine.find({ userId, isArchived: false }).lean(),
      CheckIn.find({ userId, dateISO: todayISO }).lean(),
      CheckIn.find({ userId, dateISO: yesterdayISO }).lean(),
      Badge.find({ userId }).sort({ earnedAt: -1 }).limit(5).lean(),
      Goal.find({ userId, status: 'active' }).lean(),
      CheckIn.find({ userId, dateISO: { $gte: weekStartISO, $lte: weekEndISO } }).lean(),
    ]);

    // Alias for the rest of the handler
    const user = userDoc;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate today's progress
    const totalTasks = routines.reduce(
      (sum, r) => sum + (r.tasks?.filter(t => t.isActive !== false).length || 0),
      0
    );
    const completedTasks = todayCheckIns.length;
    const todayPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get streak data
    const currentStreak = user.analytics?.currentStreak || 0;
    const longestStreak = user.analytics?.longestStreak || 0;
    const totalCheckIns = user.analytics?.totalCheckIns || 0;

    // Check if streak is at risk (no check-ins yet today and had a streak)
    const streakAtRisk = currentStreak > 0 && completedTasks === 0 && hour >= 18;

    // Generate personalized greeting
    let greeting;
    if (hour < 12) {
      greeting = `Good morning, ${user.name?.split(' ')[0] || 'there'}! ☀️`;
    } else if (hour < 17) {
      greeting = `Good afternoon, ${user.name?.split(' ')[0] || 'there'}! 👋`;
    } else if (hour < 21) {
      greeting = `Good evening, ${user.name?.split(' ')[0] || 'there'}! 🌙`;
    } else {
      greeting = `Still going, ${user.name?.split(' ')[0] || 'there'}? 🦉`;
    }

    // Get appropriate quote
    let quote;
    if (streakAtRisk) {
      quote = getStreakQuote(0); // At-risk message
    } else if (currentStreak > 0) {
      quote = getStreakQuote(currentStreak);
    } else {
      quote = getTimeBasedQuote();
    }

    // Get tasks remaining today
    const tasksRemaining = totalTasks - completedTasks;

    // Get uncompleted routines with their progress
    const routineProgress = routines.map(routine => {
      const routineTasks = routine.tasks?.filter(t => t.isActive !== false) || [];
      const completedRoutineTasks = todayCheckIns.filter(
        c => String(c.routineId) === String(routine._id)
      ).length;
      
      return {
        id: routine._id,
        title: routine.title,
        color: routine.color || 'neo',
        totalTasks: routineTasks.length,
        completedTasks: completedRoutineTasks,
        percent: routineTasks.length > 0 
          ? Math.round((completedRoutineTasks / routineTasks.length) * 100) 
          : 0,
        isComplete: completedRoutineTasks >= routineTasks.length,
      };
    });

    // Get active goals progress
    const goalsProgress = goals.map(goal => ({
      id: goal._id,
      title: goal.title,
      progress: goal.targetValue > 0 
        ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
        : 0,
      currentValue: goal.currentValue || 0,
      targetValue: goal.targetValue || 100,
    }));

    // New badges (unseen)
    const newBadges = badges.filter(b => !b.seen);

    // Celebration triggers
    const celebrations = [];
    
    // Check for milestone streaks
    const streakMilestones = [7, 14, 30, 60, 100, 365];
    if (streakMilestones.includes(currentStreak) && completedTasks > 0) {
      celebrations.push({
        type: currentStreak >= 100 ? 'milestone' : 'streak',
        message: `🔥 ${currentStreak}-Day Streak!`,
        subMessage: getStreakCelebrationMessage(currentStreak),
      });
    }

    // Perfect day celebration
    if (todayPercent === 100 && completedTasks > 0) {
      celebrations.push({
        type: 'achievement',
        message: '✨ Perfect Day!',
        subMessage: 'You completed everything today!',
      });
    }

    // Build response
    return NextResponse.json({
      success: true,
      data: {
        greeting,
        quote,
        user: {
          name: user.name,
          tier: user.tier,
          preferences: user.preferences,
        },
        stats: {
          currentStreak,
          longestStreak,
          totalCheckIns,
          todayPercent,
          completedTasks,
          totalTasks,
          tasksRemaining,
          activeGoals: goals.length,
        },
        streakAtRisk,
        routineProgress,
        goalsProgress: goalsProgress.slice(0, 3), // Top 3 active goals
        badges: badges.map(b => ({
          badgeId: b.badgeId,
          earnedAt: b.earnedAt,
          seen: b.seen,
        })),
        newBadgesCount: newBadges.length,
        celebrations,
        weeklyData: weekDates.map(dateISO => {
          const dayCheckIns = weekCheckIns.filter(c => c.dateISO === dateISO);
          const uniqueTasks = new Set(dayCheckIns.map(c => c.taskId.toString()));
          return {
            dateISO,
            percent: totalTasks > 0 ? Math.round((uniqueTasks.size / totalTasks) * 100) : 0,
          };
        }),
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Dashboard Stats] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

// Helper function for streak celebration messages
function getStreakCelebrationMessage(streak) {
  if (streak >= 365) return 'A YEAR of dedication! Legendary!';
  if (streak >= 100) return 'Triple digits! You\'re unstoppable!';
  if (streak >= 60) return 'Two months strong! Incredible!';
  if (streak >= 30) return 'One month of consistency!';
  if (streak >= 14) return 'Two weeks straight! Keep going!';
  if (streak >= 7) return 'One week in the books!';
  return 'Keep the momentum going!';
}
