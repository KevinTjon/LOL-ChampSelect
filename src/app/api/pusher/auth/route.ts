import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';

export const runtime = 'nodejs';

// Log all environment variables at startup
console.log('Pusher Server Environment Variables Check:', {
  appId: process.env.PUSHER_APP_ID?.substring(0, 4) + '...',
  key: process.env.PUSHER_KEY?.substring(0, 4) + '...',
  secretExists: !!process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

export async function POST(req: NextRequest) {
  try {
    // Get the request body as a string
    const body = await req.text();
    
    // Parse the body manually
    const data = new URLSearchParams(body);
    const socketId = data.get('socket_id');
    const channelName = data.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          received: { socketId, channelName }
        },
        { status: 400 }
      );
    }

    // Log the auth attempt
    console.log('Authorizing:', {
      socketId,
      channelName,
      appId: process.env.PUSHER_APP_ID?.slice(0, 4) + '...',
      key: process.env.PUSHER_KEY?.slice(0, 4) + '...',
      hasSecret: !!process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER
    });

    // Generate auth signature
    const authResponse = pusherServer.authorizeChannel(socketId, channelName);

    // Return the auth response with CORS headers
    return new NextResponse(JSON.stringify(authResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 