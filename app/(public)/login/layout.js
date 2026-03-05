const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neo-routine.vercel.app';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your NeoRoutine account and continue building your daily habits.',
  alternates: { canonical: `${APP_URL}/login` },
  openGraph: {
    title: 'Sign In | NeoRoutine',
    description: 'Sign in to your NeoRoutine account and continue building your daily habits.',
    url: `${APP_URL}/login`,
    images: [{ url: `${APP_URL}/opengraph-image`, width: 1200, height: 630, alt: 'NeoRoutine' }],
  },
};

export default function LoginLayout({ children }) {
  return children;
}
