'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Achievements Page
 * Gamification - badges, streaks, milestones
 */

// Badge definitions
const BADGES = [
  {
    id: 'first_routine',
    name: 'First Drop',
    description: 'Create your first routine',
    icon: '&#128167;', // droplet
    tier: 'bronze',
    requirement: { type: 'routines_created', value: 1 },
  },
  {
    id: 'routine_master',
    name: 'Routine Master',
    description: 'Create 5 routines',
    icon: '&#127754;', // wave
    tier: 'silver',
    requirement: { type: 'routines_created', value: 5 },
  },
  {
    id: 'first_checkin',
    name: 'Getting Started',
    description: 'Complete your first check-in',
    icon: '&#10003;', // checkmark
    tier: 'bronze',
    requirement: { type: 'total_checkins', value: 1 },
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7 check-ins',
    icon: '&#128170;', // flexed bicep
    tier: 'bronze',
    requirement: { type: 'total_checkins', value: 7 },
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Complete 30 check-ins',
    icon: '&#127942;', // trophy
    tier: 'silver',
    requirement: { type: 'total_checkins', value: 30 },
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 check-ins',
    icon: '&#128081;', // crown
    tier: 'gold',
    requirement: { type: 'total_checkins', value: 100 },
  },
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Achieve a 3-day streak',
    icon: '&#128293;', // fire
    tier: 'bronze',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    name: 'Week Streak',
    description: 'Achieve a 7-day streak',
    icon: '&#9889;', // lightning
    tier: 'silver',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Unstoppable',
    description: 'Achieve a 30-day streak',
    icon: '&#128640;', // rocket
    tier: 'gold',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete all tasks in all routines',
    icon: '&#11088;', // star
    tier: 'silver',
    requirement: { type: 'perfect_days', value: 1 },
  },
  {
    id: 'perfect_week',
    name: 'Flawless Week',
    description: '7 perfect days in a row',
    icon: '&#127775;', // glowing star
    tier: 'gold',
    requirement: { type: 'perfect_days', value: 7 },
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Check in before 7 AM',
    icon: '&#127749;', // sunrise
    tier: 'bronze',
    requirement: { type: 'early_checkin', value: 1 },
  },
];

const TIER_COLORS = {
  bronze: 'from-amber-600 to-amber-700',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-400 to-yellow-500',
  platinum: 'from-cyan-300 to-cyan-400',
};

const TIER_BG = {
  bronze: 'bg-amber-100 dark:bg-amber-900/30',
  silver: 'bg-gray-100 dark:bg-gray-800/50',
  gold: 'bg-yellow-100 dark:bg-yellow-900/30',
  platinum: 'bg-cyan-100 dark:bg-cyan-900/30',
};

export default function AchievementsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    async function fetchStats() {
      try {
        const [userRes, insightsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/insights/user'),
        ]);
        
        const userData = userRes.ok ? await userRes.json() : null;
        const insightsData = insightsRes.ok ? await insightsRes.json() : null;
        
        // Get stats from API responses
        setStats({
          routinesCreated: insightsData?.summary?.routineCount || 0,
          totalCheckIns: userData?.data?.user?.analytics?.totalCheckIns || 0,
          currentStreak: userData?.data?.user?.analytics?.currentStreak || 0,
          longestStreak: userData?.data?.user?.analytics?.longestStreak || 0,
          perfectDays: insightsData?.weekly?.daysWithActivity || 0,
          earlyCheckIns: 0, // Would need to track this
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats({
          routinesCreated: 0,
          totalCheckIns: 0,
          currentStreak: 0,
          longestStreak: 0,
          perfectDays: 0,
          earlyCheckIns: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Check if badge is unlocked
  const isBadgeUnlocked = (badge) => {
    if (!stats) return false;
    const req = badge.requirement;
    switch (req.type) {
      case 'routines_created':
        return stats.routinesCreated >= req.value;
      case 'total_checkins':
        return stats.totalCheckIns >= req.value;
      case 'streak':
        return stats.longestStreak >= req.value;
      case 'perfect_days':
        return stats.perfectDays >= req.value;
      case 'early_checkin':
        return stats.earlyCheckIns >= req.value;
      default:
        return false;
    }
  };

  // Get progress for a badge
  const getBadgeProgress = (badge) => {
    if (!stats) return 0;
    const req = badge.requirement;
    let current = 0;
    switch (req.type) {
      case 'routines_created':
        current = stats.routinesCreated;
        break;
      case 'total_checkins':
        current = stats.totalCheckIns;
        break;
      case 'streak':
        current = stats.longestStreak;
        break;
      case 'perfect_days':
        current = stats.perfectDays;
        break;
      case 'early_checkin':
        current = stats.earlyCheckIns;
        break;
    }
    return Math.min(100, (current / req.value) * 100);
  };

  const unlockedCount = BADGES.filter(isBadgeUnlocked).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-calm-200 dark:bg-slate-700 rounded"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(function(i) {
              return <div key={i} className="h-32 bg-calm-200 dark:bg-slate-700 rounded-xl"></div>;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-calm-800 dark:text-white">Achievements</h1>
          <p className="text-sm sm:text-base text-calm-600 dark:text-calm-400">
            {unlockedCount} of {BADGES.length} badges unlocked
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-neo-100 dark:bg-neo-900/30 rounded-full self-start sm:self-auto">
          <span className="text-xl sm:text-2xl" dangerouslySetInnerHTML={{ __html: '&#127942;' }} />
          <span className="font-bold text-neo-700 dark:text-neo-300">{unlockedCount}</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-neo-600 dark:text-neo-400">{stats?.currentStreak || 0}</div>
            <div className="text-xs sm:text-sm text-calm-600 dark:text-calm-400">Current Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-neo-600 dark:text-neo-400">{stats?.longestStreak || 0}</div>
            <div className="text-xs sm:text-sm text-calm-600 dark:text-calm-400">Best Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-neo-600 dark:text-neo-400">{stats?.totalCheckIns || 0}</div>
            <div className="text-xs sm:text-sm text-calm-600 dark:text-calm-400">Total Check-ins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-neo-600 dark:text-neo-400">{stats?.perfectDays || 0}</div>
            <div className="text-xs sm:text-sm text-calm-600 dark:text-calm-400">Perfect Days</div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Grid */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-calm-800 dark:text-white mb-4">Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {BADGES.map(function(badge) {
            const unlocked = isBadgeUnlocked(badge);
            const progress = getBadgeProgress(badge);
            
            return (
              <div
                key={badge.id}
                className={
                  'relative p-3 sm:p-4 rounded-xl text-center transition-all ' +
                  (unlocked
                    ? TIER_BG[badge.tier] + ' shadow-lg'
                    : 'bg-calm-100 dark:bg-slate-800 opacity-60')
                }
              >
                {/* Badge Icon */}
                <div
                  className={
                    'w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl sm:text-3xl ' +
                    (unlocked
                      ? 'bg-gradient-to-br ' + TIER_COLORS[badge.tier] + ' text-white shadow-md'
                      : 'bg-calm-200 dark:bg-slate-700 text-calm-400 dark:text-slate-500')
                  }
                >
                  <span dangerouslySetInnerHTML={{ __html: badge.icon }} />
                </div>

                {/* Badge Name */}
                <h3 className={
                  'font-semibold text-sm mb-1 ' +
                  (unlocked ? 'text-calm-800 dark:text-white' : 'text-calm-500 dark:text-slate-500')
                }>
                  {badge.name}
                </h3>

                {/* Badge Description */}
                <p className="text-xs text-calm-500 dark:text-calm-500 mb-2">
                  {badge.description}
                </p>

                {/* Progress Bar (if not unlocked) */}
                {!unlocked && (
                  <div className="w-full h-1.5 bg-calm-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neo-400 dark:bg-neo-500 rounded-full transition-all"
                      style={{ width: progress + '%' }}
                    />
                  </div>
                )}

                {/* Unlocked Badge */}
                {unlocked && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {BADGES.filter(function(b) { return !isBadgeUnlocked(b); }).slice(0, 3).map(function(badge) {
              const progress = getBadgeProgress(badge);
              return (
                <div key={badge.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-calm-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                    <span dangerouslySetInnerHTML={{ __html: badge.icon }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-calm-800 dark:text-white">{badge.name}</span>
                      <span className="text-sm text-calm-500 dark:text-calm-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-calm-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neo-500 rounded-full transition-all"
                        style={{ width: progress + '%' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {BADGES.filter(function(b) { return !isBadgeUnlocked(b); }).length === 0 && (
              <p className="text-center text-calm-500 dark:text-calm-400 py-4">
                Congratulations! You&apos;ve unlocked all badges!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
