'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout Wrapper Component
 * Conditionally renders Navbar and Footer based on route
 * App routes (dashboard, coach) have their own sidebar layout
 */

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // App routes have their own layout with sidebar
  const isAppRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/coach');

  return (
    <>
      <Navbar />
      <main className={isAppRoute ? '' : 'flex-grow pt-16'}>
        {children}
      </main>
      <Footer />
    </>
  );
}
