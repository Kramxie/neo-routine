import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

/**
 * GET /api/health
 * Health check endpoint to verify API and database connectivity
 */
export async function GET() {
  try {
    // Attempt to connect to database
    await connectDB();
    
    return NextResponse.json({
      message: 'Neo Routine API is healthy',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        message: 'Health check failed',
        data: {
          status: 'error',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          ...(process.env.NODE_ENV === 'development' && { error: error.message }),
        },
      },
      { status: 503 }
    );
  }
}
