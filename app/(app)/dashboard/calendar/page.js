'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Calendar Page
 * Visual calendar view of daily check-ins and routine completions
 */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkIns, setCheckIns] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch check-ins for current month
  useEffect(function() {
    async function fetchCheckIns() {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const response = await fetch(`/api/checkins?year=${year}&month=${month}`);
        if (response.ok) {
          const data = await response.json();
          // Convert array to object keyed by date
          const checkInMap = {};
          (data.checkIns || []).forEach(function(ci) {
            checkInMap[ci.date] = ci;
          });
          setCheckIns(checkInMap);
        }
      } catch (err) {
        console.error('Failed to fetch check-ins:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCheckIns();
  }, [currentDate]);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get completion level for a day (0-100)
  const getCompletionLevel = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const checkIn = checkIns[dateStr];
    if (!checkIn) return 0;
    return checkIn.completionRate || 0;
  };

  // Get color based on completion
  const getCompletionColor = (level) => {
    if (level === 0) return 'bg-calm-100 dark:bg-slate-700';
    if (level < 33) return 'bg-neo-200 dark:bg-neo-900';
    if (level < 66) return 'bg-neo-400 dark:bg-neo-700';
    if (level < 100) return 'bg-neo-500 dark:bg-neo-600';
    return 'bg-neo-600 dark:bg-neo-500';
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in the future
  const isFuture = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Build calendar grid
  const calendarDays = [];
  // Empty cells for days before start of month
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-calm-800 dark:text-white mb-1 sm:mb-2">Calendar</h1>
        <p className="text-calm-600 dark:text-calm-400 text-sm sm:text-base">Track your daily progress over time</p>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-calm-100 dark:hover:bg-slate-700 text-calm-600 dark:text-calm-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <CardTitle>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-calm-100 dark:hover:bg-slate-700 text-calm-600 dark:text-calm-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-500"></div>
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                {dayNames.map(function(day) {
                  return (
                    <div key={day} className="text-center text-[10px] sm:text-sm font-medium text-calm-500 dark:text-calm-400 py-1 sm:py-2">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {calendarDays.map(function(day, idx) {
                  if (day === null) {
                    return <div key={idx} className="aspect-square"></div>;
                  }

                  const completion = getCompletionLevel(day);
                  const colorClass = isFuture(day) ? 'bg-calm-50 dark:bg-slate-800' : getCompletionColor(completion);
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                  return (
                    <button
                      key={idx}
                      onClick={function() { setSelectedDate(selectedDate === dateStr ? null : dateStr); }}
                      disabled={isFuture(day)}
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-center
                        text-sm font-medium transition-all relative
                        ${colorClass}
                        ${isToday(day) ? 'ring-2 ring-neo-500 ring-offset-2 dark:ring-offset-slate-800' : ''}
                        ${isFuture(day) ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                        ${selectedDate === dateStr ? 'ring-2 ring-neo-400' : ''}
                        ${completion > 50 ? 'text-white' : 'text-calm-700 dark:text-calm-300'}
                      `}
                    >
                      <span>{day}</span>
                      {completion > 0 && !isFuture(day) && (
                        <span className="text-xs opacity-80">{completion}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-sm text-calm-600 dark:text-calm-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-calm-100 dark:bg-slate-700"></div>
          <span>No activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neo-200 dark:bg-neo-900"></div>
          <span>1-33%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neo-400 dark:bg-neo-700"></div>
          <span>34-66%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neo-600 dark:bg-neo-500"></div>
          <span>67-100%</span>
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && checkIns[selectedDate] && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-neo-600">{checkIns[selectedDate].completionRate || 0}%</p>
                <p className="text-sm text-calm-500 dark:text-calm-400">Completion</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-calm-700 dark:text-white">{checkIns[selectedDate].tasksCompleted || 0}</p>
                <p className="text-sm text-calm-500 dark:text-calm-400">Tasks Done</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-calm-700 dark:text-white">{checkIns[selectedDate].routinesWorkedOn || 0}</p>
                <p className="text-sm text-calm-500 dark:text-calm-400">Routines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaks summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-calm-800 dark:text-white">0</p>
            <p className="text-sm text-calm-500 dark:text-calm-400">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neo-100 dark:bg-neo-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-neo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-calm-800 dark:text-white">0</p>
            <p className="text-sm text-calm-500 dark:text-calm-400">Best Streak</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
