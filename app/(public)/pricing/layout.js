const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neo-routine.vercel.app';

export const metadata = {
  title: 'Pricing — Free, Premium & Premium Plus',
  description:
    'Simple, transparent pricing for NeoRoutine. Start free, upgrade when you\'re ready. Cancel anytime.',
  alternates: { canonical: `${APP_URL}/pricing` },
  openGraph: {
    title: 'Pricing — Free, Premium & Premium Plus | NeoRoutine',
    description:
      'Simple, transparent pricing for NeoRoutine. Start free, upgrade when you\'re ready. Cancel anytime.',
    url: `${APP_URL}/pricing`,
  },
};

export default function PricingLayout({ children }) {
  return children;
}
