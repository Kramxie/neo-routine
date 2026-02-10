'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Settings Page
 * User preferences and profile management
 */

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

const daysOfWeek = [
  { bit: 1, label: 'Sun', full: 'Sunday' },
  { bit: 2, label: 'Mon', full: 'Monday' },
  { bit: 4, label: 'Tue', full: 'Tuesday' },
  { bit: 8, label: 'Wed', full: 'Wednesday' },
  { bit: 16, label: 'Thu', full: 'Thursday' },
  { bit: 32, label: 'Fri', full: 'Friday' },
  { bit: 64, label: 'Sat', full: 'Saturday' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Preferences state
  const [reminderTime, setReminderTime] = useState('09:00');
  const [timezone, setTimezone] = useState('UTC');
  const [reminderFrequency, setReminderFrequency] = useState('normal');
  const [activeDays, setActiveDays] = useState(127);
  const [theme, setTheme] = useState('light');
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [celebrations, setCelebrations] = useState(true);

  // Fetch current preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          
          // Set profile
          setName(data.profile?.name || '');
          setEmail(data.profile?.email || '');
          
          // Set preferences
          const prefs = data.preferences || {};
          setReminderTime(prefs.reminderTime || '09:00');
          setTimezone(prefs.timezone || 'UTC');
          setReminderFrequency(prefs.reminderFrequency || 'normal');
          setActiveDays(prefs.activeDays ?? 127);
          setTheme(prefs.theme || 'light');
          setWeeklyDigest(prefs.weeklyDigest ?? true);
          setCelebrations(prefs.celebrations ?? true);
        }
      } catch (err) {
        console.error('Failed to fetch preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Toggle active day
  const toggleDay = (bit) => {
    setActiveDays((prev) => prev ^ bit);
  };

  // Check if day is active
  const isDayActive = (bit) => (activeDays & bit) !== 0;

  // Save preferences
  const handleSave = async () => {
    setError('');
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { name },
          preferences: {
            reminderTime,
            timezone,
            reminderFrequency,
            activeDays,
            theme,
            weeklyDigest,
            celebrations,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save preferences');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
          <p className="text-calm-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-calm-800">Settings</h1>
        <p className="text-calm-500 mt-1">Customize your Neo Routine experience</p>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          ✓ Settings saved successfully
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-calm-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-calm-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-calm-200 bg-calm-50 text-calm-500 cursor-not-allowed"
            />
            <p className="text-xs text-calm-400 mt-1">Email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      {/* Reminders Section */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reminder Time */}
          <div>
            <label htmlFor="reminderTime" className="block text-sm font-medium text-calm-700 mb-2">
              Daily Reminder Time
            </label>
            <input
              type="time"
              id="reminderTime"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-4 py-2 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 focus:border-transparent"
            />
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-calm-700 mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 focus:border-transparent"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reminder Frequency */}
          <div>
            <label className="block text-sm font-medium text-calm-700 mb-2">
              Reminder Intensity
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'off', label: 'Off', desc: 'No reminders' },
                { value: 'gentle', label: 'Gentle', desc: 'Minimal nudges' },
                { value: 'normal', label: 'Normal', desc: 'Balanced' },
                { value: 'frequent', label: 'Frequent', desc: 'Stay on track' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setReminderFrequency(option.value)}
                  className={`
                    p-3 rounded-lg border text-left transition-all
                    ${reminderFrequency === option.value
                      ? 'border-neo-500 bg-neo-50 ring-2 ring-neo-200'
                      : 'border-calm-200 hover:border-calm-300'
                    }
                  `}
                >
                  <p className="font-medium text-calm-800 text-sm">{option.label}</p>
                  <p className="text-xs text-calm-500">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Days */}
          <div>
            <label className="block text-sm font-medium text-calm-700 mb-2">
              Active Days
            </label>
            <p className="text-xs text-calm-500 mb-3">
              Which days would you like to track routines?
            </p>
            <div className="flex gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.bit}
                  type="button"
                  onClick={() => toggleDay(day.bit)}
                  className={`
                    w-10 h-10 rounded-full text-sm font-medium transition-all
                    ${isDayActive(day.bit)
                      ? 'bg-neo-500 text-white'
                      : 'bg-calm-100 text-calm-500 hover:bg-calm-200'
                    }
                  `}
                  title={day.full}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-calm-700 mb-2">
              Theme
            </label>
            <div className="flex gap-3">
              {[
                { value: 'light', label: 'Light', icon: '☀️' },
                { value: 'dark', label: 'Dark', icon: '🌙' },
                { value: 'auto', label: 'Auto', icon: '💻' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`
                    flex-1 p-3 rounded-lg border text-center transition-all
                    ${theme === option.value
                      ? 'border-neo-500 bg-neo-50 ring-2 ring-neo-200'
                      : 'border-calm-200 hover:border-calm-300'
                    }
                  `}
                >
                  <span className="text-xl">{option.icon}</span>
                  <p className="text-sm font-medium text-calm-700 mt-1">{option.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-calm-400 mt-2">
              Dark mode coming soon!
            </p>
          </div>

          {/* Celebrations Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-calm-700">Celebration Animations</p>
              <p className="text-sm text-calm-500">Show animations when completing tasks</p>
            </div>
            <button
              type="button"
              onClick={() => setCelebrations(!celebrations)}
              className={`
                relative w-12 h-7 rounded-full transition-colors
                ${celebrations ? 'bg-neo-500' : 'bg-calm-300'}
              `}
            >
              <span
                className={`
                  absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${celebrations ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Weekly Digest Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-calm-700">Weekly Summary</p>
              <p className="text-sm text-calm-500">Receive a weekly progress summary email</p>
            </div>
            <button
              type="button"
              onClick={() => setWeeklyDigest(!weeklyDigest)}
              className={`
                relative w-12 h-7 rounded-full transition-colors
                ${weeklyDigest ? 'bg-neo-500' : 'bg-calm-300'}
              `}
            >
              <span
                className={`
                  absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${weeklyDigest ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-neo-500 text-white font-medium hover:bg-neo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
