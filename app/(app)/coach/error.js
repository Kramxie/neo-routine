'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

/**
 * Coach Error Boundary
 * Catches errors in coach pages
 */
export default function CoachError({ error, reset }) {
  useEffect(() => {
    console.error('Coach error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="alert">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-calm-800 dark:text-slate-200 mb-2">
          Coach Dashboard Error
        </h2>
        <p className="text-calm-600 dark:text-slate-400 mb-6">
          We couldn&apos;t load the coach dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} variant="primary">
            Try Again
          </Button>
          <Button href="/dashboard" variant="secondary">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
