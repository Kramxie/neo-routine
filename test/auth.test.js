/**
 * Auth Helper Unit Tests
 * Tests for generateToken, verifyToken, hasRole, cookieOptions
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

// Set JWT_SECRET before importing auth (module caches env at import time)
process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests';
process.env.SERVER_INSTANCE_ID = 'test-instance';

describe('Auth Helpers', () => {
  let generateToken, verifyToken, hasRole, cookieOptions, COOKIE_NAME;

  before(async () => {
    const auth = await import('../lib/auth.js');
    generateToken = auth.generateToken;
    verifyToken = auth.verifyToken;
    hasRole = auth.hasRole;
    cookieOptions = auth.cookieOptions;
    COOKIE_NAME = auth.COOKIE_NAME;
  });

  describe('generateToken', () => {
    it('should return a valid JWT string', () => {
      const user = { _id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'user' };
      const token = generateToken(user);
      assert.equal(typeof token, 'string');
      // JWT has 3 segments: header.payload.signature
      assert.equal(token.split('.').length, 3);
    });

    it('should include userId, email, and role in payload', () => {
      const user = { _id: '507f1f77bcf86cd799439011', email: 'admin@example.com', role: 'admin' };
      const token = generateToken(user);
      const decoded = verifyToken(token);
      assert.equal(decoded.userId, '507f1f77bcf86cd799439011');
      assert.equal(decoded.email, 'admin@example.com');
      assert.equal(decoded.role, 'admin');
    });

    it('should include server instance ID in payload', () => {
      const user = { _id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'user' };
      const token = generateToken(user);
      const decoded = verifyToken(token);
      assert.equal(decoded.sid, 'test-instance');
    });

    it('should convert _id to string', () => {
      // Simulate Mongoose ObjectId with toString method
      const user = {
        _id: { toString: () => 'abc123' },
        email: 'test@example.com',
        role: 'user',
      };
      const token = generateToken(user);
      const decoded = verifyToken(token);
      assert.equal(decoded.userId, 'abc123');
    });

    it('should set expiration on the token', () => {
      const user = { _id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'user' };
      const token = generateToken(user);
      const decoded = verifyToken(token);
      assert.ok(decoded.exp, 'Token should have exp claim');
      assert.ok(decoded.iat, 'Token should have iat claim');
      assert.ok(decoded.exp > decoded.iat, 'Expiry should be after issued time');
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload for valid token', () => {
      const user = { _id: 'user123', email: 'test@example.com', role: 'user' };
      const token = generateToken(user);
      const decoded = verifyToken(token);
      assert.ok(decoded);
      assert.equal(decoded.userId, 'user123');
    });

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid.token.string');
      assert.equal(result, null);
    });

    it('should return null for empty string', () => {
      const result = verifyToken('');
      assert.equal(result, null);
    });

    it('should return null for tampered token', () => {
      const user = { _id: 'user123', email: 'test@example.com', role: 'user' };
      const token = generateToken(user);
      // Tamper with the payload
      const tampered = token.slice(0, -5) + 'XXXXX';
      const result = verifyToken(tampered);
      assert.equal(result, null);
    });

    it('should return null for token signed with wrong secret', async () => {
      const jwt = await import('jsonwebtoken');
      const wrongToken = jwt.default.sign(
        { userId: 'user123' },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );
      const result = verifyToken(wrongToken);
      assert.equal(result, null);
    });

    it('should return null for expired token', async () => {
      const jwt = await import('jsonwebtoken');
      const expiredToken = jwt.default.sign(
        { userId: 'user123', sid: 'test-instance' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' } // Instantly expired
      );
      // Small delay to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 10));
      const result = verifyToken(expiredToken);
      assert.equal(result, null);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has matching role', () => {
      const user = { role: 'admin' };
      assert.equal(hasRole(user, ['admin']), true);
    });

    it('should return true when role is in allowed list', () => {
      const user = { role: 'coach' };
      assert.equal(hasRole(user, ['admin', 'coach']), true);
    });

    it('should return false when role is not in allowed list', () => {
      const user = { role: 'user' };
      assert.equal(hasRole(user, ['admin', 'coach']), false);
    });

    it('should return false for null user', () => {
      assert.ok(!hasRole(null, ['admin']));
    });

    it('should return false for undefined user', () => {
      assert.ok(!hasRole(undefined, ['admin']));
    });

    it('should return false for user without role property', () => {
      assert.equal(hasRole({}, ['admin']), false);
    });
  });

  describe('cookieOptions', () => {
    it('should have httpOnly set to true', () => {
      assert.equal(cookieOptions.httpOnly, true);
    });

    it('should have sameSite set to lax', () => {
      assert.equal(cookieOptions.sameSite, 'lax');
    });

    it('should have path set to /', () => {
      assert.equal(cookieOptions.path, '/');
    });

    it('should have maxAge of 7 days in seconds', () => {
      assert.equal(cookieOptions.maxAge, 60 * 60 * 24 * 7);
    });
  });

  describe('COOKIE_NAME', () => {
    it('should be neo_token', () => {
      assert.equal(COOKIE_NAME, 'neo_token');
    });
  });
});
