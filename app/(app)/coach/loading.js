/**
 * Coach Loading State
 * Shows while coach pages are loading
 */
export default function CoachLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        {/* Animated water drop */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-neo-100 dark:bg-neo-900/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-neo-500 animate-bounce"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full border-2 border-neo-300 dark:border-neo-600 animate-ping opacity-75" />
        </div>

        <p className="text-calm-500 dark:text-slate-400 font-medium">Loading coach dashboard...</p>
      </div>
    </div>
  );
}
