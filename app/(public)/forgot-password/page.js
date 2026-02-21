'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  var toast = useToast();
  var [email, setEmail] = useState('');
  var [isLoading, setIsLoading] = useState(false);
  var [sent, setSent] = useState(false);
  var [debugUrl, setDebugUrl] = useState('');

  var handleSubmit = async function (e) {
    e.preventDefault();
    setIsLoading(true);
    setDebugUrl('');

    try {
      var response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });

      var result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Failed to send reset email');
        return;
      }

      // In development, API may return resetUrl for testing
      if (result.debug && result.resetUrl) {
        setDebugUrl(result.resetUrl);
        toast.warning('Email may not have been delivered. Check console or use the link below.');
      } else {
        toast.success('Reset link sent! Check your email.');
      }

      setSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-water py-12 px-4">
      <div className="card-soft max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden shadow-neo">
              <Image
                src="/neoLogo.jfif"
                alt="NeoRoutine Logo"
                width={64}
                height={64}
                className="object-cover"
                priority
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-calm-800">Reset your password</h1>
          <p className="text-calm-600 mt-2">
            {sent
              ? 'Check your email for a reset link'
              : 'Enter your email and we will send you a reset link'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={function (e) { setEmail(e.target.value); }}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-calm-600 mb-4">
              If an account exists with that email, you will receive a password reset link shortly.
            </p>

            {/* Development mode: show reset URL if email delivery failed */}
            {debugUrl && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-left">
                <p className="text-xs font-medium text-amber-700 mb-1">Development Mode - Direct Link:</p>
                <a 
                  href={debugUrl} 
                  className="text-xs text-neo-600 hover:text-neo-700 break-all underline"
                >
                  {debugUrl}
                </a>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={function () { setSent(false); setEmail(''); setDebugUrl(''); }}
            >
              Send another link
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-calm-600 mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-neo-500 hover:text-neo-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
