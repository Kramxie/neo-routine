import { sanitizeString } from './validators.js';

/**
 * Prepare and validate registration data for reuse in tests and routes
 * Returns sanitized data and validation result
 */
export function prepareRegisterData(raw) {
  const data = {
    name: sanitizeString(raw.name || '', 50),
    email: sanitizeString((raw.email || '').toLowerCase(), 100),
    password: raw.password || '',
  };

  // Basic validation (reuse same rules as validators.js but keep local)
  const errors = {};
  if (!data.name) errors.name = 'Name is required';
  if (!data.email) errors.email = 'Email is required';
  else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(data.email)) errors.email = 'Please enter a valid email address';
  }
  if (!data.password) errors.password = 'Password is required';
  else if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

/**
 * Generate 6-digit verification code and expiry timestamp
 */
export function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  return { code, expiresAt };
}

export default { prepareRegisterData, generateVerificationCode };
