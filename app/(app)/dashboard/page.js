'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import RippleProgress, { WeeklyRipples } from '@/components/ui/RippleProgress';
import DropList from '@/components/ui/DropList';
import Confetti, { useCelebration } from '@/components/ui/Confetti';
import { WeekStreak } from '@/components/ui/StreakCalendar';
import { BadgeProgress, BadgeUnlockAnimation } from '@/components/ui/BadgeDisplay';

/**
 * Enhanced Dashboard Page
 * Features:
 * - Personalized greeting with motivational quote
 * - Streak tracking with celebrations
 * - One-click check-in for routines
 * - Confetti celebrations for milestones
 * - Streak-at-risk alerts
 */

export default function DashboardPage() {
  const [routines, setRoutines] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkLoading, setCheckLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resendStatus, setResendStatus] = useState('idle');
  const [newBadge, setNewBadge] = useState(null);

  // Celebration hook for confetti
  const { celebration, celebrate, clearCelebration } = useCelebration();

  // Helper to get user's local date in YYYY-MM-DD
  const getLocalDateISO = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  };

  const router = useRouter();

  // Fetch user info to check verification and onboarding
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const result = await response.json();
          const userData = result.data?.user;
          setUser(userData);
          // Redirect to onboarding if not completed (skip for demo user)
          if (userData && !userData.onboardingCompleted && userData.email !== 'demo@neoroutine.app') {
            router.replace('/dashboard/onboarding');
            return;
          }
          // Show banner if email not verified (and not demo user)
          if (userData && !userData.isEmailVerified && userData.email !== 'demo@neoroutine.app') {
            setShowVerifyBanner(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [router]);

  // Resend verification email
  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendStatus('loading');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (response.ok) {
        setResendStatus('success');
      } else {
        setResendStatus('error');
      }
    } catch {
      setResendStatus('error');
    }
  };

  // Fetch dashboard stats (includes greeting, quote, streaks)
  // Returns a cleanup function for any scheduled celebrations
  const fetchDashboardStats = useCallback(async (isMountedRef) => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const result = await response.json();
        if (result.success && isMountedRef.current) {
          setDashboardStats(result.data);
          
          // Trigger celebrations if any milestones reached
          // Only show celebration once per session per type
          if (result.data.celebrations?.length > 0) {
            const first = result.data.celebrations[0];
            const celebrationKey = `celebration_shown_${first.message?.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const alreadyShown = sessionStorage.getItem(celebrationKey);
            
            if (!alreadyShown && isMountedRef.current) {
              sessionStorage.setItem(celebrationKey, 'true');
              // Small delay to let UI render first
              setTimeout(() => {
                if (isMountedRef.current) {
                  celebrate({
                    type: first.type || 'achievement',
                    message: first.message,
                    subMessage: first.subMessage,
                    icon: first.message?.includes('🔥') ? '🔥' : '✨',
                    pieces: first.type === 'milestone' ? 150 : 100,
                  });
                }
              }, 1000);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }, [celebrate]);

  // Fetch routines and today's check-in data
  const fetchData = useCallback(async () => {
    try {
      const [routinesRes, todayRes] = await Promise.all([
        fetch('/api/routines'),
        // Request today's data using user's local date to avoid timezone rollovers
        fetch(`/api/checkins/today?date=${getLocalDateISO()}`),
      ]);

      if (routinesRes.ok) {
        const routinesData = await routinesRes.json();
        setRoutines(routinesData.routines || []);
      }

      if (todayRes.ok) {
        const data = await todayRes.json();
        // Normalize shape: prefer `data.data` when API wraps payload
        setTodayData(data.data || data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Track if component is still mounted
    const isMountedRef = { current: true };
    
    fetchData();
    fetchDashboardStats(isMountedRef);
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData, fetchDashboardStats]);

  // Handle task check/uncheck
  const handleToggleTask = async (routineId, taskId, shouldCheck) => {
    setCheckLoading(true);

    try {
      // Use user's local date to avoid UTC rollover issues
      const now = new Date();
      const localDateISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (shouldCheck) {
        // Create check-in
        const response = await fetch('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routineId, taskId, dateISO: localDateISO }),
        });

        if (!response.ok) {
          throw new Error('Failed to create check-in');
        }

        // Check for new badges in response
        const result = await response.json();
        if (result.badges?.length > 0) {
          setNewBadge(result.badges[0]);
          celebrate({ type: 'achievement', message: 'Badge Unlocked!', icon: '🏅', pieces: 80 });
        }
      } else {
        // Remove check-in
        const response = await fetch('/api/checkins', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routineId, taskId, dateISO: localDateISO }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove check-in');
        }
      }

      // Refresh today's data (normalize API wrapper shape)
      const todayRes = await fetch(`/api/checkins/today?date=${localDateISO}`);
      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayData(data.data || data);
      }

      // Refresh dashboard stats
      await fetchDashboardStats();
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setCheckLoading(false);
    }
  };

  // Get checked task IDs for a routine
  const getCheckedTaskIds = (routineId) => {
    if (!todayData) return [];

    // API may return an array of strings like "<routineId>_<taskId>" as `checkedTaskIds`
    if (Array.isArray(todayData.checkedTaskIds)) {
      const rid = String(routineId);
      return todayData.checkedTaskIds
        .filter((s) => typeof s === 'string' && s.startsWith(`${rid}_`))
        .map((s) => String(s.split('_')[1]));
    }

    // Or API may return `checkIns` array of objects
    if (Array.isArray(todayData.checkIns)) {
      return todayData.checkIns
        .filter((c) => String(c.routineId) === String(routineId))
        .map((c) => String(c.taskId));
    }

    return [];
  };

  // Stats from dashboardStats and todayData (defensive and normalized)
  const stats = dashboardStats?.stats || {};
  const _rawTodayPercent = stats.todayPercent ?? todayData?.stats?.today?.percent ?? todayData?.completionPercent ?? 0;
  const todayPercent = Math.max(0, Math.min(100, Number(_rawTodayPercent) || 0));

  const _rawWeeklyPercent = todayData?.stats?.weekly?.percent ?? todayData?.weeklyPercent ?? 0;
  const weeklyPercent = Math.max(0, Math.min(100, Number(_rawWeeklyPercent) || 0));

  // Enhanced stats from dashboard API
  const currentStreak = stats.currentStreak || 0;
  const longestStreak = stats.longestStreak || 0;
  const totalCheckIns = stats.totalCheckIns || 0;
  const tasksRemaining = stats.tasksRemaining || 0;
  const completedTasks = stats.completedTasks || 0;
  const totalTasks = stats.totalTasks || routines.reduce((sum, r) => sum + (r.tasks?.length || 0), 0);
  const streakAtRisk = dashboardStats?.streakAtRisk || false;

  // Compute total drops (use stats when present, otherwise derive unique check-ins)
  let totalDrops = completedTasks;
  if (!totalDrops && todayData?.stats?.today?.completed != null) {
    totalDrops = Number(todayData.stats.today.completed) || 0;
  } else if (!totalDrops && Array.isArray(todayData?.checkIns)) {
    const unique = new Set(
      todayData.checkIns.map((c) => `${String(c.routineId)}_${String(c.taskId)}`)
    );
    totalDrops = unique.size;
  }

  // Quote from dashboard stats
  const quote = dashboardStats?.quote || { text: 'Every drop creates ripples of progress.', author: 'Neo Routine' };
  
  // Greeting from dashboard stats or compute locally
  const greeting = dashboardStats?.greeting || getDefaultGreeting();
  function getDefaultGreeting() {
    const hour = new Date().getHours();
    const name = user?.name?.split(' ')[0] || 'there';
    if (hour < 12) return `Good morning, ${name}! ☀️`;
    if (hour < 17) return `Good afternoon, ${name}! 👋`;
    if (hour < 21) return `Good evening, ${name}! 🌙`;
    return `Still going, ${name}? 🦉`;
  }
  
  const weeklyData = todayData?.stats?.weekly?.data || todayData?.weeklyData || [];

  // Debug: log computed numbers when todayData changes
  useEffect(() => {
    if (!todayData) return;
    try {
      const _completedToday = Number(todayData?.stats?.today?.completed ?? 0);
      const _totalToday = Number(todayData?.stats?.today?.total ?? 0);
      const _todayPct = Number(todayPercent);
      const _completedThisWeek = Number(todayData?.stats?.weekly?.completed ?? 0);
      const _totalThisWeek = Number(todayData?.stats?.weekly?.possible ?? 0);
      const _weeklyPct = Number(weeklyPercent);
      const _perDay = (todayData?.stats?.weekly?.data || weeklyData).map((d) => ({ date: d.date, count: d.count ?? 0, percent: d.percent ?? 0 }));

      // Debug logging removed for production
    } catch (_e) {
      // Silent fail for debug operations
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-neo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
          <p className="text-calm-500 dark:text-slate-400">Loading your flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confetti Celebration */}
      {celebration && (
        <Confetti
          show={true}
          type={celebration.type}
          duration={15000}
          message={celebration.message}
          subMessage={celebration.subMessage}
          icon={celebration.icon}
          pieces={celebration.pieces}
          onComplete={clearCelebration}
        />
      )}

      {/* Badge Unlock Animation */}
      {newBadge && (
        <BadgeUnlockAnimation
          badge={newBadge}
          onComplete={() => setNewBadge(null)}
        />
      )}

      {/* Email Verification Banner */}
      {showVerifyBanner && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-800 dark:text-amber-200 font-medium">Verify your email</p>
              <p className="text-amber-600 dark:text-amber-400 text-sm">Check your inbox for a verification link to unlock all features.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-13 sm:ml-0">
            {resendStatus === 'success' ? (
              <span className="text-green-600 text-sm font-medium">Email sent!</span>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resendStatus === 'loading'}
                className="text-amber-700 hover:text-amber-900 text-sm font-medium underline disabled:opacity-50"
              >
                {resendStatus === 'loading' ? 'Sending...' : 'Resend email'}
              </button>
            )}
            <button
              onClick={() => setShowVerifyBanner(false)}
              className="text-amber-400 hover:text-amber-600 p-1"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Streak At Risk Alert */}
      {streakAtRisk && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 animate-pulse">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 dark:bg-orange-800/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl">🔥</span>
          </div>
          <div className="flex-1">
            <p className="text-orange-800 dark:text-orange-200 font-bold text-sm sm:text-base">Your {currentStreak}-day streak is at risk!</p>
            <p className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm">Don&apos;t break the chain - complete at least one task today.</p>
          </div>
          <a
            href="#routines"
            className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors whitespace-nowrap text-sm sm:text-base w-full sm:w-auto text-center"
          >
            Check In Now
          </a>
        </div>
      )}

      {/* Main Header with Quote */}
      <div className="bg-gradient-to-r from-neo-50 to-calm-50 dark:from-slate-800 dark:to-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-calm-800 dark:text-slate-100">{greeting}</h1>
        <div className="mt-2 sm:mt-3 flex items-start gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">💧</span>
          <div>
            <p className="text-calm-600 dark:text-slate-300 italic text-sm sm:text-base">&ldquo;{quote.text}&rdquo;</p>
            {quote.author && (
              <p className="text-calm-400 dark:text-slate-500 text-sm mt-1">— {quote.author}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak Card */}
        <Card variant="elevated" className="relative overflow-hidden">
          <CardContent className="text-center py-3 sm:py-4">
            <div className="text-xl sm:text-2xl mb-1">{currentStreak > 0 ? '🔥' : '💧'}</div>
            <p className="text-2xl sm:text-3xl font-bold text-neo-600">{currentStreak}</p>
            <p className="text-xs sm:text-sm text-calm-500 dark:text-slate-400">Day Streak</p>
            {longestStreak > currentStreak && (
              <p className="text-xs text-calm-400 dark:text-slate-500 mt-1">Best: {longestStreak}</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card variant="elevated" className="relative overflow-hidden">
          <CardContent className="text-center py-3 sm:py-4">
            <div className="text-xl sm:text-2xl mb-1">{todayPercent === 100 ? '✨' : '📊'}</div>
            <p className="text-2xl sm:text-3xl font-bold text-neo-600">{todayPercent}%</p>
            <p className="text-xs sm:text-sm text-calm-500 dark:text-slate-400">Today</p>
            <p className="text-[10px] sm:text-xs text-calm-400 dark:text-slate-500 mt-1">{completedTasks}/{totalTasks} tasks</p>
          </CardContent>
        </Card>

        {/* Tasks Remaining */}
        <Card variant="elevated" className="relative overflow-hidden">
          <CardContent className="text-center py-3 sm:py-4">
            <div className="text-xl sm:text-2xl mb-1">{tasksRemaining === 0 ? '✅' : '📝'}</div>
            <p className="text-2xl sm:text-3xl font-bold text-neo-600">{tasksRemaining}</p>
            <p className="text-xs sm:text-sm text-calm-500 dark:text-slate-400">Tasks Left</p>
            <p className="text-[10px] sm:text-xs text-calm-400 dark:text-slate-500 mt-1">{tasksRemaining === 0 ? 'All done!' : 'Keep going!'}</p>
          </CardContent>
        </Card>

        {/* Total Check-ins */}
        <Card variant="elevated" className="relative overflow-hidden">
          <CardContent className="text-center py-3 sm:py-4">
            <div className="text-xl sm:text-2xl mb-1">🌊</div>
            <p className="text-2xl sm:text-3xl font-bold text-neo-600">{totalCheckIns}</p>
            <p className="text-xs sm:text-sm text-calm-500 dark:text-slate-400">Total Drops</p>
            <p className="text-[10px] sm:text-xs text-calm-400 dark:text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today&apos;s Routines */}
        <div id="routines" className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-calm-800 dark:text-slate-100">Today&apos;s Routines</h2>
            <Link
              href="/dashboard/routines/new"
              className="inline-flex items-center gap-1 text-sm text-neo-600 hover:text-neo-700 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Routine
            </Link>
          </div>

          {routines.length === 0 ? (
            <Card variant="elevated">
              <CardContent>
                {/* Empty state */}
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neo-50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-neo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-calm-700 dark:text-slate-200 mb-2">
                    No routines yet
                  </h3>
                  <p className="text-calm-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    Create your first routine to start tracking your daily drops. 
                    We&apos;ll help you build habits without pressure.
                  </p>
                  <Link
                    href="/dashboard/routines/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neo-500 text-white hover:bg-neo-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create First Routine
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            routines.map((routine) => (
              <DropList
                key={routine._id}
                routine={routine}
                checkedTaskIds={getCheckedTaskIds(routine._id)}
                onToggleTask={handleToggleTask}
                disabled={checkLoading}
              />
            ))
          )}
        </div>

        {/* Progress Visualization */}
        <div className="space-y-4">
          {/* Weekly Streak Visualization */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                Your Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeekStreak
                data={weeklyData.map(d => ({
                  date: new Date(Date.now() - ((6 - weeklyData.indexOf(d)) * 24 * 60 * 60 * 1000)),
                  completed: d.percent >= 80
                }))}
                currentStreak={currentStreak}
              />
              
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-neo-600">{currentStreak} days</p>
                <p className="text-sm text-calm-500 dark:text-slate-400">
                  {currentStreak > 0 
                    ? `Keep it going! ${7 - (currentStreak % 7)} more for a week milestone` 
                    : 'Complete a task to start your streak!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Flow */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Today&apos;s Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                <RippleProgress
                  percent={todayPercent}
                  size="lg"
                  label="Today"
                  showRipples={todayPercent > 0}
                />
              </div>
              
              {/* Weekly breakdown */}
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-calm-700">This Week</p>
                <WeeklyRipples data={weeklyData} />
              </div>
            </CardContent>
          </Card>

          {/* Badge Progress */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                Next Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BadgeProgress
                currentStreak={currentStreak}
                totalCheckIns={totalCheckIns}
              />
              <Link
                href="/dashboard/achievements"
                className="mt-4 block text-center text-sm text-neo-600 hover:text-neo-700 font-medium"
              >
                View All Badges →
              </Link>
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card variant="default">
            <CardContent>
              <p className="text-sm font-medium text-calm-700 mb-3">Quick Actions</p>
              <div className="space-y-2">
                <Link
                  href="/dashboard/routines"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-calm-50 transition-colors text-calm-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="text-sm">Manage Routines</span>
                </Link>
                <Link
                  href="/dashboard/insights"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-calm-50 transition-colors text-calm-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm">View Insights</span>
                </Link>
                <Link
                  href="/dashboard/achievements"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-calm-50 transition-colors text-calm-600"
                >
                  <span className="w-5 h-5 text-center">🏅</span>
                  <span className="text-sm">Achievements</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
