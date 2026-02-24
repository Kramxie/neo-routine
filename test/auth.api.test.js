/**
 * Auth API Route Tests
 * Tests for authentication endpoints
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';

describe('Auth API Routes', () => {
  describe('Login Validation', () => {
    let validateLogin;

    before(async () => {
      const validators = await import('../lib/validators.js');
      validateLogin = validators.validateLogin;
    });

    it('should reject empty email', () => {
      const result = validateLogin({ email: '', password: 'password123' });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.email, 'Should have email error');
    });

    it('should reject invalid email format', () => {
      const result = validateLogin({ email: 'invalid-email', password: 'password123' });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.email, 'Should have email error');
    });

    it('should reject empty password', () => {
      const result = validateLogin({ email: 'test@example.com', password: '' });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.password, 'Should have password error');
    });

    it('should accept valid credentials', () => {
      const result = validateLogin({ email: 'test@example.com', password: 'password123' });
      assert.strictEqual(result.isValid, true);
      assert.deepStrictEqual(result.errors, {});
    });
  });

  describe('Registration Validation', () => {
    let validateRegister;

    before(async () => {
      const validators = await import('../lib/validators.js');
      validateRegister = validators.validateRegister;
    });

    it('should reject empty name', () => {
      const result = validateRegister({
        name: '',
        email: 'test@example.com',
        password: 'password123',
      });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.name, 'Should have name error');
    });

    it('should reject name exceeding 50 characters', () => {
      const result = validateRegister({
        name: 'a'.repeat(51),
        email: 'test@example.com',
        password: 'password123',
      });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.name, 'Should have name error');
    });

    it('should reject short password', () => {
      const result = validateRegister({
        name: 'Test User',
        email: 'test@example.com',
        password: '12345',
      });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.password, 'Should have password error');
    });

    it('should accept valid registration data', () => {
      const result = validateRegister({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      assert.strictEqual(result.isValid, true);
      assert.deepStrictEqual(result.errors, {});
    });
  });
});

describe('Routine Validation', () => {
  let validateRoutine;

  before(async () => {
    const validators = await import('../lib/validators.js');
    validateRoutine = validators.validateRoutine;
  });

  it('should reject empty title', () => {
    const result = validateRoutine({ title: '', tasks: [] });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.title, 'Should have title error');
  });

  it('should reject tasks with empty labels', () => {
    const result = validateRoutine({ 
      title: 'Morning Routine', 
      tasks: [{ label: '' }] 
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.tasks, 'Should have tasks error');
  });

  it('should accept valid routine with proper task labels', () => {
    const result = validateRoutine({
      title: 'Morning Routine',
      tasks: [{ label: 'Wake up' }, { label: 'Exercise' }],
    });
    assert.strictEqual(result.isValid, true);
  });

  it('should accept routine with empty tasks array (tasks are optional)', () => {
    const result = validateRoutine({ title: 'Morning Routine', tasks: [] });
    // Empty tasks array is valid (no validation errors for empty array)
    assert.strictEqual(result.isValid, true);
  });
});

describe('CheckIn Validation', () => {
  let validateCheckIn;

  before(async () => {
    const validators = await import('../lib/validators.js');
    validateCheckIn = validators.validateCheckIn;
  });

  it('should reject missing routineId', () => {
    const result = validateCheckIn({ taskIndex: 0, dateISO: '2024-01-15' });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.routineId, 'Should have routineId error');
  });

  it('should reject missing taskIndex', () => {
    const result = validateCheckIn({ routineId: 'routine123', dateISO: '2024-01-15' });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.taskIndex, 'Should have taskIndex error');
  });

  it('should reject missing dateISO', () => {
    const result = validateCheckIn({ routineId: 'routine123', taskIndex: 0 });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.dateISO, 'Should have dateISO error');
  });

  it('should accept valid check-in data', () => {
    const result = validateCheckIn({
      routineId: 'routine123',
      taskIndex: 0,
      dateISO: '2024-01-15',
    });
    assert.strictEqual(result.isValid, true);
  });
});
