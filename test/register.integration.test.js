import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareRegisterData, generateVerificationCode } from '../lib/registerHelper.js';
import { getVerificationCodeEmailTemplate } from '../lib/email.js';

test('prepareRegisterData validates and sanitizes input', () => {
  const raw = { name: ' Alice ', email: ' ALICE@EXAMPLE.COM ', password: 'secret123' };
  const { isValid, errors: _errors, data } = prepareRegisterData(raw);
  assert.equal(isValid, true);
  assert.equal(data.name, 'Alice');
  assert.equal(data.email, 'alice@example.com');
});

test('prepareRegisterData returns errors for invalid input', () => {
  const raw = { name: '', email: 'bad', password: '123' };
  const { isValid, errors } = prepareRegisterData(raw);
  assert.equal(isValid, false);
  assert.ok(errors.name);
  assert.ok(errors.email);
  assert.ok(errors.password);
});

test('generateVerificationCode returns 6-digit code and expiry', () => {
  const { code, expiresAt } = generateVerificationCode();
  assert.equal(typeof code, 'string');
  assert.equal(code.length, 6);
  assert.ok(Number(expiresAt) > Date.now());
});

test('integration: verification email template contains code and name', () => {
  const { code } = generateVerificationCode();
  const html = getVerificationCodeEmailTemplate('Tester', code);
  assert.ok(html.includes('Tester'));
  assert.ok(html.includes(code));
});
