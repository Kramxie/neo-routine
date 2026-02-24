'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';

/**
 * Coach Templates Page
 * List and manage routine templates
 */
export default function CoachTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/coach/templates?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/coach/templates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handlePublish = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/coach/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (res.ok) {
        fetchTemplates();
      }
    } catch (err) {
      console.error('Error updating template:', err);
    }
  };

  const colorClasses = {
    blue: 'bg-neo-100 border-neo-200',
    green: 'bg-green-100 border-green-200',
    purple: 'bg-purple-100 border-purple-200',
    orange: 'bg-orange-100 border-orange-200',
    pink: 'bg-pink-100 border-pink-200',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/coach" className="text-sm text-neo-600 hover:text-neo-700 mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-calm-800">Templates</h1>
          <p className="text-sm sm:text-base text-calm-500 mt-1">Create routine blueprints for your clients</p>
        </div>
        <Link
          href="/coach/templates/new"
          className="px-4 py-2.5 bg-neo-500 text-white rounded-lg hover:bg-neo-600 transition-colors inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:self-start"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-calm-200 overflow-x-auto">
        {[
          { value: 'all', label: 'All' },
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Drafts' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${filter === tab.value
                ? 'border-neo-500 text-neo-600'
                : 'border-transparent text-calm-500 hover:text-calm-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neo-100 animate-pulse" />
          <p className="text-calm-500">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-calm-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-calm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <p className="text-calm-600 mb-4">No templates yet</p>
          <Link
            href="/coach/templates/new"
            className="text-neo-600 hover:text-neo-700 font-medium"
          >
            Create your first template &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {templates.map((template) => (
            <Card key={template.id} variant="flat">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Color indicator */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 flex items-center justify-center border ${colorClasses[template.color]}`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-calm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-calm-800 truncate">{template.title}</h3>
                      {template.isPublished ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-calm-100 text-calm-600 rounded-full">
                          Draft
                        </span>
                      )}
                      {template.isPublic && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-neo-100 text-neo-700 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-calm-500 line-clamp-1">
                      {template.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-calm-400">
                      <span>{template.taskCount} tasks</span>
                      <span className="capitalize">{template.difficulty}</span>
                      <span className="capitalize">{template.category}</span>
                      {template.stats?.adoptions > 0 && (
                        <span className="text-neo-600">
                          {template.stats.adoptions} adoption{template.stats.adoptions !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePublish(template.id, template.isPublished)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        template.isPublished
                          ? 'bg-calm-100 text-calm-600 hover:bg-calm-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {template.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link
                      href={`/coach/templates/${template.id}`}
                      className="px-3 py-1.5 text-sm bg-neo-100 text-neo-700 rounded-lg hover:bg-neo-200 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 text-calm-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Share Code */}
                {template.shareCode && template.isPublished && (
                  <div className="mt-3 pt-3 border-t border-calm-100 flex items-center gap-2">
                    <span className="text-xs text-calm-400">Share code:</span>
                    <code className="px-2 py-1 bg-calm-50 text-calm-700 text-xs rounded font-mono">
                      {template.shareCode}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(template.shareCode)}
                      className="text-xs text-neo-600 hover:text-neo-700"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
