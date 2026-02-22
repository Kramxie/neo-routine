import crypto from 'crypto';

// Generate unique server instance ID on startup (invalidates sessions on dev server restart)
const SERVER_INSTANCE_ID = process.env.NODE_ENV === 'production'
  ? 'production'
  : crypto.randomBytes(8).toString('hex');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Expose server instance ID to invalidate sessions on dev restart
  env: {
    SERVER_INSTANCE_ID,
  },
};

export default nextConfig;
