import connectDB from './db';
import CheckIn from '@/models/CheckIn';
import User from '@/models/User';
import Routine from '@/models/Routine';
import Goal from '@/models/Goal';
import RoutineTemplate from '@/models/RoutineTemplate';

/**
 * Helper to compute date ISO strings for range
 */
function getRangeDates(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const dates = [];
  const iter = new Date(start);
  while (iter <= end) {
    dates.push(toISO(iter));
    iter.setDate(iter.getDate() + 1);
  }

  return { startISO: toISO(start), endISO: toISO(end), dates };
}

/**
 * Get basic user insights (check-ins series, totals, streaks)
 */
export async function getUserInsights(userId, days = 30) {
  await connectDB();

  const { startISO, endISO, dates } = getRangeDates(days);

  // Get user's routines
  const routines = await Routine.find({ userId, isArchived: false }).lean();
  
  // Get user's goals
  const goals = await Goal.find({ userId, status: { $in: ['active', 'completed'] } }).lean();

  // Aggregate check-ins per dateISO
  const seriesAgg = await CheckIn.aggregate([
    { $match: { userId: userId, dateISO: { $gte: startISO, $lte: endISO } } },
    { $group: { _id: '$dateISO', count: { $sum: 1 } } },
    { $project: { dateISO: '$_id', count: 1, _id: 0 } },
  ]);

  const seriesMap = new Map(seriesAgg.map((s) => [s.dateISO, s.count]));
  const series = dates.map((d) => ({ dateISO: d, checkIns: seriesMap.get(d) || 0 }));

  const totalCheckIns = series.reduce((s, r) => s + r.checkIns, 0);

  // Use stored analytics streaks if present
  const user = await User.findById(userId).select('analytics');

  const streaks = {
    current: user?.analytics?.currentStreak || 0,
    longest: user?.analytics?.longestStreak || 0,
  };

  // Compute derived fields for frontend
  const maxCount = Math.max(...series.map((s) => s.checkIns), 1);

  // dailyData: [{ date, day, percent }]
  const dailyData = series.map((s) => {
    const d = new Date(s.dateISO + 'T00:00:00Z');
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
    const percent = maxCount > 0 ? Math.round((s.checkIns / maxCount) * 100) : 0;
    return { date: s.dateISO, day, checkIns: s.checkIns, percent };
  });

  // Weekly summary (last 7 days)
  const last7 = dailyData.slice(-7);
  const daysWithActivity = last7.filter((d) => d.checkIns > 0).length;
  const weeklyCompletionRate = last7.length > 0 ? Math.round((last7.reduce((a, b) => a + b.checkIns, 0) / (last7.length || 1)) ) : 0;

  // Best day of week
  const dowCounts = {}; // 0-6 -> count
  series.forEach((s) => {
    const d = new Date(s.dateISO + 'T00:00:00Z');
    const idx = d.getUTCDay();
    dowCounts[idx] = (dowCounts[idx] || 0) + s.checkIns;
  });
  let bestDayOfWeek = undefined;
  if (Object.keys(dowCounts).length > 0) {
    bestDayOfWeek = Number(Object.entries(dowCounts).sort((a, b) => b[1] - a[1])[0][0]);
  }

  // ========== ROUTINE STATS ==========
  // Get check-ins grouped by routine
  const routineCheckIns = await CheckIn.aggregate([
    { $match: { userId: userId, dateISO: { $gte: startISO, $lte: endISO } } },
    { $group: { _id: '$routineId', count: { $sum: 1 } } },
  ]);
  
  const routineCheckInMap = new Map(routineCheckIns.map((r) => [r._id?.toString(), r.count]));
  
  const routineStats = routines.map((routine) => {
    const routineIdStr = routine._id.toString();
    const completed = routineCheckInMap.get(routineIdStr) || 0;
    const totalTasks = routine.tasks?.filter(t => t.isActive !== false).length || 0;
    const totalPossible = totalTasks * days;
    const completionRate = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
    
    return {
      id: routineIdStr,
      name: routine.title || routine.name,
      color: routine.color || 'neo',
      completed,
      totalPossible,
      totalTasks,
      completionRate: Math.min(100, completionRate),
    };
  }).sort((a, b) => b.completionRate - a.completionRate);

  // ========== GOALS STATS ==========
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalGoals = goals.length;
  
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

  // ========== SMART INSIGHTS ==========
  const insights = generateInsights({
    totalCheckIns,
    streaks,
    daysWithActivity: series.filter((s) => s.checkIns > 0).length,
    days,
    routineStats,
    goalsProgress,
    bestDayOfWeek,
    dowCounts,
  });

  const summary = {
    totalCheckIns,
    completionRate: maxCount > 0 ? Math.round((totalCheckIns / (days * maxCount)) * 100) : 0,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    daysWithActivity: series.filter((s) => s.checkIns > 0).length,
    activeDayRate: Math.round((series.filter((s) => s.checkIns > 0).length / days) * 100),
    trend: 0,
    trendDirection: 'up',
    routineCount: routines.length,
    activeGoals,
    completedGoals,
    totalGoals,
    avgGoalProgress,
  };

  const weekly = {
    completionRate: weeklyCompletionRate,
    daysWithActivity,
    message: getWeeklyMessage(daysWithActivity, weeklyCompletionRate),
  };

  const patterns = { 
    bestDayOfWeek,
    worstDayOfWeek: Object.keys(dowCounts).length > 0 
      ? Number(Object.entries(dowCounts).sort((a, b) => a[1] - b[1])[0][0]) 
      : undefined,
  };

  return {
    rangeDays: days,
    totals: { checkIns: totalCheckIns },
    series,
    streaks,
    summary,
    dailyData,
    weekly,
    routineStats,
    goalsProgress,
    insights,
    patterns,
  };
}

/**
 * Generate weekly motivational message
 */
function getWeeklyMessage(daysWithActivity, _completionRate) {
  if (daysWithActivity >= 6) return "Incredible consistency! You're in the zone.";
  if (daysWithActivity >= 5) return "Great week! Keep the momentum going.";
  if (daysWithActivity >= 4) return "Solid progress - you're building habits.";
  if (daysWithActivity >= 3) return "Good start! Try for one more day this week.";
  if (daysWithActivity >= 1) return "Every drop counts - keep showing up!";
  return "A new week, a fresh start. You got this!";
}

/**
 * Generate smart insights based on user data
 */
function generateInsights({ totalCheckIns, streaks, daysWithActivity, days, routineStats, goalsProgress, bestDayOfWeek, dowCounts }) {
  const insights = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Streak insight
  if (streaks.current >= 7) {
    insights.push({
      icon: '🔥',
      title: 'On Fire!',
      description: `${streaks.current} day streak! You're building strong habits.`,
      type: 'achievement',
    });
  } else if (streaks.current >= 3) {
    insights.push({
      icon: '⚡',
      title: 'Building Momentum',
      description: `${streaks.current} days in a row. Keep it going!`,
      type: 'positive',
    });
  }

  // Best day insight
  if (bestDayOfWeek !== undefined && Object.values(dowCounts).some(c => c > 0)) {
    insights.push({
      icon: '📅',
      title: 'Your Power Day',
      description: `You're most productive on ${dayNames[bestDayOfWeek]}s.`,
      type: 'pattern',
    });
  }

  // Routine performance insight
  if (routineStats.length > 0) {
    const bestRoutine = routineStats[0];
    if (bestRoutine.completionRate >= 70) {
      insights.push({
        icon: '🏆',
        title: 'Top Routine',
        description: `"${bestRoutine.name}" is your strongest at ${bestRoutine.completionRate}%.`,
        type: 'achievement',
      });
    }
    
    const worstRoutine = routineStats[routineStats.length - 1];
    if (routineStats.length > 1 && worstRoutine.completionRate < 30 && worstRoutine.completionRate < bestRoutine.completionRate) {
      insights.push({
        icon: '💡',
        title: 'Room to Grow',
        description: `"${worstRoutine.name}" needs attention (${worstRoutine.completionRate}%). Try smaller steps.`,
        type: 'suggestion',
      });
    }
  }

  // Goals insight
  const almostDoneGoals = goalsProgress.filter(g => g.progress >= 80 && g.progress < 100);
  if (almostDoneGoals.length > 0) {
    insights.push({
      icon: '🎯',
      title: 'Almost There!',
      description: `${almostDoneGoals.length} goal${almostDoneGoals.length > 1 ? 's are' : ' is'} over 80% complete.`,
      type: 'motivation',
    });
  }

  // Consistency insight
  const consistencyRate = Math.round((daysWithActivity / days) * 100);
  if (consistencyRate >= 80) {
    insights.push({
      icon: '💧',
      title: 'Consistency Master',
      description: `Active ${consistencyRate}% of days - excellent discipline!`,
      type: 'achievement',
    });
  } else if (consistencyRate < 30 && totalCheckIns > 0) {
    insights.push({
      icon: '🌱',
      title: 'Growth Opportunity',
      description: 'Try setting a daily reminder to build consistency.',
      type: 'suggestion',
    });
  }

  // Volume insight
  if (totalCheckIns >= 100) {
    insights.push({
      icon: '💯',
      title: 'Century Club!',
      description: `${totalCheckIns} tasks completed - impressive dedication!`,
      type: 'achievement',
    });
  } else if (totalCheckIns >= 50) {
    insights.push({
      icon: '🌊',
      title: 'Making Waves',
      description: `${totalCheckIns} tasks done. You're building momentum!`,
      type: 'positive',
    });
  }

  return insights.slice(0, 5); // Limit to 5 insights
}

/**
 * Get coach-level analytics (active clients, clients list, check-ins series)
 */
export async function getCoachInsights(coachId, days = 30) {
  await connectDB();

  const { startISO, endISO, dates } = getRangeDates(days);

  // Find active clients
  const clients = await User.find({ 'coaching.coachId': coachId, 'coaching.status': 'active' }).select(
    'name email analytics coaching'
  );

  const clientIds = clients.map((c) => c._id);

  // Aggregate check-ins from clients
  const seriesAgg = await CheckIn.aggregate([
    { $match: { userId: { $in: clientIds }, dateISO: { $gte: startISO, $lte: endISO } } },
    { $group: { _id: '$dateISO', count: { $sum: 1 } } },
    { $project: { dateISO: '$_id', count: 1, _id: 0 } },
  ]);

  const seriesMap = new Map(seriesAgg.map((s) => [s.dateISO, s.count || 0]));
  const series = dates.map((d) => ({ dateISO: d, checkIns: seriesMap.get(d) || 0 }));

  // Total check-ins
  const totalCheckIns = series.reduce((s, r) => s + r.checkIns, 0);

  // Template adoptions by this coach
  const templates = await RoutineTemplate.find({ coachId: coachId }).select('stats adoptions title');
  const templateAdoptions = templates.reduce((s, t) => s + (t.stats?.adoptions || 0), 0);

  // Clients summary
  const clientsSummary = clients.map((c) => ({
    id: c._id,
    name: c.name,
    email: c.email,
    lastActive: c.analytics?.lastActiveDate || null,
    totalCheckIns: c.analytics?.totalCheckIns || 0,
    coaching: c.coaching,
  }));

  return {
    coachId,
    rangeDays: days,
    totals: {
      activeClients: clients.length,
      checkIns: totalCheckIns,
      templateAdoptions,
    },
    series,
    clients: clientsSummary,
  };
}

const analytics = {
  getUserInsights,
  getCoachInsights,
};

export default analytics;
