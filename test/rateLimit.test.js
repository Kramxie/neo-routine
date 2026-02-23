import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit, RATE_LIMITS } from '../lib/rateLimit.js';

/**
 * Tests for Rate Limiting utility
 */

// Mock request object
function createMockRequest(ip = '127.0.0.1') {
  return {
    headers: new Map([
      ['x-forwarded-for', ip],
    ]),
  };
}

// Note: Can't use beforeEach due to module state, running tests with unique IPs

describe('Rate Limiting', () => {
  it('allows requests under the limit', () => {
    const request = createMockRequest('10.0.0.1');
    const result = checkRateLimit(request, 'api');
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.remaining, RATE_LIMITS.api.maxRequests - 1);
  });

  it('blocks requests over the limit', () => {
    const request = createMockRequest('10.0.0.2');
    
    // Exhaust the limit
    for (let i = 0; i < RATE_LIMITS.api.maxRequests; i++) {
      checkRateLimit(request, 'api');
    }
    
    // Next request should be blocked
    const result = checkRateLimit(request, 'api');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.remaining, 0);
  });

  it('tracks different endpoints separately', () => {
    const request = createMockRequest('10.0.0.3');
    
    // Hit api endpoint
    const apiResult = checkRateLimit(request, 'api');
    assert.strictEqual(apiResult.success, true);
    
    // Should have separate limit for login
    const loginResult = checkRateLimit(request, 'login');
    assert.strictEqual(loginResult.success, true);
    assert.strictEqual(loginResult.remaining, RATE_LIMITS.login.maxRequests - 1);
  });

  it('tracks different IPs separately', () => {
    const request1 = createMockRequest('10.0.0.4');
    const request2 = createMockRequest('10.0.0.5');
    
    // Hit limit for first IP
    for (let i = 0; i <= RATE_LIMITS.login.maxRequests; i++) {
      checkRateLimit(request1, 'login');
    }
    
    // Second IP should still work
    const result = checkRateLimit(request2, 'login');
    assert.strictEqual(result.success, true);
  });

  it('provides correct rate limit info', () => {
    const request = createMockRequest('10.0.0.6');
    
    const result1 = checkRateLimit(request, 'login');
    assert.strictEqual(result1.limit, RATE_LIMITS.login.maxRequests);
    assert.ok(result1.resetIn > 0);
    
    const result2 = checkRateLimit(request, 'login');
    assert.strictEqual(result2.remaining, RATE_LIMITS.login.maxRequests - 2);
  });
});
