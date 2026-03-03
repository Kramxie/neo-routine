/**
 * Rate Limit Edge Case Tests
 * Additional coverage for rateLimit utility
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkRateLimit,
  rateLimitResponse,
  rateLimit,
  resetRateLimit,
  RATE_LIMITS,
} from '../lib/rateLimit.js';

// Mock request helper
function createReq(ip = '127.0.0.1') {
  return {
    headers: new Map([['x-forwarded-for', ip]]),
  };
}

describe('RATE_LIMITS config', () => {
  it('should have login preset', () => {
    assert.ok(RATE_LIMITS.login);
    assert.equal(typeof RATE_LIMITS.login.windowMs, 'number');
    assert.equal(typeof RATE_LIMITS.login.maxRequests, 'number');
  });

  it('should have register preset', () => {
    assert.ok(RATE_LIMITS.register);
    assert.equal(RATE_LIMITS.register.maxRequests, 3);
  });

  it('should have forgotPassword preset', () => {
    assert.ok(RATE_LIMITS.forgotPassword);
  });

  it('should have api preset', () => {
    assert.ok(RATE_LIMITS.api);
    assert.equal(RATE_LIMITS.api.maxRequests, 60);
  });

  it('should have webhook preset with highest limit', () => {
    assert.ok(RATE_LIMITS.webhook);
    assert.equal(RATE_LIMITS.webhook.maxRequests, 100);
  });

  it('should have verifyEmail preset', () => {
    assert.ok(RATE_LIMITS.verifyEmail);
  });

  it('should have resetPassword preset', () => {
    assert.ok(RATE_LIMITS.resetPassword);
  });

  it('should have checkin preset', () => {
    assert.ok(RATE_LIMITS.checkin);
    assert.equal(RATE_LIMITS.checkin.maxRequests, 30);
  });
});

describe('checkRateLimit with custom options', () => {
  it('should accept custom windowMs and maxRequests', () => {
    const req = createReq('200.0.0.1');
    const result = checkRateLimit(req, 'custom_test', {
      windowMs: 1000,
      maxRequests: 2,
    });
    assert.equal(result.success, true);
    assert.equal(result.limit, 2);
  });

  it('should block after custom maxRequests exceeded', () => {
    const req = createReq('200.0.0.2');
    // 2 allowed
    checkRateLimit(req, 'custom_test2', { windowMs: 60000, maxRequests: 2 });
    checkRateLimit(req, 'custom_test2', { windowMs: 60000, maxRequests: 2 });
    // Third should fail
    const result = checkRateLimit(req, 'custom_test2', { windowMs: 60000, maxRequests: 2 });
    assert.equal(result.success, false);
    assert.equal(result.remaining, 0);
  });
});

describe('rateLimitResponse', () => {
  it('should return a 429 Response', () => {
    const response = rateLimitResponse(30000);
    assert.equal(response.status, 429);
  });

  it('should include Retry-After header', () => {
    const response = rateLimitResponse(30000);
    const retryAfter = response.headers.get('Retry-After');
    assert.ok(retryAfter);
    assert.equal(retryAfter, '30'); // 30000ms = 30s
  });

  it('should include X-RateLimit-Reset header', () => {
    const response = rateLimitResponse(30000);
    const reset = response.headers.get('X-RateLimit-Reset');
    assert.ok(reset);
    assert.ok(Number(reset) > Date.now() - 1000); // Should be in the future (within 1s tolerance)
  });

  it('should return JSON body with message', async () => {
    const response = rateLimitResponse(5000);
    const body = JSON.parse(await response.text());
    assert.ok(body.message);
    assert.ok(body.message.includes('Too many requests'));
    assert.equal(body.data.retryAfter, 5);
  });
});

describe('rateLimit middleware wrapper', () => {
  it('should return null when under limit', () => {
    const req = createReq('201.0.0.1');
    const result = rateLimit(req, 'api');
    assert.equal(result, null);
  });

  it('should return 429 Response when limit exceeded', () => {
    const req = createReq('201.0.0.2');
    // Exhaust the api limit (60)
    for (let i = 0; i < RATE_LIMITS.api.maxRequests; i++) {
      rateLimit(req, 'api');
    }
    const result = rateLimit(req, 'api');
    assert.ok(result !== null);
    assert.equal(result.status, 429);
  });
});

describe('resetRateLimit', () => {
  it('should clear the rate limit for a specific client', () => {
    const req = createReq('202.0.0.1');
    // Use up all requests
    for (let i = 0; i < RATE_LIMITS.login.maxRequests; i++) {
      checkRateLimit(req, 'login');
    }
    // Should be blocked now
    assert.equal(checkRateLimit(req, 'login').success, false);

    // Reset
    resetRateLimit(req, 'login');

    // Should work again
    const result = checkRateLimit(req, 'login');
    assert.equal(result.success, true);
    assert.equal(result.remaining, RATE_LIMITS.login.maxRequests - 1);
  });

  it('should not affect other endpoints for the same client', () => {
    const req = createReq('202.0.0.2');
    // Use up login limit
    for (let i = 0; i <= RATE_LIMITS.login.maxRequests; i++) {
      checkRateLimit(req, 'login');
    }
    // Use some api limit
    checkRateLimit(req, 'api');

    // Reset only login
    resetRateLimit(req, 'login');

    // Login should be reset
    assert.equal(checkRateLimit(req, 'login').success, true);
    // API count should still be tracked (remaining = maxRequests - 2)
    const apiResult = checkRateLimit(req, 'api');
    assert.equal(apiResult.remaining, RATE_LIMITS.api.maxRequests - 2); // 1 before + 1 now = 2 total
  });
});

describe('getClientIdentifier (implicitly tested)', () => {
  it('should use x-forwarded-for header', () => {
    const req1 = createReq('203.0.0.1');
    const req2 = createReq('203.0.0.2');
    
    // Exhaust for req1
    for (let i = 0; i < RATE_LIMITS.register.maxRequests; i++) {
      checkRateLimit(req1, 'register');
    }
    // req1 should be blocked
    assert.equal(checkRateLimit(req1, 'register').success, false);
    
    // req2 should work (different IP)
    assert.equal(checkRateLimit(req2, 'register').success, true);
  });

  it('should handle request with get method on headers', () => {
    const req = {
      headers: {
        get: (name) => {
          if (name === 'x-forwarded-for') return '204.0.0.1';
          return null;
        },
      },
    };
    const result = checkRateLimit(req, 'api');
    assert.equal(result.success, true);
  });
});
