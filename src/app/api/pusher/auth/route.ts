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
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);

    let socketId: string | undefined;
    let channel: string | undefined;

    // Handle both form data and JSON formats
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      socketId = formData.get('socket_id')?.toString();
      channel = formData.get('channel_name')?.toString();
    } else if (contentType?.includes('application/json')) {
      const jsonData = await request.json();
      socketId = jsonData.socket_id;
      channel = jsonData.channel_name;
    } else {
      // Fallback to raw body parsing
      const rawBody = await request.text();
      const params = new URLSearchParams(rawBody);
      socketId = params.get('socket_id')?.toString();
      channel = params.get('channel_name')?.toString();
    }

    console.log('Auth request data:', { socketId, channel });

    if (!socketId || !channel) {
      return NextResponse.json(
        { 
          error: 'Missing socket_id or channel_name',
          received: { socketId, channel }
        },
        { status: 400 }
      );
    }

    // Log environment variables (safely)
    console.log('Environment check:', {
      appId: process.env.PUSHER_APP_ID?.substring(0, 4) + '...',
      key: process.env.PUSHER_KEY?.substring(0, 4) + '...',
      secretExists: !!process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER
    });

    // Authorize the channel
    try {
      const authResponse = pusherServer.authorizeChannel(socketId, channel);
      console.log('Auth success:', { channel });
      
      // Set CORS headers
      return NextResponse.json(authResponse, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.json(
        { 
          error: 'Authorization failed',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request handling error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
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