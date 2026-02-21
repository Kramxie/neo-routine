'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-water py-12 px-4">
      <div className="card-soft max-w-md w-full text-center">
        <div className="animate-spin w-8 h-8 mx-auto border-4 border-neo-200 border-t-neo-500 rounded-full"></div>
        <p className="text-calm-600 mt-4">Loading...</p>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  var router = useRouter();
  var searchParams = useSearchParams();
  var toast = useToast();
  var token = searchParams.get('token');

  var [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  var [errors, setErrors] = useState({});
  var [isLoading, setIsLoading] = useState(false);
  var [success, setSuccess] = useState(false);
  var [tokenValid, setTokenValid] = useState(true);

  useEffect(function () {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  var handleChange = function (e) {
    var name = e.target.name;
    var value = e.target.value;
    setFormData(function (prev) {
      var next = Object.assign({}, prev);
      next[name] = value;
      return next;
    });
    if (errors[name]) {
      setErrors(function (prev) {
        var next = Object.assign({}, prev);
        next[name] = '';
        return next;
      });
    }
  };

  var handleSubmit = async function (e) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    var clientErrors = {};
    if (!formData.password) {
      clientErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      clientErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      clientErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsLoading(false);
      return;
    }

    try {
      var response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          password: formData.password,
        }),
      });

      var result = await response.json();

      if (!response.ok) {
        if (result.message === 'Invalid or expired token') {
          setTokenValid(false);
        }
        toast.error(result.message || 'Failed to reset password');
        return;
      }

      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(function () {
        router.push('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-water py-12 px-4">
        <div className="card-soft max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-calm-800 mb-2">Invalid or Expired Link</h1>
          <p className="text-calm-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button href="/forgot-password" variant="primary">
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-water py-12 px-4">
        <div className="card-soft max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-calm-800 mb-2">Password Reset!</h1>
          <p className="text-calm-600 mb-6">
            Your password has been reset successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-calm-800">Set new password</h1>
          <p className="text-calm-600 mt-2">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            name="password"
            type="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />

          <p className="text-xs text-calm-500">
            Password must be at least 6 characters
          </p>

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
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
