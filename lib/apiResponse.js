import { NextResponse } from 'next/server';

/**
 * API Response Utilities
 * Standardize API responses across all endpoints
 */

/**
 * Success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code (default: 200)
 */
export function success(data = null, message = 'Success', status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * Created response (201)
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
export function created(data = null, message = 'Created successfully') {
  return success(data, message, 201);
}

/**
 * Error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 400)
 * @param {Object} errors - Field-specific errors
 */
export function error(message = 'Something went wrong', status = 400, errors = null) {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.data = { errors };
  }

  return NextResponse.json(response, { status });
}

/**
 * Validation error (400)
 * @param {Object} errors - Field-specific validation errors
 */
export function validationError(errors) {
  return error('Validation failed', 400, errors);
}

/**
 * Unauthorized error (401)
 * @param {string} message - Error message
 */
export function unauthorized(message = 'Authentication required') {
  return error(message, 401);
}

/**
 * Forbidden error (403)
 * @param {string} message - Error message
 */
export function forbidden(message = 'Access denied') {
  return error(message, 403);
}

/**
 * Not found error (404)
 * @param {string} resource - Resource name
 */
export function notFound(resource = 'Resource') {
  return error(`${resource} not found`, 404);
}

/**
 * Conflict error (409)
 * @param {string} message - Error message
 */
export function conflict(message = 'Resource already exists') {
  return error(message, 409);
}

/**
 * Rate limit error (429)
 * @param {number} retryAfter - Seconds until retry allowed
 */
export function rateLimited(retryAfter = 60) {
  return NextResponse.json(
    {
      success: false,
      message: 'Too many requests. Please try again later.',
      data: { retryAfter },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
      },
    }
  );
}

/**
 * Internal server error (500)
 * @param {Error} err - Error object (logged, not exposed)
 * @param {string} context - Context for logging
 */
export function serverError(err, context = 'API') {
  console.error(`[${context}] Server error:`, err);
  
  // In development, include more details
  const message = process.env.NODE_ENV === 'development' 
    ? `Server error: ${err.message}` 
    : 'An unexpected error occurred';
    
  return error(message, 500);
}

/**
 * Wrap async route handler with error catching
 * @param {Function} handler - Async route handler
 * @param {string} context - Context for error logging
 */
export function withErrorHandler(handler, context = 'API') {
  return async (request, params) => {
    try {
      return await handler(request, params);
    } catch (err) {
      return serverError(err, context);
    }
  };
}

const apiResponse = {
  success,
  created,
  error,
  validationError,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  rateLimited,
  serverError,
  withErrorHandler,
};

export default apiResponse;
