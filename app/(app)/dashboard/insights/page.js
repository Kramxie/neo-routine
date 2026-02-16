'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import RippleProgress from '@/components/ui/RippleProgress';
import { toHex } from '@/lib/colorUtils';

/**
 * Insights Page
 * Analytics and progress visualization
 */

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, [days]);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/insights?days=${days}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-neo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
          <p className="text-calm-500">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-calm-500">Unable to load insights. Please try again.</p>
      </div>
    );
  }

  const { summary, weekly, insights, dailyData, routineStats, patterns } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-calm-800">Insights</h1>
          <p className="text-calm-500 mt-1">Understand your progress patterns</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${days === d
                  ? 'bg-neo-500 text-white'
                  : 'bg-calm-100 text-calm-600 hover:bg-calm-200'
                }
              `}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Completion Rate</p>
            <p className="text-3xl font-bold text-neo-600">
              {Math.round(summary.completionRate)}%
            </p>
            <div className="flex items-center gap-1 mt-2">
              {summary.trend !== 0 && (
                <span className={`text-xs font-medium ${
                  summary.trendDirection === 'up' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {summary.trendDirection === 'up' ? '↑' : '↓'} {Math.abs(summary.trend)}%
                </span>
              )}
              <span className="text-xs text-calm-500">vs last {days}d</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Current Flow</p>
            <p className="text-3xl font-bold text-neo-600">
              {summary.currentStreak}
            </p>
            <p className="text-xs text-calm-500 mt-2">
              {summary.currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </CardContent>
        </Card>

        {/* Active Days */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Active Days</p>
            <p className="text-3xl font-bold text-neo-600">
              {summary.daysWithActivity}
            </p>
            <p className="text-xs text-calm-500 mt-2">
              of {days} days ({Math.round(summary.activeDayRate)}%)
            </p>
          </CardContent>
        </Card>

        {/* Total Check-ins */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Total Drops</p>
            <p className="text-3xl font-bold text-neo-600">
              {summary.totalCheckIns}
            </p>
            <p className="text-xs text-calm-500 mt-2">
              tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Daily Activity Chart */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simple bar chart */}
              <div className="h-48 flex items-end gap-1">
                {dailyData.slice(-14).map((day, index) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-neo-400 rounded-t transition-all hover:bg-neo-500"
                      style={{ 
                        height: `${Math.max(4, day.percent)}%`,
                        minHeight: day.percent > 0 ? '8px' : '4px',
                        opacity: day.percent > 0 ? 1 : 0.3,
                      }}
                      title={`${day.date}: ${day.percent}%`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-calm-500">
                {dailyData.slice(-14).filter((_, i) => i % 2 === 0).map((day) => (
                  <span key={day.date}>{day.day}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Routine Breakdown */}
          <Card variant="elevated" className="mt-4">
            <CardHeader>
              <CardTitle>Routine Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {routineStats.length === 0 ? (
                <p className="text-calm-500 text-center py-8">
                  Create routines to see breakdown
                </p>
              ) : (
                <div className="space-y-4">
                  {routineStats.map((routine) => (
                    <div key={routine.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: toHex(routine.color) || '#0ea5e9' }}
                          />
                          <span className="text-sm font-medium text-calm-700">
                            {routine.name}
                          </span>
                        </div>
                        <span className="text-sm text-calm-500">
                          {routine.completionRate}%
                        </span>
                      </div>
                      <div className="h-2 bg-calm-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${routine.completionRate}%`,
                              backgroundColor: toHex(routine.color) || '#0ea5e9',
                            }}
                          />
                      </div>
                      <p className="text-xs text-calm-500">
                        {routine.completed} of {routine.totalPossible} tasks completed
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Weekly Progress */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                <RippleProgress
                  percent={weekly.completionRate}
                  size="lg"
                  label=""
                  sublabel={`${weekly.daysWithActivity}/7 active days`}
                />
              </div>
              <p className="text-center text-sm text-calm-600 mt-4 italic">
                &ldquo;{weekly.message}&rdquo;
              </p>
            </CardContent>
          </Card>

          {/* Personal Insights */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Your Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <p className="text-calm-500 text-center py-4">
                  Keep tracking to discover your patterns
                </p>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-xl">{insight.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-calm-700">
                          {insight.title}
                        </p>
                        <p className="text-sm text-calm-500">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Best Performing */}
          {patterns.bestDayOfWeek !== undefined && (
            <Card variant="gradient">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-calm-700">
                      Best Day
                    </p>
                    <p className="text-lg font-bold text-neo-600">
                      {fullDayNames[patterns.bestDayOfWeek]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Longest Streak */}
          {summary.longestStreak > 0 && (
            <Card variant="default">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-calm-500">Longest Flow</p>
                    <p className="text-2xl font-bold text-calm-800">
                      {summary.longestStreak} days
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-neo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-neo-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
