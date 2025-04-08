import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';

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
    const data = await request.formData();
    const socketId = data.get('socket_id');
    const channel = data.get('channel_name');

    if (!socketId || !channel) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Authorize the channel
    const authResponse = pusherServer.authorizeChannel(
      socketId.toString(),
      channel.toString()
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Error in Pusher auth:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 