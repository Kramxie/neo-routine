import test from 'node:test';
import assert from 'node:assert/strict';
import { sendVerificationEmail, getVerificationCodeEmailTemplate } from '../lib/email.js';

// Test that template contains name and code
test('verification email template contains name and code', () => {
  const html = getVerificationCodeEmailTemplate('Alice', '123456');
  assert.ok(html.includes('Alice'));
  assert.ok(html.includes('123456'));
});

// Test fallback behavior when no env configured (should not throw)
test('sendVerificationEmail falls back to console logging when SMTP not configured', async () => {
  // Ensure env vars are not set
  const originalUser = process.env.GMAIL_USER;
  const originalPass = process.env.GMAIL_APP_PASSWORD;
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;

  const result = await sendVerificationEmail('test@example.com', 'Bob', '654321');
  assert.equal(result.success, true);
  assert.ok(result.message.includes('Email logged'));

  // restore
  if (originalUser) process.env.GMAIL_USER = originalUser;
  if (originalPass) process.env.GMAIL_APP_PASSWORD = originalPass;
});
