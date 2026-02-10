/**
 * Login Page (Placeholder)
 * Will be fully implemented in PHASE 2
 */

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-water">
      <div className="card-soft max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-neo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-calm-800">Welcome back</h1>
          <p className="text-calm-600 mt-2">Sign in to continue your routine</p>
        </div>

        {/* Placeholder form - will be implemented in PHASE 2 */}
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-calm-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-neo"
              placeholder="you@example.com"
              disabled
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-calm-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input-neo"
              placeholder="••••••••"
              disabled
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full opacity-50 cursor-not-allowed"
            disabled
          >
            Sign In (Coming in Phase 2)
          </button>
        </form>

        <p className="text-center text-sm text-calm-600 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-neo-500 hover:text-neo-600 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
