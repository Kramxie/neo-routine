const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neo-routine.vercel.app';

/**
 * Dynamic robots.txt generation
 * Blocks crawlers from protected/API routes while allowing public pages.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/coach/', '/admin/', '/api/'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
