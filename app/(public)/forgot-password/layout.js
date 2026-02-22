const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://neo-routine.vercel.app';

export const metadata = {
  title: 'Reset Your Password',
  description: 'Reset your NeoRoutine password. Enter your email to receive a secure reset link.',
  alternates: { canonical: `${APP_URL}/forgot-password` },
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }) {
  return children;
}
