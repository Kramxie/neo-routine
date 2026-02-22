import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Middleware for route protection
 * Redirects unauthenticated users to login for protected routes
 */

// Server instance ID from next.config.js (invalidates sessions on dev restart)
const SERVER_INSTANCE_ID = process.env.SERVER_INSTANCE_ID || 'default';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/coach'];

// Routes only for unauthenticated users
const authRoutes = ['/login', '/register'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('neo_token')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth route (login/register)
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verify token if exists
  let isValidToken = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'dev-secret-key'
      );
      const { payload } = await jwtVerify(token, secret);
      
      // In dev mode, invalidate tokens from previous server instances
      if (process.env.NODE_ENV !== 'production' && payload.sid !== SERVER_INSTANCE_ID) {
        isValidToken = false;
      } else {
        isValidToken = true;
      }
    } catch (error) {
      // Token is invalid or expired
      isValidToken = false;
    }
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
