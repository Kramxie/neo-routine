/**
 * Rate Limiting Utility
 * In-memory rate limiter for protecting sensitive endpoints
 * 
 * For production at scale, consider Redis-backed rate limiting
 */

// Store for tracking requests: Map<identifier, { count, resetTime }>
const rateLimitStore = new Map();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Periodic cleanup to prevent memory leaks
// Using .unref() so this interval doesn't prevent process exit (important for tests)
if (typeof setInterval !== 'undefined') {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  cleanupInterval.unref();
}

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
  // Auth endpoints - strict limits
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 min
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 registrations per hour
  forgotPassword: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 resets per hour
  resendVerification: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 resends per hour
  verifyEmail: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 min (6-digit code)
  resetPassword: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 min
  
  // API endpoints - moderate limits
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  checkin: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 checkins per minute
  
  // Webhooks - higher limits
  webhook: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
};

/**
 * Get client identifier from request
 * Uses IP address, falls back to user agent hash
 * @param {Request} request - Next.js request object
 * @returns {string} - Client identifier
 */
function getClientIdentifier(request) {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  const ip = forwarded?.split(',')[0]?.trim() || realIp || cfIp || 'unknown';
  
  return ip;
}

/**
 * Check rate limit for a request
 * @param {Request} request - Next.js request object
 * @param {string} endpoint - Endpoint identifier (e.g., 'login', 'register')
 * @param {Object} options - Custom rate limit options (optional)
 * @returns {{ success: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(request, endpoint, options = null) {
  const config = options || RATE_LIMITS[endpoint] || RATE_LIMITS.api;
  const { windowMs, maxRequests } = config;
  
  const clientId = getClientIdentifier(request);
  const key = `${endpoint}:${clientId}`;
  const now = Date.now();
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
  }
  
  // Increment count
  entry.count += 1;
  rateLimitStore.set(key, entry);
  
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetIn = Math.max(0, entry.resetTime - now);
  
  return {
    success: entry.count <= maxRequests,
    remaining,
    resetIn,
    limit: maxRequests,
  };
}

/**
 * Create rate limit response with proper headers
 * @param {number} resetIn - Milliseconds until reset
 * @returns {Response} - 429 Too Many Requests response
 */
export function rateLimitResponse(resetIn) {
  const retryAfter = Math.ceil(resetIn / 1000);
  
  return new Response(
    JSON.stringify({
      message: 'Too many requests. Please try again later.',
      data: { retryAfter },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(Date.now() + resetIn),
      },
    }
  );
}

/**
 * Rate limit middleware wrapper
 * @param {Request} request - Next.js request object
 * @param {string} endpoint - Endpoint identifier
 * @returns {Response|null} - Returns 429 response if limited, null otherwise
 */
export function rateLimit(request, endpoint) {
  const result = checkRateLimit(request, endpoint);
  
  if (!result.success) {
    return rateLimitResponse(result.resetIn);
  }
  
  return null;
}

/**
 * Reset rate limit for a specific client/endpoint (useful after successful auth)
 * @param {Request} request - Next.js request object
 * @param {string} endpoint - Endpoint identifier
 */
export function resetRateLimit(request, endpoint) {
  const clientId = getClientIdentifier(request);
  const key = `${endpoint}:${clientId}`;
  rateLimitStore.delete(key);
}

export default rateLimit;
