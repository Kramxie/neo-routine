'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Footer Component
 * Minimal footer with essential links and branding
 * Hidden on app routes (dashboard, coach) which have their own layout
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Don't render footer on app routes - they have their own sidebar layout
  const isAppRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/coach');
  
  if (isAppRoute) {
    return null;
  }

  return (
    <footer className="bg-calm-800 text-calm-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <svg
                className="w-8 h-8 text-neo-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2ZM12 19C9.791 19 8 17.209 8 15C8 13.5 9 11.5 12 8C15 11.5 16 13.5 16 15C16 17.209 14.209 19 12 19Z" />
              </svg>
              <span className="text-xl font-semibold text-white">
                Neo<span className="text-neo-400">Routine</span>
              </span>
            </div>
            <p className="text-calm-400 max-w-md mb-3 sm:mb-4 text-sm sm:text-base">
              Redesigning habits. One drop at a time. Build lasting routines without 
              the pressure of streaks or guilt.
            </p>
            <p className="text-sm text-calm-500">
              Your goals don&apos;t need pressure. They need a system.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-neo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-neo-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-neo-400 transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:text-neo-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-neo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-neo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-calm-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-calm-500">
            &copy; {currentYear} Neo Routine. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Social icons placeholder */}
            <a href="#" className="text-calm-500 hover:text-neo-400 transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="#" className="text-calm-500 hover:text-neo-400 transition-colors" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
