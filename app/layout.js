import '@/styles/globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

export const metadata = {
  title: 'Neo Routine - Redesigning habits. One drop at a time.',
  description: 'Build lasting habits without streak pressure. Transform your goals into daily drops with calm progress visualization and adaptive reminders.',
  keywords: ['habits', 'routine', 'productivity', 'goals', 'wellness'],
};

/**
 * Root Layout
 * Wraps all pages with conditional navbar/footer
 * App routes (dashboard, coach) have their own sidebar layout
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
