'use client';

/**
 * Skip Navigation Component
 * Provides a skip link for keyboard users to bypass navigation
 * Follows WCAG 2.1 accessibility guidelines
 */
export default function SkipNavigation() {
  const handleSkip = (e) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2 
        focus:bg-neo-500 focus:text-white 
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-neo-300
        transition-all
      "
    >
      Skip to main content
    </a>
  );
}
