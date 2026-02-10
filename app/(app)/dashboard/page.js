'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Dashboard Page
 * Shows today's routine, progress visualization, and micro-messages
 */

// Calm, encouraging micro-messages
const microMessages = [
  "You're doing great. One drop at a time.",
  "Every small step creates ripples of progress.",
  "Consistency flows like water. Keep going.",
  "Your routine is building something beautiful.",
  "Progress isn't always visible, but it's happening.",
  "Be gentle with yourself today.",
  "Small drops fill the ocean.",
  "You showed up. That's what matters.",
];

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [microMessage, setMicroMessage] = useState('');

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

    // Random micro-message
    setMicroMessage(microMessages[Math.floor(Math.random() * microMessages.length)]);
  }, []);

  return (
    <div className="space-y-8">
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
            <p className="text-3xl font-bold text-neo-600">0%</p>
            <p className="text-xs text-calm-500 mt-2">No routines yet</p>
          </CardContent>
        </Card>

        {/* Weekly Flow */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Weekly Flow</p>
            <p className="text-3xl font-bold text-neo-600">--</p>
            <p className="text-xs text-calm-500 mt-2">Start tracking to see</p>
          </CardContent>
        </Card>

        {/* Total Drops */}
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8">
            <div className="w-full h-full rounded-full bg-neo-100 opacity-50" />
          </div>
          <CardContent className="relative">
            <p className="text-sm text-calm-500 mb-1">Total Drops</p>
            <p className="text-3xl font-bold text-neo-600">0</p>
            <p className="text-xs text-calm-500 mt-2">Drops completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Routine */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Today&apos;s Routine</CardTitle>
            </CardHeader>
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
                <p className="text-sm text-calm-400">
                  Coming in Phase 3: Create and manage routines
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Visualization */}
        <div>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Your Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                {/* Ripple Progress Visualization */}
                <div className="progress-ripple w-32 h-32">
                  <div className="text-center z-10 relative">
                    <div className="text-2xl font-bold text-neo-600">0%</div>
                    <p className="text-xs text-calm-500 mt-1">This Week</p>
                  </div>
                </div>
              </div>
              
              {/* Weekly breakdown */}
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-calm-700">This Week</p>
                <div className="flex justify-between gap-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <div key={index} className="flex-1 text-center">
                      <p className="text-xs text-calm-500 mb-1">{day}</p>
                      <div className="w-full aspect-square rounded-full bg-calm-100 flex items-center justify-center">
                        <span className="text-xs text-calm-400">-</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Micro-message card */}
          <Card variant="gradient" className="mt-4">
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
        </div>
      </div>
    </div>
  );
}
