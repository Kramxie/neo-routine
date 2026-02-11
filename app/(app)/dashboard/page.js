'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import RippleProgress, { WeeklyRipples } from '@/components/ui/RippleProgress';
import DropList from '@/components/ui/DropList';

/**
 * Dashboard Page
 * Shows today's routines, progress visualization, and micro-messages
 */

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [routines, setRoutines] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkLoading, setCheckLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resendStatus, setResendStatus] = useState('idle');

  // Fetch user info to check verification
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const result = await response.json();
          setUser(result.data?.user);
          // Show banner if email not verified (and not demo user)
          if (result.data?.user && !result.data.user.isEmailVerified && result.data.user.email !== 'demo@neoroutine.app') {
            setShowVerifyBanner(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

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

  // Fetch routines and today's check-in data
  const fetchData = useCallback(async () => {
    try {
      const [routinesRes, todayRes] = await Promise.all([
        fetch('/api/routines'),
        fetch('/api/checkins/today'),
      ]);

      if (routinesRes.ok) {
        const routinesData = await routinesRes.json();
        setRoutines(routinesData.routines || []);
      }

      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayData(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    fetchData();
  }, [fetchData]);

  // Handle task check/uncheck
  const handleToggleTask = async (routineId, taskId, shouldCheck) => {
    setCheckLoading(true);

    try {
      if (shouldCheck) {
        // Create check-in
        const response = await fetch('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routineId, taskId }),
        });

        if (!response.ok) {
          throw new Error('Failed to create check-in');
        }
      } else {
        // Remove check-in
        const response = await fetch('/api/checkins', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routineId, taskId }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove check-in');
        }
      }

      // Refresh today's data
      const todayRes = await fetch('/api/checkins/today');
      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayData(data);
      }
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setCheckLoading(false);
    }
  };

  // Get checked task IDs for a routine
  const getCheckedTaskIds = (routineId) => {
    if (!todayData?.checkedTasks) return [];
    return todayData.checkedTasks
      .filter((ct) => ct.routineId === routineId)
      .map((ct) => ct.taskId);
  };

  // Stats from today's data
  const todayPercent = todayData?.todayPercent || 0;
  const weeklyPercent = todayData?.weeklyPercent || 0;
  const totalDrops = todayData?.totalDropsToday || 0;
  const microMessage = todayData?.message || "Every drop creates ripples of progress.";
  const weeklyData = todayData?.weeklyData || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-neo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
          <p className="text-calm-500">Loading your flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Email Verification Banner */}
      {showVerifyBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-800 font-medium">Verify your email</p>
              <p className="text-amber-600 text-sm">Check your inbox for a verification link to unlock all features.</p>
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

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-calm-800">{greeting}</h1>
        <p className="text-calm-600 mt-1">{microMessage}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Progress */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Today&apos;s Progress</p>
            <p className="text-3xl font-bold text-neo-600">{todayPercent}%</p>
            <p className="text-xs text-calm-500 mt-2">
              {routines.length === 0 ? 'No routines yet' : `${totalDrops} drops collected`}
            </p>
          </CardContent>
        </Card>

        {/* Weekly Flow */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Weekly Flow</p>
            <p className="text-3xl font-bold text-neo-600">{weeklyPercent}%</p>
            <p className="text-xs text-calm-500 mt-2">
              {routines.length === 0 ? 'Start tracking to see' : 'Average this week'}
            </p>
          </CardContent>
        </Card>

        {/* Active Routines */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Active Routines</p>
            <p className="text-3xl font-bold text-neo-600">{routines.length}</p>
            <p className="text-xs text-calm-500 mt-2">
              {routines.length === 0 ? 'Create your first' : 'Flowing smoothly'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Routines */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-calm-800">Today&apos;s Routines</h2>
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
                  <h3 className="text-lg font-medium text-calm-700 mb-2">
                    No routines yet
                  </h3>
                  <p className="text-calm-500 mb-6 max-w-sm mx-auto">
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
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Your Flow</CardTitle>
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
              <div className="mt-8 space-y-3">
                <p className="text-sm font-medium text-calm-700">This Week</p>
                <WeeklyRipples data={weeklyData} />
              </div>
            </CardContent>
          </Card>

          {/* Micro-message card */}
          <Card variant="gradient">
            <CardContent>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-neo-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                  </svg>
                </div>
                <p className="text-sm text-calm-700 italic">
                  &ldquo;{microMessage}&rdquo;
                </p>
              </div>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
