'use client';

import { useState } from 'react';
import { toHex } from '@/lib/colorUtils';

/**
 * DropList Component
 * Displays routine tasks as checkable drops
 * Each check creates a visual "ripple" effect
 */

export default function DropList({
  routine,
  checkedTaskIds = [],
  onToggleTask,
  disabled = false,
  className = '',
}) {
  const [animatingTask, setAnimatingTask] = useState(null);

  if (!routine || !routine.tasks) {
    return null;
  }

  const activeTasks = routine.tasks.filter((task) => task.isActive !== false);

  const handleToggle = async (task) => {
    if (disabled) return;

    const taskId = String(task._id || task.id);

    // Trigger ripple animation
    setAnimatingTask(taskId);
    setTimeout(() => setAnimatingTask(null), 600);

    // Call parent handler with string ids
    if (onToggleTask) {
      const isCurrentlyChecked = checkedTaskIds.map(String).includes(taskId);
      onToggleTask(String(routine._id || routine.id), taskId, !isCurrentlyChecked);
    }
  };

  const normalizedChecked = (Array.isArray(checkedTaskIds) ? checkedTaskIds : []).map(String);
  const completedCount = activeTasks.filter((t) =>
    normalizedChecked.includes(String(t._id || t.id))
  ).length;

  const progressPercent = activeTasks.length > 0
    ? Math.round((completedCount / activeTasks.length) * 100)
    : 0;

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-calm-100 dark:border-slate-700 overflow-hidden ${className}`}
    >
      {/* Routine Header */}
      <div
        className="px-4 py-3 border-b border-calm-100 dark:border-slate-700 flex items-center justify-between"
        style={{ backgroundColor: routine.color ? `${toHex(routine.color)}10` : undefined }}
      >
        <div className="flex items-center gap-3">
          {/* Color indicator dot */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: toHex(routine.color) || '#0ea5e9' }}
          />
          <h3 className="font-medium text-calm-800 dark:text-slate-100">{routine.name}</h3>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-calm-500 dark:text-slate-400">
            {completedCount}/{activeTasks.length}
          </span>
          <div className="w-16 h-2 bg-calm-100 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-neo-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <ul className="divide-y divide-calm-50 dark:divide-slate-700">
        {activeTasks.map((task) => {
          const taskId = String(task._id || task.id);
          const isChecked = normalizedChecked.includes(taskId);
          const isAnimating = animatingTask === taskId;

          return (
            <li key={taskId}>
              <button
                  onClick={() => handleToggle(task)}
                disabled={disabled}
                className={`
                  w-full px-4 py-3 flex items-center gap-3
                  transition-all duration-200
                  hover:bg-neo-50/50 dark:hover:bg-slate-700/50
                  ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                `}
              >
                {/* Checkbox drop */}
                <div className="relative">
                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      transition-all duration-300
                      ${isChecked
                        ? 'bg-neo-500 border-neo-500'
                        : 'border-calm-300 dark:border-slate-500 bg-white dark:bg-slate-700 hover:border-neo-400'
                      }
                    `}
                  >
                    {isChecked && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Ripple effect on check */}
                  {isAnimating && isChecked && (
                    <>
                      <span className="absolute inset-0 rounded-full border-2 border-neo-400 animate-ping" />
                      <span className="absolute inset-0 rounded-full border-2 border-neo-300 animate-ping" style={{ animationDelay: '150ms' }} />
                    </>
                  )}
                </div>

                {/* Task label */}
                <span
                  className={`
                    flex-1 text-left transition-all duration-200
                    ${isChecked
                      ? 'text-calm-400 dark:text-slate-500 line-through'
                      : 'text-calm-700 dark:text-slate-200'
                    }
                  `}
                >
                  {task.label}
                </span>

                {/* Water drop icon */}
                {isChecked && (
                  <svg
                    className="w-5 h-5 text-neo-400 animate-drop"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2c-5.33 8-8 11.87-8 15 0 4.42 3.58 8 8 8s8-3.58 8-8c0-3.13-2.67-7-8-15z" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* All done message */}
      {completedCount === activeTasks.length && activeTasks.length > 0 && (
        <div className="px-4 py-3 bg-neo-50 dark:bg-neo-900/30 border-t border-neo-100 dark:border-neo-800 text-center">
          <p className="text-neo-600 dark:text-neo-400 text-sm font-medium">
            All drops collected for {routine.name}!
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact task item for quick views
 */
export function TaskChip({ label, completed = false, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
        transition-all duration-200
        ${completed
          ? 'bg-neo-100 dark:bg-neo-900/30 text-neo-700 dark:text-neo-300'
          : 'bg-calm-100 dark:bg-slate-700 text-calm-600 dark:text-slate-300 hover:bg-neo-50 dark:hover:bg-slate-600'
        }
        ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          w-3 h-3 rounded-full border flex items-center justify-center
          ${completed ? 'bg-neo-500 border-neo-500' : 'border-calm-400 dark:border-slate-500'}
        `}
      >
        {completed && (
          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className={completed ? 'line-through' : ''}>{label}</span>
    </button>
  );
}
