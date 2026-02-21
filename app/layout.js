import '@/styles/globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import Providers from '@/components/providers/Providers';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const metadata = {
  title: 'Neo Routine - Redesigning habits. One drop at a time.',
  description: 'Build lasting habits without streak pressure. Transform your goals into daily drops with calm progress visualization and adaptive reminders.',
  keywords: ['habits', 'routine', 'productivity', 'goals', 'wellness'],
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
