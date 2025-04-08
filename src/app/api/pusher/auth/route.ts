import Pusher from 'pusher';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Define the expected request body structure
interface PusherAuthRequestBody {
  socket_id?: string;
  channel_name?: string;
}

// Log all environment variables at startup
console.log('Pusher Server Environment Variables Check:', {
  appId: process.env.PUSHER_APP_ID?.substring(0, 4) + '...',
  key: process.env.PUSHER_KEY?.substring(0, 4) + '...',
  secretExists: !!process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

// Use environment variables directly without VITE_ prefix for server-side
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    // Log request details
    const contentType = request.headers.get('content-type');
    console.log('Auth request content-type:', contentType);

    let socketId: string | undefined;
    let channel: string | undefined;

    // Handle both form data and JSON
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      socketId = params.get('socket_id') || undefined;
      channel = params.get('channel_name') || undefined;
    } else {
      const body = await request.json();
      socketId = body.socket_id;
      channel = body.channel_name;
    }

    // Log parsed data
    console.log('Parsed request data:', { socketId, channel });

    // Validate required parameters
    if (!socketId || !channel) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Handle private channels
    if (channel.startsWith('private-')) {
      try {
        const authResponse = pusher.authorizeChannel(socketId, channel);
        return NextResponse.json(authResponse);
      } catch (error) {
        console.error('Authorization error:', error);
        return NextResponse.json(
          { error: 'Failed to authorize channel' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Channel type not supported' },
      { status: 403 }
    );

  } catch (error) {
    console.error('Auth endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 