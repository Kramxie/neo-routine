'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * Resend Verification Page
 * Allows users to request a new verification code
 */
export default function ResendVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to verify-email page with email
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to send verification code.');
      }
    } catch (_error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-calm-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-soft p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-calm-800">Resend Verification Code</h1>
            <p className="text-calm-600 mt-2">
              Enter your email to receive a new 6-digit code
            </p>
          </div>

          {/* Error message */}
          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-center">{message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-calm-600">
              Already verified?{' '}
              <Link href="/login" className="text-neo-500 hover:text-neo-600 font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-calm-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-neo-500 hover:text-neo-600 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
