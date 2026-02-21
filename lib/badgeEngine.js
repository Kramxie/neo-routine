import connectDB from './db';
import Badge from '@/models/Badge';
import User from '@/models/User';
import CheckIn from '@/models/CheckIn';
import Routine from '@/models/Routine';
import Goal from '@/models/Goal';

/**
 * Badge Engine
 * Automatically awards badges based on user actions and milestones
 */

// Badge thresholds
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];
const CHECKIN_MILESTONES = [1, 50, 100, 500, 1000];
const GOAL_MILESTONES = [1, 5, 10];

/**
 * Award a badge to a user (idempotent - won't duplicate)
 */
async function awardBadge(userId, badgeId, context = {}) {
  try {
    await connectDB();
    
    // Try to create the badge (will fail if already exists due to unique index)
    const badge = await Badge.findOneAndUpdate(
      { userId, badgeId },
      { $setOnInsert: { userId, badgeId, context, seen: false, earnedAt: new Date() } },
      { upsert: true, new: true, rawResult: true }
    );
    
    // Check if this was a new insert
    const isNew = badge.lastErrorObject?.upserted;
    
    if (isNew) {
      console.log(`[Badge] Awarded "${badgeId}" to user ${userId}`);
    }
    
    return { awarded: isNew, badge: badge.value };
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key - badge already exists
      return { awarded: false, alreadyExists: true };
    }
    console.error('[Badge] Award error:', error);
    return { awarded: false, error: error.message };
  }
}

/**
 * Check and award streak-based badges
 */
export async function checkStreakBadges(userId, currentStreak) {
  const awarded = [];
  
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak >= milestone) {
      const result = await awardBadge(userId, `streak_${milestone}`, { 
        value: currentStreak 
      });
      if (result.awarded) {
        awarded.push({ badgeId: `streak_${milestone}`, milestone });
      }
    }
  }
  
  return awarded;
}

/**
 * Check and award check-in volume badges
 */
export async function checkVolumeBadges(userId) {
  await connectDB();
  
  const user = await User.findById(userId).select('analytics');
  const totalCheckIns = user?.analytics?.totalCheckIns || 0;
  
  const awarded = [];
  
  // First check-in badge
  if (totalCheckIns >= 1) {
    const result = await awardBadge(userId, 'first_checkin', { value: 1 });
    if (result.awarded) {
      awarded.push({ badgeId: 'first_checkin', milestone: 1 });
    }
  }
  
  // Volume milestones
  const volumeMilestones = [50, 100, 500, 1000];
  for (const milestone of volumeMilestones) {
    if (totalCheckIns >= milestone) {
      const result = await awardBadge(userId, `checkins_${milestone}`, { 
        value: totalCheckIns 
      });
      if (result.awarded) {
        awarded.push({ badgeId: `checkins_${milestone}`, milestone });
      }
    }
  }
  
  return awarded;
}

/**
 * Check and award achievement badges (perfect day, time-based, etc.)
 */
export async function checkAchievementBadges(userId, completionData) {
  const awarded = [];
  const hour = new Date().getHours();
  
  // Perfect day badge
  if (completionData?.todayPercent === 100) {
    const result = await awardBadge(userId, 'perfect_day');
    if (result.awarded) {
      awarded.push({ badgeId: 'perfect_day' });
    }
  }
  
  // Early bird (before 7 AM)
  if (hour < 7) {
    const result = await awardBadge(userId, 'early_bird');
    if (result.awarded) {
      awarded.push({ badgeId: 'early_bird' });
    }
  }
  
  // Night owl (after 10 PM)
  if (hour >= 22) {
    const result = await awardBadge(userId, 'night_owl');
    if (result.awarded) {
      awarded.push({ badgeId: 'night_owl' });
    }
  }
  
  return awarded;
}

/**
 * Check and award goal-related badges
 */
export async function checkGoalBadges(userId) {
  await connectDB();
  
  const awarded = [];
  
  // Count goals
  const totalGoals = await Goal.countDocuments({ userId });
  const completedGoals = await Goal.countDocuments({ userId, status: 'completed' });
  
  // First goal badge
  if (totalGoals >= 1) {
    const result = await awardBadge(userId, 'first_goal');
    if (result.awarded) {
      awarded.push({ badgeId: 'first_goal' });
    }
  }
  
  // Goal completion badges
  if (completedGoals >= 1) {
    const result = await awardBadge(userId, 'goal_complete');
    if (result.awarded) {
      awarded.push({ badgeId: 'goal_complete' });
    }
  }
  
  if (completedGoals >= 5) {
    const result = await awardBadge(userId, 'five_goals');
    if (result.awarded) {
      awarded.push({ badgeId: 'five_goals' });
    }
  }
  
  return awarded;
}

/**
 * Check and award routine-related badges
 */
export async function checkRoutineBadges(userId) {
  await connectDB();
  
  const awarded = [];
  const routineCount = await Routine.countDocuments({ userId, isArchived: false });
  
  // First routine
  if (routineCount >= 1) {
    const result = await awardBadge(userId, 'first_routine');
    if (result.awarded) {
      awarded.push({ badgeId: 'first_routine' });
    }
  }
  
  // Five routines
  if (routineCount >= 5) {
    const result = await awardBadge(userId, 'five_routines');
    if (result.awarded) {
      awarded.push({ badgeId: 'five_routines' });
    }
  }
  
  return awarded;
}

/**
 * Check for perfect week (7 consecutive days at 100%)
 */
export async function checkPerfectWeekBadge(userId) {
  await connectDB();
  
  // Get last 7 days of check-ins
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  
  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  
  // Get user's routines
  const routines = await Routine.find({ userId, isArchived: false }).lean();
  if (routines.length === 0) return [];
  
  // Calculate expected tasks per day
  const totalTasksPerDay = routines.reduce(
    (sum, r) => sum + (r.tasks?.filter(t => t.isActive !== false).length || 0),
    0
  );
  
  if (totalTasksPerDay === 0) return [];
  
  // Check each day
  let perfectDays = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateISO = toISO(d);
    const checkIns = await CheckIn.countDocuments({ userId, dateISO });
    
    if (checkIns >= totalTasksPerDay) {
      perfectDays++;
    }
  }
  
  if (perfectDays >= 7) {
    const result = await awardBadge(userId, 'perfect_week');
    if (result.awarded) {
      return [{ badgeId: 'perfect_week' }];
    }
  }
  
  return [];
}

/**
 * Check for comeback badge (returning after 7+ days)
 */
export async function checkComebackBadge(userId) {
  await connectDB();
  
  const user = await User.findById(userId).select('analytics');
  const lastActiveDate = user?.analytics?.lastActiveDate;
  
  if (!lastActiveDate) return [];
  
  const lastActive = new Date(lastActiveDate);
  const now = new Date();
  const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff >= 7) {
    const result = await awardBadge(userId, 'comeback_kid', { daysAway: daysDiff });
    if (result.awarded) {
      return [{ badgeId: 'comeback_kid', daysAway: daysDiff }];
    }
  }
  
  return [];
}

/**
 * Run all badge checks for a user after a check-in
 * Returns array of newly awarded badges
 */
export async function runBadgeChecks(userId, completionData = {}) {
  const allAwarded = [];
  
  try {
    // Get user data
    await connectDB();
    const user = await User.findById(userId).select('analytics');
    const currentStreak = user?.analytics?.currentStreak || 0;
    
    // Run all checks in parallel
    const results = await Promise.all([
      checkStreakBadges(userId, currentStreak),
      checkVolumeBadges(userId),
      checkAchievementBadges(userId, completionData),
      checkGoalBadges(userId),
      checkRoutineBadges(userId),
      checkPerfectWeekBadge(userId),
    ]);
    
    // Flatten results
    results.forEach(badges => allAwarded.push(...badges));
    
  } catch (error) {
    console.error('[Badge Engine] Error running checks:', error);
  }
  
  return allAwarded;
}

/**
 * Get celebration configuration for newly awarded badges
 */
export function getCelebrationForBadge(badgeId) {
  // Map badge types to celebration types
  if (badgeId.startsWith('streak_')) {
    const streak = parseInt(badgeId.split('_')[1]);
    if (streak >= 100) return { type: 'milestone', pieces: 200 };
    if (streak >= 30) return { type: 'milestone', pieces: 150 };
    return { type: 'streak', pieces: 100 };
  }
  
  if (badgeId.includes('perfect')) {
    return { type: 'achievement', pieces: 120 };
  }
  
  if (badgeId.includes('goal')) {
    return { type: 'goal', pieces: 100 };
  }
  
  return { type: 'achievement', pieces: 80 };
}

export default {
  awardBadge,
  runBadgeChecks,
  checkStreakBadges,
  checkVolumeBadges,
  checkAchievementBadges,
  checkGoalBadges,
  checkRoutineBadges,
  checkPerfectWeekBadge,
  checkComebackBadge,
  getCelebrationForBadge,
};
