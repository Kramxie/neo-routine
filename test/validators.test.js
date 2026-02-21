import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, isValidPassword, validateRegister } from '../lib/validators.js';

test('isValidEmail accepts valid emails and rejects invalid', () => {
  assert.equal(isValidEmail('user@example.com'), true);
  assert.equal(isValidEmail('bad-email'), false);
  assert.equal(isValidEmail('another.user@domain.co'), true);
});

test('isValidPassword enforces minimum length', () => {
  assert.equal(isValidPassword('123456'), true);
  assert.equal(isValidPassword('123'), false);
});

test('validateRegister returns errors for missing fields', () => {
  const { isValid, errors } = validateRegister({ name: '', email: '', password: '' });
  assert.equal(isValid, false);
  assert.ok(errors.name);
  assert.ok(errors.email);
  assert.ok(errors.password);
});
