import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Neo Routine - Redesigning habits. One drop at a time.',
  description: 'Build lasting habits without streak pressure. Transform your goals into daily drops with calm progress visualization and adaptive reminders.',
  keywords: ['habits', 'routine', 'productivity', 'goals', 'wellness'],
};

/**
 * Root Layout
 * Wraps all pages with common elements (navbar, footer)
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
