'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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

/** Apply theme class to <html> immediately — no page reload needed */
function applyThemeToDom(theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/** Reusable toggle switch */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
        checked ? 'bg-neo-500' : 'bg-calm-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/** Convert VAPID base64 key to Uint8Array */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/** Push Notification toggle + permission UI */
function PushNotificationSection() {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const swReg = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return;
    setPermission(Notification.permission);
    navigator.serviceWorker.ready.then((reg) => {
      swReg.current = reg;
      reg.pushManager.getSubscription().then((sub) => setIsSubscribed(!!sub));
    });
  }, []);

  async function ensureSw() {
    if (swReg.current) return swReg.current;
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    swReg.current = reg;
    return reg;
  }

  async function subscribe() {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      setStatusMsg('Push notifications not configured (missing VAPID key).');
      return;
    }
    setIsLoading(true);
    setStatusMsg('');
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setStatusMsg('Notification permission denied. Enable it in your browser settings.');
        return;
      }
      const reg = await ensureSw();
      const pushSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pushSub.toJSON()),
      });
      if (!res.ok) throw new Error('Failed to save subscription');
      setIsSubscribed(true);
      setStatusMsg('Push notifications enabled! Reminders will arrive at your scheduled time.');
    } catch (err) {
      setStatusMsg('Failed to enable: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe() {
    setIsLoading(true);
    setStatusMsg('');
    try {
      const reg = await ensureSw();
      const pushSub = await reg.pushManager.getSubscription();
      if (pushSub) {
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: pushSub.endpoint }),
        });
        await pushSub.unsubscribe();
      }
      setIsSubscribed(false);
      setStatusMsg('Push notifications disabled.');
    } catch (err) {
      setStatusMsg('Failed to disable notifications.');
    } finally {
      setIsLoading(false);
    }
  }

  if (typeof window !== 'undefined' && (!('Notification' in window) || !('serviceWorker' in navigator))) {
    return (
      <p className="text-sm text-calm-400 dark:text-slate-500">
        Push notifications are not supported in your browser.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-calm-700 dark:text-slate-200">Browser Push Notifications</p>
          <p className="text-sm text-calm-500 dark:text-slate-400 mt-0.5">
            {isSubscribed
              ? 'Reminders will arrive even when the tab is closed'
              : 'Get notified even when the app tab is closed'}
          </p>
        </div>
        <Toggle checked={isSubscribed} onChange={(val) => (val ? subscribe() : unsubscribe())} />
      </div>

      {permission === 'denied' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-red-700 dark:text-red-300">
            Notifications are blocked. Allow them in your browser settings.
          </p>
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-calm-400 dark:text-slate-500 flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </p>
      )}

      {statusMsg && (
        <p className={`text-sm px-3 py-2 rounded-lg ${
          statusMsg.toLowerCase().includes('fail') || statusMsg.toLowerCase().includes('denied') || statusMsg.toLowerCase().includes('block')
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
        }`}>
          {statusMsg}
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [currentTier, setCurrentTier] = useState('free');
  const [limits, setLimits] = useState({});
  const [managingSubscription, setManagingSubscription] = useState(false);

  // Preferences state
  const [reminderTime, setReminderTime] = useState('09:00');
  const [timezone, setTimezone] = useState('UTC');
  const [reminderFrequency, setReminderFrequency] = useState('normal');
  const [activeDays, setActiveDays] = useState(127);
  const [theme, setTheme] = useState('light');
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [celebrations, setCelebrations] = useState(true);

  // Fetch current preferences and subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch preferences
        const prefsResponse = await fetch('/api/user/preferences');
        if (prefsResponse.ok) {
          const data = await prefsResponse.json();
          
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

        // Fetch subscription
        const subResponse = await fetch('/api/subscription');
        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscription(subData.subscription);
          setCurrentTier(subData.currentTier || 'free');
          setLimits(subData.limits || {});
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle active day
  const toggleDay = (bit) => {
    setActiveDays((prev) => prev ^ bit);
  };

  // Change theme and apply to DOM instantly
  const handleThemeChange = (value) => {
    setTheme(value);
    applyThemeToDom(value);
    if (typeof localStorage !== 'undefined') localStorage.setItem('neo-theme', value);
  };

  // Open Stripe Customer Portal to manage subscription
  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    setError('');

    try {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open subscription management');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
      setManagingSubscription(false);
    }
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
          <p className="text-calm-500 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-calm-800 dark:text-slate-100">Settings</h1>
        <p className="text-calm-500 dark:text-slate-400 mt-1">Customize your Neo Routine experience</p>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
          Settings saved successfully
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm">
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
        <CardContent className="space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-calm-700 dark:text-slate-300 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: 'light',
                  label: 'Light',
                  preview: 'bg-white border border-calm-200',
                  icon: (
                    <svg className="w-5 h-5 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
                {
                  value: 'dark',
                  label: 'Dark',
                  preview: 'bg-slate-800 border border-slate-600',
                  icon: (
                    <svg className="w-5 h-5 mx-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ),
                },
                {
                  value: 'auto',
                  label: 'Auto',
                  preview: 'bg-gradient-to-r from-white to-slate-700 border border-calm-200',
                  icon: (
                    <svg className="w-5 h-5 mx-auto text-calm-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleThemeChange(option.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    theme === option.value
                      ? 'border-neo-500 bg-neo-50 dark:bg-neo-900/30 ring-2 ring-neo-200 dark:ring-neo-800'
                      : 'border-calm-200 dark:border-slate-600 hover:border-calm-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className={`w-full h-7 rounded-md mb-2 ${option.preview}`} />
                  {option.icon}
                  <p className="text-xs font-medium text-calm-700 dark:text-slate-200 mt-1.5">{option.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-calm-400 dark:text-slate-500 mt-2">
              Changes apply instantly. Auto follows your system preference.
            </p>
          </div>

          {/* Celebrations Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-calm-700 dark:text-slate-200">Celebration Animations</p>
              <p className="text-sm text-calm-500 dark:text-slate-400">Show animations when completing tasks</p>
            </div>
            <Toggle checked={celebrations} onChange={setCelebrations} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Digest Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-calm-700 dark:text-slate-200">Weekly Summary Email</p>
              <p className="text-sm text-calm-500 dark:text-slate-400">Receive a weekly progress summary</p>
            </div>
            <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
          </div>

          <hr className="border-calm-100 dark:border-slate-700" />

          {/* Push Notifications */}
          <PushNotificationSection />
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neo-50 border border-neo-100">
            <div>
              <p className="text-sm text-calm-500">Current Plan</p>
              <p className="text-xl font-bold text-calm-800 capitalize">
                {currentTier.replace('_', ' ')}
              </p>
              {subscription?.status === 'active' && subscription?.currentPeriodEnd && (
                <p className="text-xs text-calm-400 mt-1">
                  Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
              {subscription?.cancelAtPeriodEnd && (
                <p className="text-xs text-orange-500 mt-1">
                  Cancels at end of billing period
                </p>
              )}
            </div>
            <div className="text-center">
              <svg className="w-12 h-12 text-neo-500 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 6 8.5 6 13.5C6 17.09 8.69 20 12 20C15.31 20 18 17.09 18 13.5C18 8.5 12 2 12 2Z" />
              </svg>
            </div>
          </div>

          {/* Usage Limits */}
          {limits && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-calm-50 border border-calm-100">
                <p className="text-xs text-calm-500 mb-1">Routines</p>
                <p className="text-lg font-semibold text-calm-700">
                  {limits.routines === Infinity ? 'Unlimited' : `Up to ${limits.routines}`}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-calm-50 border border-calm-100">
                <p className="text-xs text-calm-500 mb-1">Tasks per Routine</p>
                <p className="text-lg font-semibold text-calm-700">
                  {limits.tasksPerRoutine === Infinity ? 'Unlimited' : `Up to ${limits.tasksPerRoutine}`}
                </p>
              </div>
            </div>
          )}

          {/* Upgrade CTA */}
          {currentTier === 'free' && (
            <Link
              href="/dashboard/upgrade"
              className="block w-full py-3 px-4 text-center rounded-lg bg-neo-500 text-white font-medium hover:bg-neo-600 transition-colors"
            >
              Upgrade to Premium
            </Link>
          )}

          {/* Manage Subscription Button (for paid users) */}
          {currentTier !== 'free' && subscription?.status === 'active' && (
            <div className="flex gap-3">
              {currentTier !== 'premium_plus' && (
                <Link
                  href="/dashboard/upgrade"
                  className="flex-1 py-3 px-4 text-center rounded-lg border border-neo-200 text-neo-600 font-medium hover:bg-neo-50 transition-colors"
                >
                  Upgrade to Premium+
                </Link>
              )}
              <button
                onClick={handleManageSubscription}
                disabled={managingSubscription}
                className="flex-1 py-3 px-4 rounded-lg bg-calm-100 text-calm-700 font-medium hover:bg-calm-200 transition-colors disabled:opacity-50"
              >
                {managingSubscription ? 'Loading...' : 'Manage Subscription'}
              </button>
            </div>
          )}

          {currentTier === 'premium_plus' && (
            <div className="space-y-3">
              <p className="text-center text-calm-500 text-sm">
                You are on our highest tier - enjoy unlimited access!
              </p>
              {subscription?.status === 'active' && (
                <button
                  onClick={handleManageSubscription}
                  disabled={managingSubscription}
                  className="w-full py-3 px-4 rounded-lg bg-calm-100 text-calm-700 font-medium hover:bg-calm-200 transition-colors disabled:opacity-50"
                >
                  {managingSubscription ? 'Loading...' : 'Manage Subscription'}
                </button>
              )}
            </div>
          )}
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
