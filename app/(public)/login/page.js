'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  var router = useRouter();
  var toast = useToast();
  var [formData, setFormData] = useState({ email: '', password: '' });
  var [errors, setErrors] = useState({});
  var [isLoading, setIsLoading] = useState(false);
  var [demoLoading, setDemoLoading] = useState(false);

  var handleDemoLogin = async function () {
    setDemoLoading(true);
    try {
      var response = await fetch('/api/auth/demo', { method: 'POST' });
      if (response.ok) {
        toast.success('Welcome to NeoRoutine!');
        setTimeout(function () {
          router.push('/dashboard');
        }, 500);
      } else {
        toast.error('Demo login failed. Please try again.');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

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

    try {
      var response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      var result = await response.json();

      if (!response.ok) {
        if (result.data && result.data.errors) {
          if (result.data.errors.general) {
            toast.error(result.data.errors.general);
          } else {
            setErrors(result.data.errors);
            toast.error('Please check your credentials');
          }
        } else {
          toast.error(result.message || 'Login failed');
        }
        return;
      }

      toast.success('Welcome back!');
      setTimeout(function () {
        router.push('/dashboard');
        router.refresh();
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
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
          <h1 className="text-2xl font-bold text-calm-800">Welcome back</h1>
          <p className="text-calm-600 mt-2">Sign in to continue your routine</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
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

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-neo-500 hover:text-neo-600 font-medium">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading || demoLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-calm-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-calm-500">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleDemoLogin}
          disabled={isLoading || demoLoading}
        >
          {demoLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-neo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading Demo...
            </span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Try Demo (No Account Needed)
            </>
          )}
        </Button>

        <p className="text-center text-xs text-calm-500 mt-2">
          Explore all features with a demo account
        </p>

        <p className="text-center text-sm text-calm-600 mt-6">
          {"Don't have an account? "}
          <Link href="/register" className="text-neo-500 hover:text-neo-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
