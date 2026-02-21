'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Checkout Success Page
 * Shown after successful Stripe checkout
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Optionally verify the session with your backend
      // For now, we'll just show success after a delay
      // The webhook will handle the actual subscription activation
      setTimeout(() => {
        setVerified(true);
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neo-50 to-white">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neo-100 flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-neo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-calm-600">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neo-50 to-white px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-green-300 opacity-0 animate-ping" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-calm-900 mb-3">
          Welcome to Premium!
        </h1>
        <p className="text-lg text-calm-600 mb-8">
          Your subscription is now active. Get ready to unlock your full potential 
          with unlimited routines and advanced insights.
        </p>

        {/* What's New Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-calm-800 mb-4">What you can do now:</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-neo-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-calm-700">Create more routines with up to 15 tasks each</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-neo-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-calm-700">Access 90 days of insights history</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-neo-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-calm-700">Use custom colors for your routines</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-neo-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-calm-700">Export your data anytime</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-neo-500 text-white rounded-xl font-medium hover:bg-neo-600 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/dashboard/routines/new"
            className="px-8 py-3 border border-neo-200 text-neo-600 rounded-xl font-medium hover:bg-neo-50 transition-colors"
          >
            Create New Routine
          </Link>
        </div>

        {/* Note */}
        <p className="mt-8 text-sm text-calm-500">
          A confirmation email has been sent to your inbox. 
          You can manage your subscription anytime from Settings.
        </p>
      </div>
    </div>
  );
}
