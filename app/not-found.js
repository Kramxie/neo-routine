'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

/**
 * Custom 404 Page
 * Water-themed "page not found" experience
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neo-50 to-white dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="text-center max-w-lg">
        {/* Water drop animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto">
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full text-neo-400 animate-bounce"
            >
              {/* Water drop */}
              <path
                fill="currentColor"
                d="M50 10 C50 10 15 55 15 75 C15 95 30 110 50 110 C70 110 85 95 85 75 C85 55 50 10 50 10 Z"
                opacity="0.3"
              />
              <path
                fill="currentColor"
                d="M50 15 C50 15 20 55 20 73 C20 91 33 105 50 105 C67 105 80 91 80 73 C80 55 50 15 50 15 Z"
              />
              {/* Question mark inside */}
              <text
                x="50"
                y="80"
                textAnchor="middle"
                fill="white"
                fontSize="35"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                ?
              </text>
            </svg>
          </div>
          
          {/* Ripple effects */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-6">
            <div className="absolute inset-0 rounded-full border-2 border-neo-300 opacity-60 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-neo-200 opacity-40 animate-ping" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        {/* Error code */}
        <h1 className="text-6xl font-bold text-neo-600 dark:text-neo-400 mb-4">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-calm-800 dark:text-slate-200 mb-2">
          Page Not Found
        </h2>
        <p className="text-calm-600 dark:text-slate-400 mb-8">
          This drop seems to have evaporated. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/" variant="primary">
            Go Home
          </Button>
          <Button href="/dashboard" variant="secondary">
            Dashboard
          </Button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-calm-200 dark:border-slate-700">
          <p className="text-sm text-calm-500 dark:text-slate-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/dashboard/routines" className="text-neo-600 hover:text-neo-700 dark:text-neo-400">
              Routines
            </Link>
            <Link href="/dashboard/goals" className="text-neo-600 hover:text-neo-700 dark:text-neo-400">
              Goals
            </Link>
            <Link href="/dashboard/insights" className="text-neo-600 hover:text-neo-700 dark:text-neo-400">
              Insights
            </Link>
            <Link href="/dashboard/settings" className="text-neo-600 hover:text-neo-700 dark:text-neo-400">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
