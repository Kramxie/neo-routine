import '@/styles/globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import Providers from '@/components/providers/Providers';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neo-routine.vercel.app';

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'NeoRoutine — Redesigning habits. One drop at a time.',
    template: '%s | NeoRoutine',
  },
  description:
    'Build lasting habits without streak pressure. Transform your goals into daily drops with calm progress visualization and adaptive reminders.',
  keywords: [
    'habits',
    'routine',
    'productivity',
    'goals',
    'wellness',
    'habit tracker',
    'daily routine',
    'behavior change',
  ],
  authors: [{ name: 'NeoRoutine', url: APP_URL }],
  creator: 'NeoRoutine',
  publisher: 'NeoRoutine',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NeoRoutine',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'NeoRoutine',
    title: 'NeoRoutine — Redesigning habits. One drop at a time.',
    description:
      'Build lasting habits without streak pressure. Transform your goals into daily drops with calm progress visualization and adaptive reminders.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'NeoRoutine — Redesigning habits. One drop at a time.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeoRoutine — Redesigning habits. One drop at a time.',
    description:
      'Build lasting habits without streak pressure. Transform your goals into daily drops with calm progress visualization and adaptive reminders.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Force dynamic rendering to avoid cookie access errors during static generation
export const dynamic = 'force-dynamic';

/**
 * Root Layout
 * Wraps all pages with conditional navbar/footer
 * Applies user's theme preference server-side to avoid flash
 */
export default async function RootLayout({ children }) {
  let themeClass = '';

  try {
    const authUser = await getCurrentUser();
    if (authUser?.userId) {
      await connectDB();
      const user = await User.findById(authUser.userId).select('preferences.theme');
      const theme = user?.preferences?.theme || 'light';
      if (theme === 'dark') themeClass = 'dark';
    }
  } catch {
    // Silently fallback to light theme
  }

  return (
    <html lang="en" className={themeClass}>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
