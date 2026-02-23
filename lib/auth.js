import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * Auth Helper Functions
 * Handles JWT creation, verification, and cookie management
 */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_NAME = 'neo_token';

// Server instance ID from next.config.js (invalidates sessions on dev restart)
const SERVER_INSTANCE_ID = process.env.SERVER_INSTANCE_ID || 'default';

// Validate JWT_SECRET exists
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

/**
 * Cookie options for secure token storage
 * httpOnly prevents JavaScript access (XSS protection)
 * secure ensures HTTPS-only in production
 * sameSite prevents CSRF attacks
 */
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with _id
 * @returns {string} - Signed JWT token
 */
export function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    sid: SERVER_INSTANCE_ID, // Server instance ID for dev session invalidation
  };

  return jwt.sign(payload, JWT_SECRET || 'dev-secret-key', {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'dev-secret-key');
    
    // In dev mode, invalidate tokens from previous server instances
    if (process.env.NODE_ENV !== 'production' && decoded.sid !== SERVER_INSTANCE_ID) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Set auth token cookie in response
 * @param {string} token - JWT token
 * @returns {void}
 */
export async function setTokenCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, cookieOptions);
}

/**
 * Remove auth token cookie (logout)
 * @returns {void}
 */
export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    ...cookieOptions,
    maxAge: 0, // Expire immediately
  });
}

/**
 * Get token from cookies
 * @returns {string|null} - Token or null if not found
 */
export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(COOKIE_NAME);
  return tokenCookie?.value || null;
}

/**
 * Get current authenticated user from request cookies
 * @returns {Object|null} - Decoded user payload or null
 */
export async function getCurrentUser() {
  const token = await getTokenFromCookies();
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Auth guard - throws error if not authenticated
 * Use in API routes that require authentication
 * @returns {Object} - User payload
 * @throws {Error} - If not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  return user;
}

/**
 * Check if user has required role
 * @param {Object} user - User payload
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
  return user && allowedRoles.includes(user.role);
}

export { COOKIE_NAME };
