'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

/**
 * Pricing Page
 * Display subscription plans
 */
export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Track up to 3 routines',
        'Daily check-ins',
        'Basic insights',
        'Mobile responsive',
      ],
      cta: 'Get Started',
      href: '/register',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For serious habit builders',
      features: [
        'Unlimited routines',
        'Advanced insights & analytics',
        'AI Coach access',
        'Priority support',
        'Export your data',
        'Custom themes',
      ],
      cta: 'Start Free Trial',
      href: '/register',
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-calm-50">
      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-calm-800 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-calm-600">
            Start free, upgrade when you're ready
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-soft p-8 ${
                plan.highlighted
                  ? 'ring-2 ring-neo-500 relative'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-neo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-calm-800 mb-2">
                  {plan.name}
                </h3>
                <p className="text-calm-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-calm-800">
                    {plan.price}
                  </span>
                  <span className="text-calm-600">/ {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
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
                    <span className="text-calm-700">{feature}</span>
                  </li>
                ))}
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
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-calm-800 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-calm-800 mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-calm-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-calm-800 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-calm-600">
                Yes! Pro plan comes with a 14-day free trial. No credit card required.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-calm-800 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-calm-600">
                We accept all major credit cards, debit cards, and PayPal.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-calm-800 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-calm-600">
                Absolutely! Cancel your subscription anytime with just one click. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
