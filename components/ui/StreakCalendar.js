'use client';

import { useState, useMemo } from 'react';

/**
 * Streak Calendar Component
 * Visual "Don't Break the Chain" calendar showing daily completion
 */

// Get days in a month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Get the day of week for the first day of a month (0 = Sunday)
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get intensity level (0-4) based on completion percentage
function getIntensityLevel(percent) {
  if (percent === 0) return 0;
  if (percent < 25) return 1;
  if (percent < 50) return 2;
  if (percent < 75) return 3;
  return 4;
}

// Intensity colors matching neo theme
const intensityColors = {
  0: 'bg-calm-100 dark:bg-slate-700',
  1: 'bg-neo-100 dark:bg-neo-900/40',
  2: 'bg-neo-200 dark:bg-neo-800/50',
  3: 'bg-neo-400 dark:bg-neo-600',
  4: 'bg-neo-500 dark:bg-neo-500',
};

const intensityBorders = {
  0: 'border-calm-200',
  1: 'border-neo-200',
  2: 'border-neo-300',
  3: 'border-neo-500',
  4: 'border-neo-600',
};

export default function StreakCalendar({
  data = [], // Array of { dateISO: 'YYYY-MM-DD', completed: number, total: number, percent: number }
  currentStreak = 0,
  longestStreak = 0,
  onDayClick,
  className = '',
}) {
  const [viewDate, setViewDate] = useState(new Date());
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  // Create a map of date -> data for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map();
    data.forEach(d => map.set(d.dateISO, d));
    return map;
  }, [data]);

  // Calculate calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = formatDate(new Date());
    
    const grid = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      grid.push({ empty: true, key: `empty-${i}` });
    }
    
    // Add cells for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateISO = formatDate(date);
      const dayData = dataMap.get(dateISO) || { completed: 0, total: 0, percent: 0 };
      const isToday = dateISO === today;
      const isFuture = date > new Date();
      
      grid.push({
        day,
        dateISO,
        data: dayData,
        isToday,
        isFuture,
        intensity: isFuture ? -1 : getIntensityLevel(dayData.percent),
        key: dateISO,
      });
    }
    
    return grid;
  }, [year, month, dataMap]);

  // Navigation
  const goToPreviousMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  // Calculate streak indicators for display
  const streakStats = useMemo(() => {
    // Find the most recent streak
    let streakDays = [];
    const sortedDates = [...data]
      .filter(d => d.percent > 0)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    
    if (sortedDates.length > 0) {
      // Get recent consecutive days
      const today = new Date();
      for (let i = 0; i < currentStreak; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        streakDays.push(formatDate(date));
      }
    }
    
    return new Set(streakDays);
  }, [data, currentStreak]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`streak-calendar ${className}`}>
      {/* Streak Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{currentStreak}</span>
            </div>
            <div>
              <p className="text-xs text-calm-500 dark:text-slate-400">Current</p>
              <p className="text-sm font-medium text-calm-700 dark:text-slate-200">Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{longestStreak}</span>
            </div>
            <div>
              <p className="text-xs text-calm-500 dark:text-slate-400">Longest</p>
              <p className="text-sm font-medium text-calm-700 dark:text-slate-200">Streak</p>
            </div>
          </div>
        </div>
        
        {currentStreak > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-neo-50 dark:bg-neo-900/30 rounded-full">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-medium text-neo-600 dark:text-neo-400">On Fire!</span>
          </div>
        )}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-calm-100 dark:hover:bg-slate-700 transition-colors text-calm-600 dark:text-slate-300"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-calm-800 dark:text-slate-100">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-neo-500 hover:text-neo-600 dark:text-neo-400 dark:hover:text-neo-300 transition-colors"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-calm-100 dark:hover:bg-slate-700 transition-colors text-calm-600 dark:text-slate-300"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-calm-500 dark:text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarGrid.map(cell => {
          if (cell.empty) {
            return <div key={cell.key} className="aspect-square" />;
          }

          const isInStreak = streakStats.has(cell.dateISO);
          const intensity = cell.intensity;
          
          return (
            <div
              key={cell.key}
              onClick={() => !cell.isFuture && onDayClick?.(cell)}
              className={`
                aspect-square rounded-lg flex items-center justify-center relative
                transition-all duration-200 cursor-pointer
                ${cell.isFuture ? 'bg-calm-50 text-calm-300' : intensityColors[intensity]}
                ${cell.isToday ? `ring-2 ring-neo-500 ring-offset-1` : ''}
                ${isInStreak && intensity > 0 ? 'ring-2 ring-orange-400' : ''}
                ${!cell.isFuture && 'hover:scale-105 hover:shadow-md'}
              `}
              title={cell.isFuture ? 'Future' : `${cell.data.completed}/${cell.data.total} tasks (${cell.data.percent}%)`}
            >
              <span className={`
                text-sm font-medium
                ${intensity >= 3 ? 'text-white' : 'text-calm-700 dark:text-slate-200'}
                ${cell.isFuture ? 'text-calm-300 dark:text-slate-500' : ''}
              `}>
                {cell.day}
              </span>
              
              {/* Activity indicator */}
              {!cell.isFuture && cell.data.percent === 100 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white" />
              )}
              
              {/* Streak fire indicator */}
              {isInStreak && intensity > 0 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs">
                  🔥
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-calm-100 dark:border-slate-700">
        <span className="text-xs text-calm-500 dark:text-slate-400">Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className={`w-4 h-4 rounded ${intensityColors[level]}`}
            title={`${level * 25}% completion`}
          />
        ))}
        <span className="text-xs text-calm-500 dark:text-slate-400">More</span>
      </div>
    </div>
  );
}

/**
 * Compact Week View - Shows last 7 days
 */
export function WeekStreak({ data = [], className = '' }) {
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateISO = formatDate(date);
      const dayData = data.find(d => d.dateISO === dateISO) || { percent: 0 };
      
      result.push({
        dateISO,
        dayName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()],
        isToday: i === 0,
        intensity: getIntensityLevel(dayData.percent),
        percent: dayData.percent,
      });
    }
    
    return result;
  }, [data]);

  return (
    <div className={`week-streak ${className}`}>
      <div className="flex items-center justify-between gap-1">
        {days.map(day => (
          <div key={day.dateISO} className="flex flex-col items-center gap-1">
            <span className="text-xs text-calm-500 dark:text-slate-400">{day.dayName}</span>
            <div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${intensityColors[day.intensity]}
                ${day.isToday ? 'ring-2 ring-neo-500 ring-offset-1' : ''}
              `}
            >
              {day.intensity > 0 && (
                <svg className={`w-4 h-4 ${day.intensity >= 3 ? 'text-white' : 'text-neo-500'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
