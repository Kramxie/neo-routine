'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

/**
 * Pricing Page
 * Display subscription plans with real Stripe prices
 */
export default function PricingPage() {
  const [prices, setPrices] = useState(null);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(function() {
    async function fetchPrices() {
      try {
        const response = await fetch('/api/prices');
        if (response.ok) {
          const data = await response.json();
          setPrices(data.prices);
          setFeatures(data.features);
        }
      } catch (err) {
        console.error('Failed to fetch prices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  // Format price display
  const formatPrice = (amount, currency) => {
    if (amount === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  };

  // Build plan cards based on billing cycle
  const getPlans = () => {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'forever',
        description: 'Perfect for getting started',
        features: features?.free?.features || [
          'Up to 3 routines',
          'Up to 5 tasks per routine',
          '7 days of insights',
          'Daily reminders',
        ],
        cta: 'Get Started',
        href: '/register',
        highlighted: false,
      },
    ];

    if (billingCycle === 'monthly') {
      if (prices?.premium_monthly) {
        plans.push({
          id: 'premium_monthly',
          name: 'Premium',
          price: prices.premium_monthly.amount,
          currency: prices.premium_monthly.currency,
          period: 'month',
          description: 'For dedicated habit builders',
          features: features?.premium?.features || [],
          cta: 'Subscribe',
          href: '/register',
          highlighted: true,
        });
      }
      if (prices?.premium_plus_monthly) {
        plans.push({
          id: 'premium_plus_monthly',
          name: 'Premium+',
          price: prices.premium_plus_monthly.amount,
          currency: prices.premium_plus_monthly.currency,
          period: 'month',
          description: 'Ultimate habit mastery',
          features: features?.premium_plus?.features || [],
          cta: 'Subscribe',
          href: '/register',
          highlighted: false,
        });
      }
    } else {
      if (prices?.premium_yearly) {
        plans.push({
          id: 'premium_yearly',
          name: 'Premium',
          price: prices.premium_yearly.amount,
          currency: prices.premium_yearly.currency,
          period: 'year',
          monthlyEquivalent: prices.premium_yearly.monthlyEquivalent,
          savings: prices.premium_yearly.savings,
          description: 'For dedicated habit builders',
          features: features?.premium?.features || [],
          cta: 'Subscribe',
          href: '/register',
          highlighted: true,
        });
      }
      if (prices?.premium_plus_yearly) {
        plans.push({
          id: 'premium_plus_yearly',
          name: 'Premium+',
          price: prices.premium_plus_yearly.amount,
          currency: prices.premium_plus_yearly.currency,
          period: 'year',
          monthlyEquivalent: prices.premium_plus_yearly.monthlyEquivalent,
          savings: prices.premium_plus_yearly.savings,
          description: 'Ultimate habit mastery',
          features: features?.premium_plus?.features || [],
          cta: 'Subscribe',
          href: '/register',
          highlighted: false,
        });
      }
    }

    return plans;
  };

  const plans = getPlans();

  return (
    <div className="min-h-screen bg-calm-50 dark:bg-calm-900">
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-calm-800 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-calm-600 dark:text-calm-300 mb-8">
            Start free, upgrade when you&apos;re ready
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white dark:bg-calm-800 rounded-full p-1 shadow-soft">
            <button
              onClick={function() { setBillingCycle('monthly'); }}
              className={
                'px-6 py-2 rounded-full text-sm font-medium transition-all ' +
                (billingCycle === 'monthly'
                  ? 'bg-neo-500 text-white'
                  : 'text-calm-600 dark:text-calm-300 hover:text-calm-800 dark:hover:text-white')
              }
            >
              Monthly
            </button>
            <button
              onClick={function() { setBillingCycle('yearly'); }}
              className={
                'px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ' +
                (billingCycle === 'yearly'
                  ? 'bg-neo-500 text-white'
                  : 'text-calm-600 dark:text-calm-300 hover:text-calm-800 dark:hover:text-white')
              }
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                Save up to 33%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neo-500"></div>
          </div>
        ) : (
          <div className={'max-w-6xl mx-auto grid gap-8 ' + (plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
            {plans.map(function(plan) {
              return (
                <div
                  key={plan.id}
                  className={
                    'bg-white dark:bg-calm-800 rounded-2xl shadow-soft p-8 ' +
                    (plan.highlighted ? 'ring-2 ring-neo-500 relative' : '')
                  }
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-neo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {plan.savings && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Save {plan.savings}%
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-calm-800 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-calm-600 dark:text-calm-400 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-calm-800 dark:text-white">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-calm-600 dark:text-calm-400">
                        / {plan.period}
                      </span>
                    </div>
                    {plan.monthlyEquivalent && (
                      <p className="text-sm text-calm-500 dark:text-calm-400 mt-1">
                        ({formatPrice(parseFloat(plan.monthlyEquivalent), plan.currency)}/month)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map(function(feature, idx) {
                      return (
                        <li key={idx} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-neo-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-calm-700 dark:text-calm-300">{feature}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <Link href={plan.href}>
                    <Button
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Feature Comparison */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-calm-800 dark:text-white text-center mb-8">
            Compare Plans
          </h2>
          <div className="bg-white dark:bg-calm-800 rounded-2xl shadow-soft overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-calm-200 dark:border-calm-700">
                  <th className="text-left p-4 text-calm-600 dark:text-calm-400 font-medium">Feature</th>
                  <th className="text-center p-4 text-calm-600 dark:text-calm-400 font-medium">Free</th>
                  <th className="text-center p-4 text-calm-600 dark:text-calm-400 font-medium">Premium</th>
                  <th className="text-center p-4 text-calm-600 dark:text-calm-400 font-medium">Premium+</th>
                </tr>
              </thead>
              <tbody className="text-calm-700 dark:text-calm-300">
                <tr className="border-b border-calm-100 dark:border-calm-700">
                  <td className="p-4">Routines</td>
                  <td className="p-4 text-center">3</td>
                  <td className="p-4 text-center">10</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-calm-100 dark:border-calm-700">
                  <td className="p-4">Tasks per routine</td>
                  <td className="p-4 text-center">5</td>
                  <td className="p-4 text-center">15</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-calm-100 dark:border-calm-700">
                  <td className="p-4">Insights history</td>
                  <td className="p-4 text-center">7 days</td>
                  <td className="p-4 text-center">90 days</td>
                  <td className="p-4 text-center">1 year</td>
                </tr>
                <tr className="border-b border-calm-100 dark:border-calm-700">
                  <td className="p-4">Dark mode</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                </tr>
                <tr className="border-b border-calm-100 dark:border-calm-700">
                  <td className="p-4">Custom colors</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                </tr>
                <tr className="border-b border-calm-100 dark:border-calm-700">
                  <td className="p-4">Data export</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                </tr>
                <tr className="border-b border-calm-100 dark:border-calm-700">
                  <td className="p-4">Priority support</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                </tr>
                <tr className="border-b border-calm-100 dark:border-calm-700">
                  <td className="p-4">Coach access</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                </tr>
                <tr>
                  <td className="p-4">API access</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-calm-400">-</td>
                  <td className="p-4 text-center text-neo-500">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-calm-800 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white dark:bg-calm-800 rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-calm-800 dark:text-white mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-calm-600 dark:text-calm-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-white dark:bg-calm-800 rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-calm-800 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-calm-600 dark:text-calm-400">
                We accept all major credit cards and debit cards through our secure payment partner Stripe.
              </p>
            </div>

            <div className="bg-white dark:bg-calm-800 rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-calm-800 dark:text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-calm-600 dark:text-calm-400">
                Absolutely! Cancel your subscription anytime from your settings. You&apos;ll keep access until the end of your billing period.
              </p>
            </div>

            <div className="bg-white dark:bg-calm-800 rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-calm-800 dark:text-white mb-2">
                Is my payment information secure?
              </h3>
              <p className="text-calm-600 dark:text-calm-400">
                Yes! We use Stripe for payment processing. Your card details never touch our servers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
