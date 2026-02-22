'use client';

/**
 * Public Routes Loading State
 * Shows consistent loading state for public pages
 */
export default function PublicLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-water dark:bg-slate-900">
      <div className="text-center">
        {/* Animated water drop */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-neo-100 dark:bg-neo-900 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full bg-neo-200 dark:bg-neo-800 animate-ping opacity-20" style={{ animationDelay: '0.2s' }} />
          <div className="relative w-16 h-16 rounded-full bg-neo-100 dark:bg-neo-900/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-neo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
        </div>

        {/* Loading text */}
        <p className="text-calm-600 dark:text-slate-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
