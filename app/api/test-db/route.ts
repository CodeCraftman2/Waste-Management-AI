import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/dbConfig';
import { Users } from '@/utils/db/schema';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic database connection
    const result = await db.select().from(Users).limit(1).execute();
    
    console.log('Database connection successful');
    console.log('Sample user data:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount: result.length,
      sampleData: result
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : 'No stack trace' : undefined
    }, { status: 500 });
  }
} 