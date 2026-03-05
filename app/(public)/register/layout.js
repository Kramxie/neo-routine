const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neo-routine.vercel.app';

export const metadata = {
  title: 'Create Your Free Account',
  description:
    'Join NeoRoutine for free. No credit card required. Start building lasting habits with calm, pressure-free tracking.',
  alternates: { canonical: `${APP_URL}/register` },
  openGraph: {
    title: 'Create Your Free Account | NeoRoutine',
    description:
      'Join NeoRoutine for free. No credit card required. Start building lasting habits with calm, pressure-free tracking.',
    url: `${APP_URL}/register`,
    images: [{ url: `${APP_URL}/opengraph-image`, width: 1200, height: 630, alt: 'NeoRoutine' }],
  },
};

export default function RegisterLayout({ children }) {
  return children;
}
