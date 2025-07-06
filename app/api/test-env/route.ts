import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? 'Set' : 'Not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    };

    return NextResponse.json({
      success: true,
      environment: envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 