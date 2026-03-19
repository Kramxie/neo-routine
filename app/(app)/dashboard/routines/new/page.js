'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Create New Routine Page
 * Calm, guided routine creation experience
 */

// Predefined color options
const colorOptions = [
  { name: 'Ocean', value: '#0ea5e9' },
  { name: 'Forest', value: '#22c55e' },
  { name: 'Sunset', value: '#f97316' },
  { name: 'Lavender', value: '#a855f7' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Sand', value: '#eab308' },
];

export default function NewRoutinePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState([{ label: '', id: Date.now() }]);
  const [color, setColor] = useState(colorOptions[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskLimit, setTaskLimit] = useState(5); // default to free tier limit
  const [upgradePrompt, setUpgradePrompt] = useState({
    show: false,
    title: 'Routine Limit Reached',
    message: '',
    limit: 3,
    current: 3,
  });
  const [upgradePromptVisible, setUpgradePromptVisible] = useState(false);

  // Fetch user's tier limits on mount
  useEffect(() => {
    fetch('/api/subscription')
      .then((res) => res.json())
      .then((data) => {
        if (data.limits?.maxTasksPerRoutine) {
          const max = data.limits.maxTasksPerRoutine;
          setTaskLimit(max === Infinity ? 999 : max);
        }
      })
      .catch(() => {}); // fail silently — API enforces the real limit
  }, []);

  // Animate upgrade modal entrance for a smoother premium feel.
  useEffect(() => {
    if (!upgradePrompt.show) {
      setUpgradePromptVisible(false);
      return;
    }

    setUpgradePromptVisible(false);
    const rafId = requestAnimationFrame(() => {
      setUpgradePromptVisible(true);
    });

    return () => cancelAnimationFrame(rafId);
  }, [upgradePrompt.show]);

  const closeUpgradePrompt = () => {
    setUpgradePromptVisible(false);
    setUpgradePrompt((prev) => ({ ...prev, show: false }));
  };

  // Add new task input (respects tier task limit)
  const addTask = () => {
    if (tasks.length >= taskLimit) return;
    setTasks([...tasks, { label: '', id: Date.now() }]);
  };

  // Update task label
  const updateTask = (id, label) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, label } : t)));
  };

  // Remove task
  const removeTask = (id) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    closeUpgradePrompt();
    setLoading(true);

    // Filter out empty tasks
    const validTasks = tasks
      .filter((t) => t.label.trim())
      .map((t) => ({ label: t.label.trim() }));

    if (!name.trim()) {
      setError('Please give your routine a name');
      setLoading(false);
      return;
    }

    if (validTasks.length === 0) {
      setError('Add at least one task to your routine');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          tasks: validTasks,
          color,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error === 'ROUTINE_LIMIT_REACHED') {
          setUpgradePrompt({
            show: true,
            title: 'Routine Limit Reached',
            message: data.message || 'You have reached your routine limit for your current plan.',
            limit: data.data?.limit ?? 3,
            current: data.data?.current ?? 3,
          });
          return;
        }
        throw new Error(data.message || data.error || 'Failed to create routine');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-calm-500 hover:text-calm-700 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Create New Routine</CardTitle>
          <p className="text-sm text-calm-500 mt-1">
            Build your routine one drop at a time. Start simple - you can always add more later.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Routine Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-calm-700 mb-2">
                Routine Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Flow, Evening Wind-down"
                className="w-full px-4 py-3 rounded-xl border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-calm-700 mb-2">
                Choose a Color
              </label>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={`
                      w-10 h-10 rounded-full transition-all
                      ${color === opt.value
                        ? 'ring-2 ring-offset-2 ring-calm-400 scale-110'
                        : 'hover:scale-105'
                      }
                    `}
                    style={{ backgroundColor: opt.value }}
                    title={opt.name}
                  />
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div>
              <label className="block text-sm font-medium text-calm-700 mb-2">
                Tasks (Your Daily Drops)
              </label>
              <p className="text-xs text-calm-500 mb-3">
                What small actions make up this routine? Keep each one simple and achievable.
              </p>

              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div key={task.id} className="flex gap-2 items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: color }}
                    >
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={task.label}
                      onChange={(e) => updateTask(task.id, e.target.value)}
                      placeholder={`Task ${index + 1}: e.g., Drink water, Stretch, Journal`}
                      className="flex-1 px-4 py-2 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 focus:border-transparent transition-all"
                    />
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        className="p-2 text-calm-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addTask}
                disabled={tasks.length >= taskLimit}
                className={`mt-3 inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                  tasks.length >= taskLimit
                    ? 'text-calm-400 cursor-not-allowed'
                    : 'text-neo-600 hover:text-neo-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {tasks.length >= taskLimit
                  ? `Task limit reached (${taskLimit} max on your plan)`
                  : `Add Another Task (${tasks.length}/${taskLimit})`}
              </button>
            </div>

            {/* Preview */}
            {name && (
              <div className="p-4 rounded-xl bg-calm-50 border border-calm-100">
                <p className="text-xs text-calm-500 mb-2">Preview</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-calm-800">{name}</span>
                  <span className="text-calm-500 text-sm">
                    - {tasks.filter((t) => t.label.trim()).length} drops
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/dashboard"
                className="flex-1 py-3 rounded-xl border border-calm-200 text-calm-600 text-center font-medium hover:bg-calm-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-neo-500 text-white font-medium hover:bg-neo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Routine'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {upgradePrompt.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close upgrade prompt"
            className={`absolute inset-0 bg-calm-900/45 transition-opacity duration-200 ${
              upgradePromptVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeUpgradePrompt}
          />
          <div
            className={`relative w-full max-w-md rounded-2xl border border-calm-200 bg-white p-6 shadow-2xl transition-all duration-200 ${
              upgradePromptVisible
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-2 scale-95 opacity-0'
            }`}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-calm-800">{upgradePrompt.title}</h3>
                <p className="text-xs text-calm-500">{upgradePrompt.current} / {upgradePrompt.limit} routines used</p>
              </div>
            </div>

            <p className="text-sm text-calm-600">{upgradePrompt.message}</p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push('/dashboard/upgrade')}
                className="flex-1 rounded-xl bg-neo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neo-600"
              >
                Upgrade to Premium
              </button>
              <button
                type="button"
                onClick={closeUpgradePrompt}
                className="flex-1 rounded-xl border border-calm-200 px-4 py-2.5 text-sm font-medium text-calm-600 transition-colors hover:bg-calm-50"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
