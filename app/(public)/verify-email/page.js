'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('input'); // input, verifying, success, error
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle, loading, success, error
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  // Verify the code
  const handleVerify = async (codeString) => {
    if (!email) {
      setStatus('error');
      setMessage('Email not found. Please try registering again.');
      return;
    }

    setStatus('verifying');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeString }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        // Redirect to login after 2 seconds
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Invalid verification code.');
        // Reset code on error
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  // Resend verification code
  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setResendStatus('loading');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendStatus('success');
        setCountdown(60); // 60 second cooldown
        setCode(['', '', '', '', '', '']);
        setStatus('input');
        setMessage('');
        inputRefs.current[0]?.focus();
      } else {
        setResendStatus('error');
      }
    } catch {
      setResendStatus('error');
    }

    // Reset resend status after 3 seconds
    setTimeout(() => setResendStatus('idle'), 3000);
  };

  // No email provided
  if (!email) {
    return (
      <div className="min-h-screen bg-calm-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-calm-800 mb-2">Missing Email</h1>
            <p className="text-calm-600 mb-6">Please register first to receive a verification code.</p>
            <Button href="/register" variant="primary" className="w-full">
              Go to Registration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-calm-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-soft p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center">
              {status === 'success' ? (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-neo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-calm-800">
              {status === 'success' ? 'Email Verified!' : 'Verify Your Email'}
            </h1>
            <p className="text-calm-600 mt-2">
              {status === 'success' 
                ? 'Redirecting to login...'
                : <>We sent a 6-digit code to<br /><span className="font-medium text-calm-800">{email}</span></>
              }
            </p>
          </div>

          {/* Success state */}
          {status === 'success' && (
            <div className="text-center">
              <div className="w-full h-1 bg-calm-100 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-green-500 animate-pulse" style={{ width: '100%' }} />
              </div>
              <Button href="/login" variant="primary" className="w-full">
                Go to Login
              </Button>
            </div>
          )}

          {/* Code input state */}
          {status !== 'success' && (
            <>
              {/* Error message */}
              {status === 'error' && message && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-red-700 text-sm">{message}</p>
                </div>
              )}

              {/* Resend success message */}
              {resendStatus === 'success' && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                  <p className="text-green-700 text-sm">New code sent! Check your inbox.</p>
                </div>
              )}

              {/* Code inputs */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={status === 'verifying'}
                    className={`
                      w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold
                      border-2 rounded-xl outline-none transition-all
                      ${status === 'verifying' 
                        ? 'bg-calm-100 border-calm-200 text-calm-400' 
                        : 'bg-white border-calm-200 text-calm-800 focus:border-neo-500 focus:ring-2 focus:ring-neo-100'
                      }
                    `}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Verify button */}
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full mb-4"
                disabled={code.some(d => d === '') || status === 'verifying'}
                onClick={() => handleVerify(code.join(''))}
              >
                {status === 'verifying' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Email'
                )}
              </Button>

              {/* Resend code */}
              <div className="text-center">
                <p className="text-sm text-calm-600">
                  Didn&apos;t receive the code?{' '}
                  {countdown > 0 ? (
                    <span className="text-calm-400">Resend in {countdown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendStatus === 'loading'}
                      className="text-neo-500 hover:text-neo-600 font-medium disabled:opacity-50"
                    >
                      {resendStatus === 'loading' ? 'Sending...' : 'Resend code'}
                    </button>
                  )}
                </p>
              </div>

              {/* Back to register link */}
              <div className="mt-6 pt-6 border-t border-calm-100 text-center">
                <Link href="/register" className="text-sm text-calm-500 hover:text-calm-700">
                  &larr; Back to registration
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Verify Email Page
 * 6-digit code verification after registration
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-calm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neo-100 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-neo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </div>
          <p className="text-calm-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
