'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/**
 * Goals Page
 * Set and track personal goals linked to routines
 */

const GOAL_CATEGORIES = [
  { id: 'health', name: 'Health & Fitness', icon: '💪', color: 'bg-green-500' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', color: 'bg-blue-500' },
  { id: 'learning', name: 'Learning', icon: '📚', color: 'bg-purple-500' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: 'bg-teal-500' },
  { id: 'social', name: 'Social', icon: '👥', color: 'bg-orange-500' },
  { id: 'creative', name: 'Creative', icon: '🎨', color: 'bg-pink-500' },
  { id: 'finance', name: 'Finance', icon: '💰', color: 'bg-yellow-500' },
  { id: 'other', name: 'Other', icon: '✨', color: 'bg-gray-500' },
];

const GOAL_TIMEFRAMES = [
  { id: 'weekly', name: 'Weekly', days: 7 },
  { id: 'monthly', name: 'Monthly', days: 30 },
  { id: 'quarterly', name: 'Quarterly', days: 90 },
  { id: 'yearly', name: 'Yearly', days: 365 },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [undoToast, setUndoToast] = useState(null); // { goalId, previousValue, message, timeout }
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'health',
    timeframe: 'monthly',
    targetValue: 100,
    currentValue: 0,
    linkedRoutineId: '',
    dueDate: '',
  });

  // Fetch goals and routines
  useEffect(() => {
    async function fetchData() {
      try {
        const [goalsRes, routinesRes] = await Promise.all([
          fetch('/api/user/goals'),
          fetch('/api/routines'),
        ]);
        
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          setGoals(goalsData.goals || []);
        }
        
        if (routinesRes.ok) {
          const routinesData = await routinesRes.json();
          setRoutines(routinesData.routines || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate progress percentage
  const calculateProgress = (goal) => {
    if (!goal.targetValue) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  // Get days remaining
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Handle save goal
  const handleSaveGoal = async () => {
    try {
      const method = editingGoal ? 'PUT' : 'POST';
      const url = editingGoal ? `/api/user/goals/${editingGoal._id}` : '/api/user/goals';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingGoal) {
          setGoals(goals.map(g => g._id === editingGoal._id ? data.goal : g));
        } else {
          setGoals([...goals, data.goal]);
        }
        resetForm();
      }
    } catch (err) {
      console.error('Failed to save goal:', err);
    }
  };

  // Handle delete goal
  const handleDeleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const response = await fetch(`/api/user/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGoals(goals.filter(g => g._id !== goalId));
      }
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  // Handle quick progress update
  const handleUpdateProgress = async (goalId, increment) => {
    const goal = goals.find(g => g._id === goalId);
    if (!goal) return;

    const previousValue = goal.currentValue || 0;
    const newValue = Math.min(goal.targetValue, previousValue + increment);
    
    // Clear any existing undo timeout
    if (undoToast?.timeout) {
      clearTimeout(undoToast.timeout);
    }

    try {
      const response = await fetch(`/api/user/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: newValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(goals.map(g => g._id === goalId ? data.goal : g));
        
        // Show undo toast
        const timeoutId = setTimeout(() => {
          setUndoToast(null);
        }, 5000); // Auto-dismiss after 5 seconds
        
        setUndoToast({
          goalId,
          previousValue,
          message: `Added +${increment} to "${goal.title}"`,
          timeout: timeoutId,
        });
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  // Handle undo progress update
  const handleUndo = async () => {
    if (!undoToast) return;
    
    const { goalId, previousValue, timeout } = undoToast;
    clearTimeout(timeout);
    setUndoToast(null);

    try {
      const response = await fetch(`/api/user/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: previousValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(goals.map(g => g._id === goalId ? data.goal : g));
      }
    } catch (err) {
      console.error('Failed to undo:', err);
    }
  };

  // Dismiss undo toast
  const dismissUndoToast = () => {
    if (undoToast?.timeout) {
      clearTimeout(undoToast.timeout);
    }
    setUndoToast(null);
  };

  // Reset form
  const resetForm = () => {
    setNewGoal({
      title: '',
      description: '',
      category: 'health',
      timeframe: 'monthly',
      targetValue: 100,
      currentValue: 0,
      linkedRoutineId: '',
      dueDate: '',
    });
    setShowNewGoal(false);
    setEditingGoal(null);
  };

  // Edit goal
  const startEditing = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'health',
      timeframe: goal.timeframe || 'monthly',
      targetValue: goal.targetValue || 100,
      currentValue: goal.currentValue || 0,
      linkedRoutineId: goal.linkedRoutineId || '',
      dueDate: goal.dueDate ? goal.dueDate.split('T')[0] : '',
    });
    setShowNewGoal(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-9 w-40 bg-calm-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-calm-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 w-48 bg-calm-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
                <div className="h-4 w-full bg-calm-100 dark:bg-slate-800 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-calm-800 dark:text-white mb-2">Goals</h1>
          <p className="text-calm-600 dark:text-calm-400">
            Set meaningful goals and track your progress
          </p>
        </div>
        <Button onClick={() => setShowNewGoal(true)} variant="primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </Button>
      </div>

      {/* New Goal Form */}
      {showNewGoal && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Complete 30 morning routines"
                  className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why is this goal important to you?"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent"
                />
              </div>

              {/* Category & Timeframe */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent"
                  >
                    {GOAL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Target Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-1">
                    Current Progress
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newGoal.currentValue}
                    onChange={(e) => setNewGoal({ ...newGoal, currentValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Link to Routine */}
              {routines.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-calm-700 dark:text-calm-300 mb-1">
                    Link to Routine (optional)
                  </label>
                  <select
                    value={newGoal.linkedRoutineId}
                    onChange={(e) => setNewGoal({ ...newGoal, linkedRoutineId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-white focus:ring-2 focus:ring-neo-400 focus:border-transparent"
                  >
                    <option value="">No linked routine</option>
                    {routines.map((routine) => (
                      <option key={routine._id} value={routine._id}>
                        {routine.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveGoal} disabled={!newGoal.title.trim()}>
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Overview - Only show when there are goals */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neo-500 mb-1">
                {goals.length}
              </div>
              <div className="text-sm text-calm-600 dark:text-calm-400">Active Goals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {goals.filter(g => calculateProgress(g) >= 100).length}
              </div>
              <div className="text-sm text-calm-600 dark:text-calm-400">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {Math.round(goals.reduce((acc, g) => acc + calculateProgress(g), 0) / goals.length) || 0}%
              </div>
              <div className="text-sm text-calm-600 dark:text-calm-400">Avg Progress</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals List - Only show when there are goals */}
      {goals.length > 0 && (
        <div className="space-y-4">
          {goals.map((goal) => {
          const category = GOAL_CATEGORIES.find(c => c.id === goal.category) || GOAL_CATEGORIES[7];
          const progress = calculateProgress(goal);
          const daysRemaining = getDaysRemaining(goal.dueDate);
          const isCompleted = progress >= 100;
          const isOverdue = daysRemaining !== null && daysRemaining < 0;

          return (
            <Card key={goal._id} className={isCompleted ? 'border-green-200 dark:border-green-800' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-calm-800 dark:text-white flex items-center">
                        {goal.title}
                        {isCompleted && (
                          <span className="ml-2 text-green-500">✓</span>
                        )}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-calm-600 dark:text-calm-400 mt-1">
                          {goal.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-calm-500 dark:text-calm-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {category.name}
                        </span>
                        {daysRemaining !== null && (
                          <span className={`flex items-center ${isOverdue ? 'text-red-500' : ''}`}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(goal)}
                      className="p-2 rounded-lg hover:bg-calm-100 dark:hover:bg-slate-700 text-calm-600 dark:text-calm-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-calm-700 dark:text-calm-300">
                      Progress: {goal.currentValue || 0} / {goal.targetValue || 100}
                    </span>
                    <span className={`text-sm font-bold ${isCompleted ? 'text-green-500' : 'text-neo-500'}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="h-3 bg-calm-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-neo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {/* Quick Progress Buttons */}
                  {!isCompleted && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-calm-100 dark:border-slate-700">
                      <span className="text-sm text-calm-500 dark:text-calm-500">Add progress:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateProgress(goal._id, 1)}
                          className="px-3 py-1.5 text-sm font-medium bg-neo-100 hover:bg-neo-200 dark:bg-neo-900/30 dark:hover:bg-neo-900/50 text-neo-600 dark:text-neo-400 rounded-lg transition-colors"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleUpdateProgress(goal._id, 5)}
                          className="px-3 py-1.5 text-sm font-medium bg-neo-100 hover:bg-neo-200 dark:bg-neo-900/30 dark:hover:bg-neo-900/50 text-neo-600 dark:text-neo-400 rounded-lg transition-colors"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleUpdateProgress(goal._id, 10)}
                          className="px-3 py-1.5 text-sm font-medium bg-neo-100 hover:bg-neo-200 dark:bg-neo-900/30 dark:hover:bg-neo-900/50 text-neo-600 dark:text-neo-400 rounded-lg transition-colors"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => {
                            const remaining = (goal.targetValue || 100) - (goal.currentValue || 0);
                            handleUpdateProgress(goal._id, remaining);
                          }}
                          className="px-3 py-1.5 text-sm font-medium bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Empty State - Show when no goals exist */}
      {goals.length === 0 && (
        <div className="text-center py-16 px-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neo-100 dark:bg-neo-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-neo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-calm-800 dark:text-white mb-2">
            No goals yet
          </h3>
          <p className="text-calm-600 dark:text-calm-400 mb-6 max-w-md mx-auto">
            Set your first goal to start tracking your progress. Goals help you stay focused and motivated on your journey.
          </p>
          <Button onClick={() => setShowNewGoal(true)} variant="primary" size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Goal
          </Button>
        </div>
      )}

      {/* Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 z-50 toast-animate">
          <div className="bg-calm-800 dark:bg-slate-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-4">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">{undoToast.message}</span>
            <button
              onClick={handleUndo}
              className="px-3 py-1 text-sm font-semibold bg-neo-500 hover:bg-neo-600 text-white rounded-lg transition-colors"
            >
              Undo
            </button>
            <button
              onClick={dismissUndoToast}
              className="p-1 hover:bg-calm-700 dark:hover:bg-slate-600 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
