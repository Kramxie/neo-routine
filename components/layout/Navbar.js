'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/ui/Button';

/**
 * Navbar Component
 * Main navigation with responsive mobile menu
 * Features the Neo Routine water drop logo
 */

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-calm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            {/* Water drop icon */}
            <div className="relative">
              <svg
                className="w-8 h-8 text-neo-500 group-hover:text-neo-600 transition-colors"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2ZM12 19C9.791 19 8 17.209 8 15C8 13.5 9 11.5 12 8C15 11.5 16 13.5 16 15C16 17.209 14.209 19 12 19Z" />
              </svg>
              {/* Ripple effect on hover */}
              <div className="absolute inset-0 rounded-full bg-neo-300 opacity-0 group-hover:opacity-30 group-hover:animate-ripple" />
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
            <Link
              href="/login"
              className="text-calm-600 hover:text-neo-500 transition-colors font-medium"
            >
              Login
            </Link>
            <Button href="/register" variant="primary" size="sm">
              Get Started
            </Button>
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
          </div>
        </div>
      )}
    </nav>
  );
}
