'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * App Layout for Protected Routes
 * Includes app navigation sidebar and user menu
 */

export default function AppLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, _setNotifications] = useState([]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const result = await response.json();
          setUser(result.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: 'Routines',
      href: '/dashboard/routines',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      name: 'Calendar',
      href: '/dashboard/calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Insights',
      href: '/dashboard/insights',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Goals',
      href: '/dashboard/goals',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Achievements',
      href: '/dashboard/achievements',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];

  // Bottom navigation items
  const bottomNavItems = [
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
          <div className="min-h-screen bg-calm-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-neo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
          <p className="text-calm-600 dark:text-slate-400">Loading your routine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-calm-50 dark:bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-calm-100
          dark:bg-slate-800 dark:border-slate-700
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-calm-100 dark:border-slate-700">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-neo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
            <span className="text-xl font-semibold text-calm-800 dark:text-slate-100">
              Neo<span className="text-neo-500">Routine</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-neo text-calm-600 hover:bg-neo-50 hover:text-neo-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-neo-300 transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom nav items */}
        <div className="p-4 border-t border-calm-100 dark:border-slate-700 space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-neo text-calm-600 hover:bg-neo-50 hover:text-neo-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-neo-300 transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* User section at bottom */}
        <div className="p-4 border-t border-calm-100 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-neo-100 dark:bg-neo-900/30 flex items-center justify-center">
              <span className="text-neo-600 dark:text-neo-400 font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-calm-800 dark:text-slate-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-calm-500 dark:text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-neo text-calm-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-calm-100 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-calm-600 dark:text-slate-300 hover:bg-calm-100 dark:hover:bg-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Greeting */}
          <div className="hidden lg:block">
            <p className="text-calm-600 dark:text-slate-400">
              Welcome back, <span className="font-medium text-calm-800 dark:text-slate-100">{user?.name || 'there'}</span>
            </p>
          </div>

          {/* Right side - notifications and date */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={function() { setShowNotifications(!showNotifications); }}
                className="p-2 rounded-lg text-calm-500 hover:bg-calm-100 hover:text-calm-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-neo-500 rounded-full"></span>
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-calm-200 dark:border-slate-700 z-50">
                  <div className="p-4 border-b border-calm-100 dark:border-slate-700">
                    <h3 className="font-semibold text-calm-800 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-calm-500 dark:text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-sm">No notifications yet</p>
                        <p className="text-xs mt-1">We&apos;ll notify you when something happens</p>
                      </div>
                    ) : (
                      notifications.map(function(notif, idx) {
                        return (
                          <div key={idx} className="p-4 border-b border-calm-50 dark:border-slate-700 hover:bg-calm-50 dark:hover:bg-slate-700">
                            <p className="text-sm text-calm-800 dark:text-white">{notif.message}</p>
                            <p className="text-xs text-calm-500 dark:text-slate-400 mt-1">{notif.time}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="text-sm text-calm-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
