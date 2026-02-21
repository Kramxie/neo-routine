import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';
import Routine from '@/models/Routine';
import CheckIn from '@/models/CheckIn';
import { sendPushToUser } from '@/lib/push';

/**
 * Smart Notifications API
 * Handles adaptive reminders and streak-at-risk alerts
 */

// Helper to get date in YYYY-MM-DD format
function getDateISO(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Helper to get time string from Date
function getTimeString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Analyze user's completion patterns to find best reminder time
async function analyzeUserPatterns(userId) {
  await connectDB();
  
  // Get last 30 days of check-ins
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  
  const checkIns = await CheckIn.find({
    userId,
    dateISO: { $gte: getDateISO(start), $lte: getDateISO(end) },
  })
    .sort({ createdAt: 1 })
    .lean();

  if (checkIns.length === 0) {
    return {
      preferredTime: '09:00',
      preferredDays: [1, 2, 3, 4, 5], // Weekdays
      bestTimeOfDay: 'morning',
      consistency: 0,
    };
  }

  // Analyze check-in times
  const hourCounts = {};
  const dayOfWeekCounts = {};
  
  checkIns.forEach(checkIn => {
    const createdAt = new Date(checkIn.createdAt);
    const hour = createdAt.getHours();
    const dayOfWeek = createdAt.getDay();
    
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
  });

  // Find most common hour
  const bestHour = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 9;

  // Find best days
  const bestDays = Object.entries(dayOfWeekCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([day]) => parseInt(day));

  // Determine time of day
  let bestTimeOfDay = 'morning';
  if (bestHour >= 12 && bestHour < 17) bestTimeOfDay = 'afternoon';
  if (bestHour >= 17 && bestHour < 21) bestTimeOfDay = 'evening';
  if (bestHour >= 21 || bestHour < 5) bestTimeOfDay = 'night';

  // Calculate consistency score
  const uniqueDays = new Set(checkIns.map(c => c.dateISO)).size;
  const consistency = Math.round((uniqueDays / 30) * 100);

  return {
    preferredTime: `${String(bestHour).padStart(2, '0')}:00`,
    preferredDays: bestDays,
    bestTimeOfDay,
    consistency,
    totalCheckIns: checkIns.length,
    uniqueDays,
  };
}

/**
 * GET /api/notifications/smart
 * Get smart notification settings and patterns for the user
 */
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const userId = authUser.userId;

    // Get user preferences
    const user = await User.findById(userId).select('preferences analytics');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Analyze patterns
    const patterns = await analyzeUserPatterns(userId);

    // Get today's progress for streak-at-risk check
    const todayISO = getDateISO();
    const todayCheckIns = await CheckIn.countDocuments({ userId, dateISO: todayISO });
    const currentStreak = user.analytics?.currentStreak || 0;
    const hour = new Date().getHours();

    // Streak at risk logic
    let streakAtRisk = false;
    let riskLevel = 'none';
    
    if (currentStreak > 0 && todayCheckIns === 0) {
      if (hour >= 20) {
        streakAtRisk = true;
        riskLevel = 'critical'; // Very close to midnight
      } else if (hour >= 17) {
        streakAtRisk = true;
        riskLevel = 'warning'; // Evening, should do something
      } else if (hour >= 12) {
        riskLevel = 'attention'; // Getting late
      }
    }

    // Generate smart suggestions
    const suggestions = [];
    
    if (patterns.bestTimeOfDay) {
      suggestions.push({
        type: 'time',
        message: `You usually complete tasks in the ${patterns.bestTimeOfDay}`,
        detail: `Most check-ins happen around ${patterns.preferredTime}`,
      });
    }

    if (patterns.preferredDays.length > 0) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const bestDay = dayNames[patterns.preferredDays[0]];
      suggestions.push({
        type: 'day',
        message: `${bestDay} is your most active day`,
        detail: 'Consider scheduling important tasks then',
      });
    }

    if (patterns.consistency < 50) {
      suggestions.push({
        type: 'consistency',
        message: 'Setting a daily reminder can boost consistency',
        detail: 'Users with reminders complete 40% more tasks',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        preferences: {
          reminderTime: user.preferences?.reminderTime || '09:00',
          reminderFrequency: user.preferences?.reminderFrequency || 'normal',
          activeDays: user.preferences?.activeDays || 127,
        },
        patterns,
        streak: {
          current: currentStreak,
          atRisk: streakAtRisk,
          riskLevel,
          todayCheckIns,
        },
        suggestions,
        hasPushEnabled: user.pushSubscriptions?.length > 0,
      },
    });
  } catch (error) {
    console.error('[Smart Notifications] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/smart
 * Trigger a smart notification (for cron/scheduled jobs)
 * Body: { type: 'reminder' | 'streak_risk' | 'encouragement' }
 */
export async function POST(request) {
  try {
    // This endpoint can be called by cron jobs
    // For now, require auth for manual testing
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type = 'reminder' } = body;

    await connectDB();
    const userId = authUser.userId;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if notifications should be sent
    if (user.preferences?.reminderFrequency === 'off') {
      return NextResponse.json({
        success: true,
        data: { sent: false, reason: 'Notifications disabled' },
      });
    }

    // Build notification based on type
    let notification = {
      title: 'Neo Routine',
      body: 'Time to check in!',
      url: '/dashboard',
      tag: 'reminder',
    };

    const todayISO = getDateISO();
    const todayCheckIns = await CheckIn.countDocuments({ userId, dateISO: todayISO });
    const currentStreak = user.analytics?.currentStreak || 0;

    if (type === 'streak_risk') {
      if (currentStreak > 0 && todayCheckIns === 0) {
        notification = {
          title: `🔥 ${currentStreak}-Day Streak at Risk!`,
          body: 'Don\'t break the chain! Complete just one task today.',
          url: '/dashboard',
          tag: 'streak-alert',
        };
      } else {
        return NextResponse.json({
          success: true,
          data: { sent: false, reason: 'No streak risk' },
        });
      }
    } else if (type === 'encouragement') {
      const messages = [
        'Every drop counts! Time to build your flow.',
        'Small steps lead to big changes. Let\'s go!',
        'Your future self will thank you. Start now!',
        'Consistency beats intensity. One task at a time.',
      ];
      notification = {
        title: '💧 Daily Reminder',
        body: messages[Math.floor(Math.random() * messages.length)],
        url: '/dashboard',
        tag: 'encouragement',
      };
    }

    // Send push notification
    if (user.pushSubscriptions?.length > 0) {
      await sendPushToUser(user, notification);
      return NextResponse.json({
        success: true,
        data: { sent: true, notification },
      });
    }

    return NextResponse.json({
      success: true,
      data: { sent: false, reason: 'No push subscriptions' },
    });
  } catch (error) {
    console.error('[Smart Notifications] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
