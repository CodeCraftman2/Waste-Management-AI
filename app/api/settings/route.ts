import { NextRequest, NextResponse } from 'next/server';
import { getUserSettings, updateUserSettings, updateUserProfile } from '../../../utils/db/actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const settings = await getUserSettings(parseInt(userId));
    
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, settings, profile } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    let result;
    
    if (settings) {
      // Update notification and privacy settings
      result = await updateUserSettings(parseInt(userId), settings);
    } else if (profile) {
      // Update profile information
      result = await updateUserProfile(parseInt(userId), profile);
    } else {
      return NextResponse.json({ error: 'Settings or profile data is required' }, { status: 400 });
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 