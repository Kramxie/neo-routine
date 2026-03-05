#!/usr/bin/env node
// Environment variable validation for local/dev and deployment readiness

/** Variables the app cannot start without */
const required = [
  'MONGO_URI',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

/** Variables needed for specific features — warn but don't block */
const recommended = [
  { key: 'STRIPE_SECRET_KEY', feature: 'Stripe payments' },
  { key: 'STRIPE_WEBHOOK_SECRET', feature: 'Stripe webhooks' },
  { key: 'GMAIL_USER', feature: 'Email sending' },
  { key: 'GMAIL_APP_PASSWORD', feature: 'Email sending' },
  { key: 'VAPID_PUBLIC_KEY', feature: 'Push notifications' },
  { key: 'VAPID_PRIVATE_KEY', feature: 'Push notifications' },
];

const missing = required.filter((k) => !process.env[k]);
const missingRecommended = recommended.filter((r) => !process.env[r.key]);

if (missingRecommended.length > 0) {
  console.warn(
    '[WARN] Missing optional environment variables (some features will be disabled):'
  );
  for (const { key, feature } of missingRecommended) {
    console.warn(`  - ${key} (${feature})`);
  }
}

if (missing.length === 0) {
  console.log('[OK] All required environment variables are set.');
  process.exit(0);
} else {
  console.error('[ERROR] Missing required environment variables: ' + missing.join(', '));
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(2);
}
