'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Plan feature lists
const planFeatures = {
  free: [
    '3 active routines',
    '5 tasks per routine',
    'Basic check-in tracking',
    'Weekly streaks',
    'Core analytics',
  ],
  premium: [
    '10 active routines',
    '15 tasks per routine',
    'Advanced reminders',
    'Pattern insights',
    'All analytics features',
    'Priority support',
    'Custom themes (coming soon)',
  ],
  premium_plus: [
    'Unlimited routines',
    'Unlimited tasks',
    'AI-powered insights',
    'Advanced pattern detection',
    'Export data & reports',
    'White-glove support',
    'Early access to new features',
    'Custom integrations (coming soon)',
  ],
};

// Water-themed icons for different plans
function DropIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C12 2 6 8.5 6 13.5C6 17.09 8.69 20 12 20C15.31 20 18 17.09 18 13.5C18 8.5 12 2 12 2Z" />
    </svg>
  );
}

function WaveIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 16.99C15.5 16.99 14.12 17.82 13.5 19.11C12.88 17.82 11.5 16.99 10 16.99C8.5 16.99 7.12 17.82 6.5 19.11C5.88 17.82 4.5 16.99 3 16.99V19.99C4.5 19.99 5.88 19.16 6.5 17.87C7.12 19.16 8.5 19.99 10 19.99C11.5 19.99 12.88 19.16 13.5 17.87C14.12 19.16 15.5 19.99 17 19.99C18.5 19.99 19.88 19.16 20.5 17.87C21.12 19.16 22.5 19.99 24 19.99V16.99C22.5 16.99 21.12 17.82 20.5 19.11C19.88 17.82 18.5 16.99 17 16.99ZM17 11C15.5 11 14.12 11.83 13.5 13.12C12.88 11.83 11.5 11 10 11C8.5 11 7.12 11.83 6.5 13.12C5.88 11.83 4.5 11 3 11V14C4.5 14 5.88 13.17 6.5 11.88C7.12 13.17 8.5 14 10 14C11.5 14 12.88 13.17 13.5 11.88C14.12 13.17 15.5 14 17 14C18.5 14 19.88 13.17 20.5 11.88C21.12 13.17 22.5 14 24 14V11C22.5 11 21.12 11.83 20.5 13.12C19.88 11.83 18.5 11 17 11ZM17 5.01C15.5 5.01 14.12 5.84 13.5 7.13C12.88 5.84 11.5 5.01 10 5.01C8.5 5.01 7.12 5.84 6.5 7.13C5.88 5.84 4.5 5.01 3 5.01V8.01C4.5 8.01 5.88 7.18 6.5 5.89C7.12 7.18 8.5 8.01 10 8.01C11.5 8.01 12.88 7.18 13.5 5.89C14.12 7.18 15.5 8.01 17 8.01C18.5 8.01 19.88 7.18 20.5 5.89C21.12 7.18 22.5 8.01 24 8.01V5.01C22.5 5.01 21.12 5.84 20.5 7.13C19.88 5.84 18.5 5.01 17 5.01Z" />
    </svg>
  );
}

function OceanIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTier, setCurrentTier] = useState('free');
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user was redirected back from Stripe (canceled)
    if (searchParams.get('canceled') === 'true') {
      setError('Checkout was canceled. You can try again when ready.');
    }
    fetchSubscriptionStatus();
  }, [searchParams]);

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch('/api/subscription');
      const data = await res.json();

      if (res.ok) {
        setCurrentTier(data.currentTier);
        setSubscription(data.subscription);
        setPlans(data.plans || {});
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier) => {
    if (tier === currentTier || tier === 'free') return;

    setUpgrading(true);
    setError('');
    setSuccess('');

    // Construct the planId based on tier and billing cycle
    const planId = `${tier}_${billingCycle === 'yearly' ? 'yearly' : 'monthly'}`;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError(err.message);
      setUpgrading(false);
    }
    // Note: Don't set upgrading to false here since we're redirecting
  };

  const handleCancel = async () => {
    // Open Stripe Customer Portal for subscription management
    setUpgrading(true);
    setError('');

    try {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open subscription management');
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    setUpgrading(true);
    setError('');

    try {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open subscription management');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
      setUpgrading(false);
    }
  };

  const getPrice = (plan) => {
    if (plan === 'free') return 'Free';
    const planData = plans[plan];
    if (!planData) return '-';
    const price = billingCycle === 'yearly' ? planData.yearly : planData.monthly;
    const period = billingCycle === 'yearly' ? '/year' : '/month';
    return `$${price}${period}`;
  };

  const getSavings = (plan) => {
    if (plan === 'free' || billingCycle !== 'yearly') return null;
    const planData = plans[plan];
    if (!planData) return null;
    const monthlyCost = planData.monthly * 12;
    const yearlyCost = planData.yearly;
    const savings = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    return savings > 0 ? `Save ${savings}%` : null;
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'free':
        return <DropIcon className="w-8 h-8" />;
      case 'premium':
        return <WaveIcon className="w-8 h-8" />;
      case 'premium_plus':
        return <OceanIcon className="w-8 h-8" />;
      default:
        return <DropIcon className="w-8 h-8" />;
    }
  };

  const getPlanTheme = (plan) => {
    switch (plan) {
      case 'free':
        return {
          bg: 'bg-calm-50',
          border: 'border-calm-200',
          accent: 'text-calm-600',
          button: 'bg-calm-100 text-calm-700 hover:bg-calm-200',
          ring: 'ring-calm-500',
        };
      case 'premium':
        return {
          bg: 'bg-neo-50',
          border: 'border-neo-200',
          accent: 'text-neo-600',
          button: 'bg-neo-500 text-white hover:bg-neo-600',
          ring: 'ring-neo-500',
          highlight: true,
        };
      case 'premium_plus':
        return {
          bg: 'bg-gradient-to-br from-neo-600 to-neo-800',
          border: 'border-neo-500',
          accent: 'text-white',
          button: 'bg-white text-neo-700 hover:bg-neo-50',
          ring: 'ring-neo-400',
          dark: true,
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-calm-200',
          accent: 'text-calm-600',
          button: 'bg-calm-100 text-calm-700',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-neo-200 rounded-full" />
          <div className="h-4 w-32 bg-neo-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neo-50/50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-neo-600 hover:text-neo-700 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <h1 className="text-4xl font-bold text-calm-900 mb-3">
            Unlock Your Full Potential
          </h1>
          <p className="text-lg text-calm-600 max-w-2xl mx-auto">
            Choose the plan that fits your journey. Every drop counts towards building 
            lasting habits.
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentTier !== 'free' && (
          <div className="text-center mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-neo-100 text-neo-700 text-sm font-medium">
              <CheckIcon className="w-4 h-4 mr-2" />
              Current plan: {currentTier.replace('_', ' ').charAt(0).toUpperCase() + currentTier.replace('_', ' ').slice(1)}
            </span>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-calm-100 p-1 rounded-full flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-calm-900 shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-calm-900 shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center">
            {success}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {['free', 'premium', 'premium_plus'].map((plan) => {
            const theme = getPlanTheme(plan);
            const isCurrentPlan = currentTier === plan;
            const isDowngrade = 
              (plan === 'free' && currentTier !== 'free') ||
              (plan === 'premium' && currentTier === 'premium_plus');
            const savings = getSavings(plan);

            return (
              <div
                key={plan}
                className={`relative rounded-2xl border-2 ${theme.bg} ${theme.border} ${
                  theme.highlight ? 'ring-2 ring-neo-500 scale-105 shadow-xl' : 'shadow-lg'
                } transition-all hover:shadow-xl`}
              >
                {/* Popular Badge */}
                {theme.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-neo-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Savings Badge */}
                {savings && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {savings}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Icon & Name */}
                  <div className={`flex items-center gap-3 mb-4 ${theme.dark ? 'text-white' : ''}`}>
                    <div className={`${theme.dark ? 'text-white/80' : theme.accent}`}>
                      {getPlanIcon(plan)}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.dark ? 'text-white' : 'text-calm-900'}`}>
                        {plan === 'free' && 'Free'}
                        {plan === 'premium' && 'Premium'}
                        {plan === 'premium_plus' && 'Premium+'}
                      </h3>
                      <p className={`text-sm ${theme.dark ? 'text-white/70' : 'text-calm-500'}`}>
                        {plan === 'free' && 'Get started'}
                        {plan === 'premium' && 'For habit builders'}
                        {plan === 'premium_plus' && 'For power users'}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${theme.dark ? 'text-white' : 'text-calm-900'}`}>
                      {getPrice(plan).split('/')[0]}
                    </span>
                    {plan !== 'free' && (
                      <span className={`text-sm ${theme.dark ? 'text-white/70' : 'text-calm-500'}`}>
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {planFeatures[plan].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckIcon
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            theme.dark ? 'text-white/80' : 'text-neo-500'
                          }`}
                        />
                        <span className={`text-sm ${theme.dark ? 'text-white/90' : 'text-calm-700'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrentPlan || upgrading || isDowngrade}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      isCurrentPlan
                        ? 'bg-calm-200 text-calm-600 cursor-default'
                        : isDowngrade
                        ? 'bg-calm-100 text-calm-400 cursor-not-allowed'
                        : theme.button
                    } ${upgrading ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {isCurrentPlan
                      ? 'Current Plan'
                      : isDowngrade
                      ? 'Contact Support'
                      : upgrading
                      ? 'Processing...'
                      : plan === 'free'
                      ? 'Get Started'
                      : 'Upgrade Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manage Subscription */}
        {subscription?.status === 'active' && currentTier !== 'free' && (
          <div className="mt-10 text-center">
            <p className="text-calm-500 text-sm mb-3">
              Manage your subscription, update payment method, or cancel anytime.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={upgrading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-calm-100 text-calm-700 rounded-lg hover:bg-calm-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Subscription
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-calm-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-calm-100">
              <h3 className="font-semibold text-calm-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-calm-600 text-sm">
                Yes! You can upgrade your plan at any time. When upgrading, you'll be 
                credited for the remaining time on your current plan.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-calm-100">
              <h3 className="font-semibold text-calm-900 mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-calm-600 text-sm">
                Your data is always safe. If you exceed the limits of a lower tier, 
                extra routines will be archived but never deleted.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-calm-100">
              <h3 className="font-semibold text-calm-900 mb-2">
                Is there a free trial for premium plans?
              </h3>
              <p className="text-calm-600 text-sm">
                New users get a 7-day trial of Premium features. Start free and 
                experience the full power of Neo Routine!
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-calm-100">
              <h3 className="font-semibold text-calm-900 mb-2">
                How do refunds work?
              </h3>
              <p className="text-calm-600 text-sm">
                We offer a 30-day money-back guarantee. If you're not satisfied, 
                contact support for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-calm-400 text-sm mb-4">Trusted by habit builders worldwide</p>
          <div className="flex justify-center items-center gap-8 text-calm-300">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
              </svg>
              <span className="text-sm">Privacy First</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">30-Day Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
