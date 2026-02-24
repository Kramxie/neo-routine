'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import SkipNavigation from '../ui/SkipNavigation';
import { useEffect } from 'react';

/**
 * Applies the correct dark/light class to <html> based on theme preference.
 * Handles 'light', 'dark', and 'auto' (system preference).
 */
function applyThemeToDom(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'auto') {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Expose so settings page can call it too
export { applyThemeToDom };

/**
 * Layout Wrapper Component
 * Conditionally renders Navbar and Footer based on route
 * App routes (dashboard, coach) have their own sidebar layout
 */

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // App routes have their own layout with sidebar
  const isAppRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/coach');

  // Sync theme on client mount (replaces ThemeSync component to avoid hydration mismatch)
  useEffect(function () {
    fetch('/api/user/preferences')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data) return;
        var theme = (data.preferences && data.preferences.theme) || 'light';
        applyThemeToDom(theme);
      })
      .catch(function () { /* ignore */ });
  }, []);

  return (
    <>
      <SkipNavigation />
      <Navbar />
      <main 
        id="main-content" 
        tabIndex={-1}
        className={isAppRoute ? '' : 'flex-grow pt-16'}
        role="main"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
