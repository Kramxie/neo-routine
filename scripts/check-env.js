#!/usr/bin/env node
// Simple environment check script for local/dev readiness
const required = [
  'MONGO_URI',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL'
];

const missing = required.filter((k) => !process.env[k]);

if (missing.length === 0) {
  console.log('[OK] All required environment variables are set.');
  process.exit(0);
} else {
  console.error('[ERROR] Missing required environment variables: ' + missing.join(', '));
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(2);
}
