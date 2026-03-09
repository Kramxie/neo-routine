'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'health', label: 'Health' },
  { value: 'learning', label: 'Learning' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'social', label: 'Social' },
];

const difficulties = [
  { value: '', label: 'Any Level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const colorMap = {
  blue: 'bg-neo-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function TemplateMarketplacePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adopting, setAdopting] = useState(null);
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [hasFullAccess, setHasFullAccess] = useState(true);
  const [userTier, setUserTier] = useState('free');

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (difficulty) params.set('difficulty', difficulty);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/templates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setHasFullAccess(data.hasFullAccess ?? true);
        setUserTier(data.userTier || 'free');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchTemplates, search ? 400 : 0);
    return () => clearTimeout(debounce);
  }, [fetchTemplates, search]);

  const handleAdopt = async (template) => {
    setAdopting(template.id);
    setMessage(null);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.upgradeRequired) {
          setMessage({
            type: 'upgrade',
            text: data.message,
            prompt: data.upgradePrompt,
          });
        } else {
          setMessage({ type: 'error', text: data.message });
        }
        return;
      }

      setMessage({ type: 'success', text: data.message });
      // Refresh adoption counts
      fetchTemplates();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to adopt template' });
      console.error('Adopt error:', err);
    } finally {
      setAdopting(null);
    }
  };

  return (
    <div className="neo-page space-y-6">
      <div className="neo-page-corner" />

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-calm-800 dark:text-slate-100">
          Template Marketplace
        </h1>
        <p className="text-sm sm:text-base text-calm-500 dark:text-slate-400 mt-1">
          Browse professionally crafted routines from certified coaches
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-start justify-between gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : message.type === 'upgrade'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{message.text}</p>
            {message.type === 'upgrade' && (
              <Link
                href="/dashboard/upgrade"
                className="inline-block mt-2 text-sm font-semibold text-neo-600 hover:text-neo-700 underline"
              >
                {message.prompt?.cta || 'View Plans'} &rarr;
              </Link>
            )}
            {message.type === 'success' && (
              <Link
                href="/dashboard/routines"
                className="inline-block mt-2 text-sm font-semibold text-green-700 hover:text-green-800 underline"
              >
                View in Routines &rarr;
              </Link>
            )}
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-current opacity-50 hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Free Tier Upgrade Banner */}
      {!loading && !hasFullAccess && (
        <div className="relative overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 dark:border-amber-700/40 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  You&apos;re viewing {templates.length} free template{templates.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5">
                  Upgrade to Premium to unlock all 18+ professionally crafted routines from certified coaches
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/upgrade"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm whitespace-nowrap"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-calm-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-neo-400 text-sm"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-calm-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-calm-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-neo-400 text-sm"
            >
              {difficulties.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat.value
                    ? 'bg-neo-500 text-white'
                    : 'bg-calm-100 dark:bg-slate-700 text-calm-600 dark:text-slate-300 hover:bg-calm-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-calm-200 dark:bg-slate-600" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-calm-200 dark:bg-slate-600 rounded w-3/4" />
                      <div className="h-3 bg-calm-100 dark:bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-calm-100 dark:bg-slate-700 rounded" />
                  <div className="h-3 bg-calm-100 dark:bg-slate-700 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-calm-100 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-calm-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-calm-600 dark:text-slate-400 font-medium">No templates found</p>
          <p className="text-sm text-calm-500 dark:text-slate-500 mt-1">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                {/* Top row: color + title */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      colorMap[template.color] || 'bg-neo-500'
                    }`}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-calm-800 dark:text-slate-100 truncate">
                        {template.title}
                      </h3>
                      {template.isPremium && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded uppercase tracking-wider flex-shrink-0">
                          PRO
                        </span>
                      )}
                    </div>
                    {template.isFeatured && (
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-calm-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {template.description || 'No description provided'}
                </p>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${difficultyColors[template.difficulty]}`}>
                    {template.difficulty}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-calm-100 dark:bg-slate-700 text-calm-600 dark:text-slate-300 rounded-full capitalize">
                    {template.category}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-calm-100 dark:bg-slate-700 text-calm-600 dark:text-slate-300 rounded-full">
                    {template.taskCount} tasks
                  </span>
                  {template.estimatedMinutes && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-calm-100 dark:bg-slate-700 text-calm-600 dark:text-slate-300 rounded-full">
                      ~{template.estimatedMinutes}min
                    </span>
                  )}
                </div>

                {/* Coach info */}
                <div className="flex items-center gap-2 mb-4 py-2 border-t border-calm-100 dark:border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-neo-100 dark:bg-neo-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-neo-600 dark:text-neo-400">
                      {template.coach?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <span className="text-xs text-calm-500 dark:text-slate-400 truncate">
                    {template.coach?.name || 'Coach'}
                  </span>
                  {template.coach?.isVerified && (
                    <svg className="w-3.5 h-3.5 text-neo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {template.stats?.adoptions > 0 && (
                    <span className="text-[11px] text-calm-400 dark:text-slate-500 ml-auto">
                      {template.stats.adoptions} adopted
                    </span>
                  )}
                </div>

                {/* Adopt button */}
                <button
                  onClick={() => handleAdopt(template)}
                  disabled={adopting === template.id}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    template.isPremium
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                      : 'bg-neo-500 text-white hover:bg-neo-600'
                  }`}
                >
                  {adopting === template.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adopting...
                    </span>
                  ) : template.isPremium ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Adopt Premium Template
                    </span>
                  ) : (
                    'Adopt Template'
                  )}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
