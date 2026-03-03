/**
 * Validators Edge Cases & sanitizeString Tests
 * Covers edge cases not tested in auth.api.test.js or validators.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidPassword,
  validateRoutine,
  validateCheckIn,
  sanitizeString,
} from '../lib/validators.js';

describe('isValidEmail edge cases', () => {
  it('should reject null', () => {
    assert.equal(isValidEmail(null), false);
  });

  it('should reject undefined', () => {
    assert.equal(isValidEmail(undefined), false);
  });

  it('should reject empty string', () => {
    assert.equal(isValidEmail(''), false);
  });

  it('should reject email without domain', () => {
    assert.equal(isValidEmail('user@'), false);
  });

  it('should reject email without @', () => {
    assert.equal(isValidEmail('userexample.com'), false);
  });

  it('should reject email with spaces', () => {
    assert.equal(isValidEmail('user @example.com'), false);
  });

  it('should accept email with dots in username', () => {
    assert.equal(isValidEmail('first.last@example.com'), true);
  });

  it('should accept email with subdomain', () => {
    assert.equal(isValidEmail('user@sub.example.com'), true);
  });

  it('should accept two-letter TLD', () => {
    assert.equal(isValidEmail('user@example.uk'), true);
  });
});

describe('isValidPassword edge cases', () => {
  it('should reject null', () => {
    assert.ok(!isValidPassword(null));
  });

  it('should reject undefined', () => {
    assert.ok(!isValidPassword(undefined));
  });

  it('should reject empty string', () => {
    assert.ok(!isValidPassword(''));
  });

  it('should reject 5-char password', () => {
    assert.ok(!isValidPassword('12345'));
  });

  it('should accept exactly 6-char password', () => {
    assert.equal(isValidPassword('123456'), true);
  });

  it('should accept long password', () => {
    assert.equal(isValidPassword('a'.repeat(100)), true);
  });
});

describe('validateRoutine edge cases', () => {
  it('should reject title exceeding 100 characters', () => {
    const result = validateRoutine({ title: 'x'.repeat(101), tasks: [] });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.title);
  });

  it('should reject description exceeding 500 characters', () => {
    const result = validateRoutine({
      title: 'Valid Title',
      description: 'x'.repeat(501),
      tasks: [],
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.description);
  });

  it('should reject more than 20 tasks', () => {
    const tasks = Array.from({ length: 21 }, (_, i) => ({ label: `Task ${i}` }));
    const result = validateRoutine({ title: 'Valid', tasks });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.tasks);
  });

  it('should reject non-array tasks', () => {
    const result = validateRoutine({ title: 'Valid', tasks: 'not an array' });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.tasks);
  });

  it('should reject task with label exceeding 100 chars', () => {
    const result = validateRoutine({
      title: 'Valid',
      tasks: [{ label: 'x'.repeat(101) }],
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.tasks);
  });

  it('should accept valid routine with max 20 tasks', () => {
    const tasks = Array.from({ length: 20 }, (_, i) => ({ label: `Task ${i}` }));
    const result = validateRoutine({ title: 'Valid', tasks });
    assert.equal(result.isValid, true);
  });

  it('should accept routine without tasks property', () => {
    const result = validateRoutine({ title: 'Valid Title' });
    assert.equal(result.isValid, true);
  });
});

describe('validateCheckIn edge cases', () => {
  it('should reject negative taskIndex', () => {
    const result = validateCheckIn({
      routineId: 'routine123',
      taskIndex: -1,
      dateISO: '2024-01-15',
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.taskIndex);
  });

  it('should reject non-number taskIndex', () => {
    const result = validateCheckIn({
      routineId: 'routine123',
      taskIndex: 'abc',
      dateISO: '2024-01-15',
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.taskIndex);
  });

  it('should reject invalid date format', () => {
    const result = validateCheckIn({
      routineId: 'routine123',
      taskIndex: 0,
      dateISO: '01-15-2024',
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.dateISO);
  });

  it('should reject date with time', () => {
    const result = validateCheckIn({
      routineId: 'routine123',
      taskIndex: 0,
      dateISO: '2024-01-15T10:30:00',
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.dateISO);
  });

  it('should accept taskIndex of 0', () => {
    const result = validateCheckIn({
      routineId: 'routine123',
      taskIndex: 0,
      dateISO: '2024-01-15',
    });
    assert.equal(result.isValid, true);
  });

  it('should reject all fields missing at once', () => {
    const result = validateCheckIn({});
    assert.equal(result.isValid, false);
    assert.ok(result.errors.routineId);
    assert.ok(result.errors.taskIndex);
    assert.ok(result.errors.dateISO);
  });
});

describe('sanitizeString', () => {
  it('should trim whitespace', () => {
    assert.equal(sanitizeString('  hello  '), 'hello');
  });

  it('should limit to default max length of 500', () => {
    const long = 'a'.repeat(600);
    const result = sanitizeString(long);
    assert.equal(result.length, 500);
  });

  it('should limit to custom max length', () => {
    const result = sanitizeString('hello world', 5);
    assert.equal(result, 'hello');
  });

  it('should return empty string for null', () => {
    assert.equal(sanitizeString(null), '');
  });

  it('should return empty string for undefined', () => {
    assert.equal(sanitizeString(undefined), '');
  });

  it('should return empty string for non-string', () => {
    assert.equal(sanitizeString(123), '');
  });

  it('should return empty string for empty string', () => {
    assert.equal(sanitizeString(''), '');
  });

  it('should preserve normal strings', () => {
    assert.equal(sanitizeString('hello'), 'hello');
  });

  it('should handle string with only whitespace', () => {
    assert.equal(sanitizeString('   '), '');
  });
});
