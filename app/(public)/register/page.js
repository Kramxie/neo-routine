'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  var router = useRouter();
  var toast = useToast();
  var [formData, setFormData] = useState({ name: '', email: '', password: '' });
  var [errors, setErrors] = useState({});
  var [isLoading, setIsLoading] = useState(false);

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

    var clientErrors = {};
    var emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.name.trim()) clientErrors.name = 'Name is required';
    if (!formData.email.trim()) clientErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) clientErrors.email = 'Please enter a valid email address';
    if (!formData.password) clientErrors.password = 'Password is required';
    else if (formData.password.length < 6) clientErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toast.error('Please fix the errors below');
      setIsLoading(false);
      return;
    }

    try {
      var response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      var result = await response.json();

      if (!response.ok) {
        if (result.data && result.data.errors) {
          setErrors(result.data.errors);
          toast.error('Please fix the errors below');
        } else {
          toast.error(result.message || 'Registration failed');
        }
        return;
      }

      toast.success('Account created! Please verify your email.');
      setTimeout(function () {
        router.push('/verify-email?email=' + encodeURIComponent(formData.email));
      }, 500);
    } catch (err) {
      console.error('Registration error:', err);
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
          <h1 className="text-2xl font-bold text-calm-800">Start your flow</h1>
          <p className="text-calm-600 mt-2">Create your Neo Routine account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

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
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-calm-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-neo-500 hover:text-neo-600 font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-calm-500 mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
