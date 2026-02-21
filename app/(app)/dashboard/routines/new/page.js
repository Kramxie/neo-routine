'use client';

import { useState } from 'react';
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

  // Add new task input
  const addTask = () => {
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
        throw new Error(data.error || 'Failed to create routine');
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
                className="mt-3 inline-flex items-center gap-1 text-sm text-neo-600 hover:text-neo-700 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Task
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
    </div>
  );
}
