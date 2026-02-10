'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Edit Routine Page
 * Modify existing routine's name, tasks, and color
 */

const colorOptions = [
  { name: 'Ocean', value: '#0ea5e9' },
  { name: 'Forest', value: '#22c55e' },
  { name: 'Sunset', value: '#f97316' },
  { name: 'Lavender', value: '#a855f7' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Sand', value: '#eab308' },
];

export default function EditRoutinePage() {
  const router = useRouter();
  const params = useParams();
  const routineId = params.id;

  const [name, setName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [color, setColor] = useState(colorOptions[0].value);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing routine data
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await fetch(`/api/routines/${routineId}`);
        if (response.ok) {
          const data = await response.json();
          const routine = data.routine;
          setName(routine.name);
          setColor(routine.color || colorOptions[0].value);
          setTasks(
            routine.tasks.map((t) => ({
              id: t._id || Date.now() + Math.random(),
              label: t.label,
              isActive: t.isActive !== false,
              _id: t._id,
            }))
          );
        } else {
          setError('Routine not found');
        }
      } catch (err) {
        setError('Failed to load routine');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (routineId) {
      fetchRoutine();
    }
  }, [routineId]);

  // Add new task
  const addTask = () => {
    setTasks([...tasks, { label: '', id: Date.now(), isActive: true, isNew: true }]);
  };

  // Update task label
  const updateTask = (id, label) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, label } : t)));
  };

  // Toggle task active state
  const toggleTaskActive = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  };

  // Remove new task (only for tasks not yet saved)
  const removeTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task?.isNew) {
      setTasks(tasks.filter((t) => t.id !== id));
    } else {
      // For existing tasks, just mark as inactive
      toggleTaskActive(id);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Validate
    if (!name.trim()) {
      setError('Please give your routine a name');
      setSaving(false);
      return;
    }

    const activeTasks = tasks.filter((t) => t.label.trim());
    if (activeTasks.length === 0) {
      setError('Add at least one task to your routine');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/routines/${routineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          tasks: activeTasks.map((t) => ({
            label: t.label.trim(),
            isActive: t.isActive,
            _id: t._id,
          })),
          color,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update routine');
      }

      router.push('/dashboard/routines');
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
          <p className="text-calm-500">Loading routine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/routines"
        className="inline-flex items-center gap-1 text-calm-500 hover:text-calm-700 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Routines
      </Link>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Edit Routine</CardTitle>
          <p className="text-sm text-calm-500 mt-1">
            Make changes to your routine. Deactivating tasks preserves your history.
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
                className="w-full px-4 py-3 rounded-xl border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-calm-700 mb-2">
                Color
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
                Tasks
              </label>

              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex gap-2 items-center ${!task.isActive ? 'opacity-50' : ''}`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: task.isActive ? color : '#94a3b8' }}
                    >
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={task.label}
                      onChange={(e) => updateTask(task.id, e.target.value)}
                      disabled={!task.isActive && !task.isNew}
                      className={`
                        flex-1 px-4 py-2 rounded-lg border border-calm-200 
                        focus:outline-none focus:ring-2 focus:ring-neo-400 
                        focus:border-transparent transition-all
                        ${!task.isActive ? 'bg-calm-50 line-through' : ''}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className={`p-2 transition-colors ${
                        task.isActive
                          ? 'text-calm-400 hover:text-red-500'
                          : 'text-calm-400 hover:text-neo-500'
                      }`}
                      title={task.isNew ? 'Remove' : task.isActive ? 'Deactivate' : 'Reactivate'}
                    >
                      {task.isNew ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : task.isActive ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
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
                Add New Task
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/dashboard/routines"
                className="flex-1 py-3 rounded-xl border border-calm-200 text-calm-600 text-center font-medium hover:bg-calm-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-neo-500 text-white font-medium hover:bg-neo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
