'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';

/**
 * Navbar Component
 * Main navigation with responsive mobile menu
 * Features the Neo Routine water drop logo
 * Auth-aware: shows different links based on login state
 */

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Don't render navbar on app routes (dashboard, etc.) - they have their own sidebar
  const isAppRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/coach');
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const result = await response.json();
          setUser(result.data?.user || null);
        }
      } catch (error) {
        // Not logged in
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname]);

  // Don't show on app routes
  if (isAppRoute) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-calm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            {/* Logo image */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/neoLogo.jfif"
                alt="NeoRoutine Logo"
                width={40}
                height={40}
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl font-semibold text-calm-800">
              Neo<span className="text-neo-500">Routine</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-calm-600 hover:text-neo-500 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-calm-600 hover:text-neo-500 transition-colors font-medium"
            >
              Pricing
            </Link>
            
            {/* Auth-aware buttons */}
            {isLoading ? (
              <div className="w-20 h-8 bg-calm-100 rounded animate-pulse" />
            ) : user ? (
              <Button href="/dashboard" variant="primary" size="sm">
                Dashboard
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-calm-600 hover:text-neo-500 transition-colors font-medium"
                >
                  Login
                </Link>
                <Button href="/register" variant="primary" size="sm">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-calm-600 hover:bg-calm-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-calm-100">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-calm-600 hover:text-neo-500 transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="block text-calm-600 hover:text-neo-500 transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            
            {/* Auth-aware mobile buttons */}
            {!isLoading && (
              user ? (
                <Button href="/dashboard" variant="primary" size="md" className="w-full">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-calm-600 hover:text-neo-500 transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Button href="/register" variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
