'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';
import { toHex } from '@/lib/colorUtils';

/**
 * Routines Management Page
 * View, edit, and organize all routines with today's progress
 */

export default function RoutinesPage() {
  const [routines, setRoutines] = useState([]);
  const [todayCheckIns, setTodayCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkLoading, setCheckLoading] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  // Get user's local date in YYYY-MM-DD
  const getLocalDateISO = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  };

  const fetchData = useCallback(async () => {
    try {
      const [routinesRes, todayRes] = await Promise.all([
        fetch('/api/routines'),
        fetch(`/api/checkins/today?date=${getLocalDateISO()}`),
      ]);

      if (routinesRes.ok) {
        const data = await routinesRes.json();
        setRoutines(data.routines || []);
      }

      if (todayRes.ok) {
        const data = await todayRes.json();
        // Handle both wrapped and unwrapped response formats
        const checkIns = data.data?.checkIns || data.checkIns || [];
        setTodayCheckIns(checkIns);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if a task is completed today
  const isTaskCompleted = (routineId, taskId) => {
    return todayCheckIns.some(
      (c) => c.routineId === routineId && c.taskId === taskId
    );
  };

  // Get completion stats for a routine
  const getRoutineProgress = (routine) => {
    const activeTasks = routine.tasks?.filter((t) => t.isActive !== false) || [];
    const completed = activeTasks.filter((t) => 
      isTaskCompleted(routine._id, t._id)
    ).length;
    return {
      completed,
      total: activeTasks.length,
      percent: activeTasks.length > 0 ? Math.round((completed / activeTasks.length) * 100) : 0,
    };
  };

  // Toggle task completion
  const handleToggleTask = async (routineId, taskId) => {
    const key = `${routineId}_${taskId}`;
    if (checkLoading[key]) return;

    setCheckLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const isCompleted = isTaskCompleted(routineId, taskId);

      if (isCompleted) {
        // Uncheck - DELETE request
        const response = await fetch('/api/checkins', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routineId,
            taskId,
            dateISO: getLocalDateISO(),
          }),
        });

        if (response.ok) {
          setTodayCheckIns((prev) =>
            prev.filter((c) => !(c.routineId === routineId && c.taskId === taskId))
          );
        }
      } else {
        // Check - POST request
        const response = await fetch('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routineId,
            taskId,
            dateISO: getLocalDateISO(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTodayCheckIns((prev) => [
            ...prev,
            {
              routineId,
              taskId,
              dateISO: getLocalDateISO(),
              ...data.checkIn,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setCheckLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRoutines(routines.filter((r) => r._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete routine:', error);
    } finally {
      setDeleteId(null);
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
          <p className="text-calm-500">Loading routines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-calm-800">Your Routines</h1>
          <p className="text-calm-500 mt-1">Manage your daily flows</p>
        </div>
        <Link
          href="/dashboard/routines/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neo-500 text-white hover:bg-neo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Routine
        </Link>
      </div>

      {/* Empty State */}
      {routines.length === 0 ? (
        <Card variant="elevated">
          <CardContent>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neo-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-neo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-calm-700 mb-2">
                No routines yet
              </h3>
              <p className="text-calm-500 mb-6 max-w-md mx-auto">
                Create your first routine to start building positive habits.
                Each routine can have multiple tasks that you'll check off daily.
              </p>
              <Link
                href="/dashboard/routines/new"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neo-500 text-white hover:bg-neo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Routine
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {routines.map((routine) => {
            const progress = getRoutineProgress(routine);
            const activeTasks = routine.tasks?.filter((t) => t.isActive !== false) || [];
            
            return (
            <Card key={routine._id} variant="elevated" className="overflow-hidden">
              {/* Progress bar */}
              <div className="h-2 bg-calm-100 relative overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${progress.percent}%`,
                    backgroundColor: toHex(routine.color) || '#0ea5e9',
                  }}
                />
              </div>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${toHex(routine.color) || '#0ea5e9'}20` }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: toHex(routine.color) || '#0ea5e9' }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-calm-800">{routine.name}</h3>
                      <p className="text-sm text-calm-500">
                        {progress.completed}/{progress.total} tasks
                        {progress.percent === 100 && (
                          <span className="ml-2 text-green-500">✓ Complete!</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions dropdown */}
                  <div className="relative">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/routines/${routine._id}/edit`}
                        className="p-2 text-calm-400 hover:text-neo-500 transition-colors rounded-lg hover:bg-calm-50"
                        title="Edit routine"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setDeleteId(routine._id)}
                        className="p-2 text-calm-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete routine"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Tasks */}
                <div className="space-y-2">
                  {activeTasks.map((task) => {
                    const completed = isTaskCompleted(routine._id, task._id);
                    const loadingKey = `${routine._id}_${task._id}`;
                    const isLoading = checkLoading[loadingKey];
                    
                    return (
                      <button
                        key={task._id}
                        onClick={() => handleToggleTask(routine._id, task._id)}
                        disabled={isLoading}
                        className={`
                          w-full flex items-center gap-3 p-2 rounded-lg text-left
                          transition-all duration-200 group
                          ${completed 
                            ? 'bg-green-50 hover:bg-green-100' 
                            : 'hover:bg-calm-50'
                          }
                          ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                        `}
                      >
                        <div
                          className={`
                            w-5 h-5 rounded-full border-2 flex-shrink-0
                            flex items-center justify-center transition-all duration-200
                            ${completed 
                              ? 'border-green-500 bg-green-500' 
                              : 'group-hover:border-neo-400'
                            }
                          `}
                          style={{ 
                            borderColor: completed ? '#22c55e' : (toHex(routine.color) || '#0ea5e9'),
                          }}
                        >
                          {completed && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isLoading && (
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          )}
                        </div>
                        <span className={`
                          text-sm truncate flex-1 transition-all duration-200
                          ${completed ? 'text-green-700 line-through' : 'text-calm-700'}
                        `}>
                          {task.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-calm-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-calm-800 text-center mb-2">
              Delete Routine?
            </h3>
            <p className="text-calm-500 text-center text-sm mb-6">
              This will archive the routine. Your check-in history will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-calm-200 text-calm-600 hover:bg-calm-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
