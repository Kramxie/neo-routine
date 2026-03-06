import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Routine from '@/models/Routine';
import CheckIn from '@/models/CheckIn';
import User from '@/models/User';
import Goal from '@/models/Goal';
import { calculateCompletionStats, generateInsights, getWeeklyMessage } from '@/lib/reminderEngine';
import { getEffectiveTier, getInsightsDaysLimit } from '@/lib/features';

/**
 * GET /api/insights
 * Get comprehensive insights and analytics for the current user
 */
export async function GET(request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get time range from query params (default: 30 days)
    const { searchParams } = new URL(request.url);
    const requestedDays = parseInt(searchParams.get('days') || searchParams.get('range')) || 30;

    await connectDB();

    // Enforce insightsDays tier limit
    const dbUser = await User.findById(authUser.userId).select('tier subscription role analytics createdAt');
    const effectiveTier = getEffectiveTier(dbUser);
    const tierDaysLimit = getInsightsDaysLimit(effectiveTier);
    const days = Math.min(requestedDays, tierDaysLimit);

    // Get user's routines
    const routines = await Routine.find({
      userId: authUser.userId,
      isArchived: { $ne: true },
    });

    // Calculate total tasks per day
    const totalTasksPerDay = routines.reduce(
      (sum, routine) => sum + routine.tasks.filter((t) => t.isActive !== false).length,
      0
    );

    // Get check-ins for the time period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString().split('T')[0];

    const checkIns = await CheckIn.find({
      userId: authUser.userId,
      dateISO: { $gte: startDateISO },
    }).sort({ dateISO: -1 });

    // Calculate completion stats
    const stats = calculateCompletionStats(checkIns, totalTasksPerDay, days);

    // Generate personalized insights
    const user = dbUser; // already fetched above with analytics field
    const insights = generateInsights(stats, user?.analytics || {});

    // Calculate daily breakdown for chart
    const dailyData = [];
    const now = new Date();
    const checkInsByDate = {};
    
    checkIns.forEach((ci) => {
      checkInsByDate[ci.dateISO] = (checkInsByDate[ci.dateISO] || 0) + 1;
    });

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateISO = date.toISOString().split('T')[0];
      const completed = checkInsByDate[dateISO] || 0;
      const percent = totalTasksPerDay > 0 
        ? Math.round((completed / totalTasksPerDay) * 100)
        : 0;

      dailyData.push({
        date: dateISO,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        total: totalTasksPerDay,
        percent,
      });
    }

    // Calculate routine-specific stats
    const routineStats = await Promise.all(
      routines.map(async (routine) => {
        const routineCheckIns = checkIns.filter(
          (ci) => ci.routineId.toString() === routine._id.toString()
        );
        const activeTasks = routine.tasks.filter((t) => t.isActive !== false);
        const totalPossible = activeTasks.length * days;
        const completed = routineCheckIns.length;

        return {
          id: routine._id,
          name: routine.title,
          color: routine.color,
          taskCount: activeTasks.length,
          completed,
          totalPossible,
          completionRate: totalPossible > 0 
            ? Math.round((completed / totalPossible) * 100)
            : 0,
        };
      })
    );

    // Get weekly summary
    const weeklyStats = calculateCompletionStats(checkIns, totalTasksPerDay, 7);
    const weeklyMessage = getWeeklyMessage(weeklyStats.completionRate);

    // Calculate trend (comparing last 7 days to previous 7 days)
    const last7Days = checkIns.filter((ci) => {
      const date = new Date(ci.dateISO);
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length;

    const prev7Days = checkIns.filter((ci) => {
      const date = new Date(ci.dateISO);
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    const trend = prev7Days > 0 
      ? Math.round(((last7Days - prev7Days) / prev7Days) * 100)
      : last7Days > 0 ? 100 : 0;

    // Update user analytics
    if (user) {
      user.analytics = {
        ...user.analytics,
        currentStreak: stats.currentStreak,
        longestStreak: Math.max(user.analytics?.longestStreak || 0, stats.longestStreak),
        lastActiveDate: checkIns[0]?.dateISO || user.analytics?.lastActiveDate,
        totalCheckIns: await CheckIn.countDocuments({ userId: authUser.userId }),
        bestDayOfWeek: stats.bestDayOfWeek,
        preferredTimeOfDay: stats.preferredTimeOfDay,
      };
      await user.save();
    }

    // ========== GOALS PROGRESS ==========
    const goals = await Goal.find({
      userId: authUser.userId,
      status: { $in: ['active', 'completed'] },
    }).lean();

    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;

    const goalsProgress = goals.map((goal) => {
      const progress = goal.targetValue > 0
        ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
        : 0;
      return {
        id: goal._id.toString(),
        title: goal.title,
        category: goal.category,
        progress,
        currentValue: goal.currentValue || 0,
        targetValue: goal.targetValue || 100,
        dueDate: goal.dueDate,
        status: goal.status,
      };
    });

    const avgGoalProgress = goalsProgress.length > 0
      ? Math.round(goalsProgress.reduce((acc, g) => acc + g.progress, 0) / goalsProgress.length)
      : 0;

    return NextResponse.json({
      summary: {
        totalCheckIns: checkIns.length,
        totalPossible: totalTasksPerDay * days,
        completionRate: stats.completionRate,
        daysWithActivity: stats.daysWithActivity,
        activeDayRate: stats.activeDayRate,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        trend,
        trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
        activeGoals,
        completedGoals,
        avgGoalProgress,
      },
      weekly: {
        completionRate: weeklyStats.completionRate,
        message: weeklyMessage,
        daysWithActivity: weeklyStats.daysWithActivity,
      },
      insights,
      dailyData,
      routineStats,
      goalsProgress,
      patterns: {
        bestDayOfWeek: stats.bestDayOfWeek,
        preferredTimeOfDay: stats.preferredTimeOfDay,
      },
      limits: {
        insightsDays: tierDaysLimit,
        tier: effectiveTier,
        daysRequested: requestedDays,
        daysCapped: days,
      },
    });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to get insights' },
      { status: 500 }
    );
  }
}
