const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neo-routine.vercel.app';

/**
 * Dynamic sitemap generation
 * Lists all public-facing pages for search engine indexing.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap() {
  const now = new Date().toISOString();

  const publicRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/login', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/register', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
  ];

  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
