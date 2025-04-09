import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';
import { headers } from 'next/headers';

export const runtime = 'edge';

// Log all environment variables at startup
console.log('Pusher Server Environment Variables Check:', {
  appId: process.env.PUSHER_APP_ID?.substring(0, 4) + '...',
  key: process.env.PUSHER_KEY?.substring(0, 4) + '...',
  secretExists: !!process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

export async function POST(request: Request) {
  try {
    // Get raw body as text
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    // Parse as URLSearchParams (Pusher sends form-urlencoded data)
    const params = new URLSearchParams(rawBody);
    const socketId = params.get('socket_id');
    const channel = params.get('channel_name');

    console.log('Parsed auth data:', { socketId, channel });

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Authorize the channel
    try {
      const authResponse = pusherServer.authorizeChannel(socketId, channel);
      return NextResponse.json(authResponse);
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.json(
        { error: 'Authorization failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 