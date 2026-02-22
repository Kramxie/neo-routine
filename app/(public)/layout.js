/**
 * Public Routes Layout
 * Server component — safe to export `metadata` here.
 * Provides a title template for all public pages and injects
 * JSON-LD structured data for search engine understanding.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neo-routine.vercel.app';

export const metadata = {
  /* Override title template for public section (shows plain name on root page) */
  title: {
    default: 'NeoRoutine — Redesigning habits. One drop at a time.',
    template: '%s | NeoRoutine',
  },
  alternates: {
    canonical: APP_URL,
  },
};

/* ------------------------------------------------------------------
 * JSON-LD structured data
 * Injected once on all public pages. Two schemas:
 *   1. WebSite  — enables Google's Sitelink search box
 *   2. SoftwareApplication — marks NeoRoutine as a ranked app product
 * ------------------------------------------------------------------ */
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NeoRoutine',
    alternateName: 'Neo Routine',
    url: APP_URL,
    description:
      'Build lasting habits without streak pressure. Transform your goals into daily drops with calm progress visualization and adaptive reminders.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_URL}/dashboard/routines?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NeoRoutine',
    url: APP_URL,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web, iOS, Android',
    description:
      'Adaptive habit-tracking app that uses a calm, water-themed progress system instead of punishing streak mechanics.',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Free Plan',
      },
      {
        '@type': 'Offer',
        price: '9.99',
        priceCurrency: 'USD',
        name: 'Premium Plan',
        billingIncrement: 'P1M',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '10000',
      bestRating: '5',
      worstRating: '1',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NeoRoutine',
    url: APP_URL,
    logo: `${APP_URL}/neoLogo.jfif`,
    sameAs: [],
  },
];

export default function PublicLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint: JSON-LD must be rendered as raw HTML
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
