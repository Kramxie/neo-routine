'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';

/**
 * Create New Template Page
 */
export default function NewTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [difficulty, setDifficulty] = useState('beginner');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [color, setColor] = useState('blue');
  const [isPublic, setIsPublic] = useState(false);
  const [tasks, setTasks] = useState([{ label: '', description: '' }]);

  const categories = [
    { value: 'morning', label: 'Morning Routine' },
    { value: 'evening', label: 'Evening Routine' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'health', label: 'Health' },
    { value: 'learning', label: 'Learning' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'social', label: 'Social' },
    { value: 'custom', label: 'Custom' },
  ];

  const colors = [
    { value: 'blue', class: 'bg-neo-500' },
    { value: 'green', class: 'bg-green-500' },
    { value: 'purple', class: 'bg-purple-500' },
    { value: 'orange', class: 'bg-orange-500' },
    { value: 'pink', class: 'bg-pink-500' },
  ];

  const addTask = () => {
    if (tasks.length < 30) {
      setTasks([...tasks, { label: '', description: '' }]);
    }
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Filter out empty tasks
    const validTasks = tasks.filter((t) => t.label.trim());

    if (!title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/coach/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          estimatedMinutes,
          color,
          isPublic,
          tasks: validTasks,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create template');
      }

      router.push('/coach/templates');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/coach/templates" className="text-sm text-neo-600 hover:text-neo-700 mb-2 inline-block">
          &larr; Back to Templates
        </Link>
        <h1 className="text-2xl font-bold text-calm-800">Create Template</h1>
        <p className="text-calm-500 mt-1">Design a routine blueprint for your clients</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card variant="elevated">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-calm-800">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-calm-700 mb-2">
                Template Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Energy Routine"
                className="w-full px-4 py-3 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-calm-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this routine helps achieve..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 resize-none"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-calm-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-calm-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-calm-700 mb-2">
                  Est. Time (minutes)
                </label>
                <input
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Math.max(1, Math.min(480, parseInt(e.target.value) || 15)))}
                  min={1}
                  max={480}
                  className="w-full px-4 py-3 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-calm-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-10 h-10 rounded-lg ${c.class} ${
                        color === c.value ? 'ring-2 ring-offset-2 ring-calm-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium text-calm-700">Public Template</p>
                <p className="text-sm text-calm-500">Allow anyone to discover and adopt this template</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  isPublic ? 'bg-neo-500' : 'bg-calm-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card variant="elevated">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-calm-800">Tasks</h2>
                <p className="text-sm text-calm-500">Define the steps in this routine</p>
              </div>
              <span className="text-sm text-calm-400">{tasks.length}/30</span>
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <span className="w-6 h-6 flex-shrink-0 rounded-full bg-neo-100 text-neo-600 text-sm flex items-center justify-center mt-3">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={task.label}
                      onChange={(e) => updateTask(index, 'label', e.target.value)}
                      placeholder="Task name"
                      className="w-full px-3 py-2 rounded-lg border border-calm-200 focus:outline-none focus:ring-2 focus:ring-neo-400 text-sm"
                      maxLength={100}
                    />
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => updateTask(index, 'description', e.target.value)}
                      placeholder="Optional description"
                      className="w-full px-3 py-2 rounded-lg border border-calm-100 focus:outline-none focus:ring-2 focus:ring-neo-400 text-sm text-calm-600"
                      maxLength={300}
                    />
                  </div>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="p-2 text-calm-400 hover:text-red-500 transition-colors mt-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {tasks.length < 30 && (
              <button
                type="button"
                onClick={addTask}
                className="w-full py-2 border-2 border-dashed border-calm-200 text-calm-500 rounded-lg hover:border-neo-400 hover:text-neo-600 transition-colors"
              >
                + Add Task
              </button>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/coach/templates"
            className="px-6 py-3 border border-calm-200 text-calm-700 rounded-lg hover:bg-calm-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-neo-500 text-white font-medium rounded-lg hover:bg-neo-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
}
