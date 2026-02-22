'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

/**
 * Global Error Boundary
 * Catches errors in the application and shows a friendly message
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to console (could be sent to error tracking service)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="text-center max-w-lg">
        {/* Error icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-calm-800 dark:text-slate-200 mb-2">
          Something went wrong
        </h1>
        <p className="text-calm-600 dark:text-slate-400 mb-6">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
        </p>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
            <p className="text-sm font-mono text-red-700 dark:text-red-300 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} variant="primary">
            Try Again
          </Button>
          <Button href="/" variant="secondary">
            Go Home
          </Button>
        </div>

        {/* Support info */}
        <p className="mt-8 text-sm text-calm-500 dark:text-slate-500">
          If this keeps happening, please contact support or try refreshing the page.
        </p>
      </div>
    </div>
  );
}
