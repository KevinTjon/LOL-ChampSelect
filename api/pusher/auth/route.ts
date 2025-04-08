import Pusher from 'pusher';
import { NextResponse } from 'next/server';

const pusher = new Pusher({
  appId: process.env.VITE_PUSHER_APP_ID!,
  key: process.env.VITE_PUSHER_KEY!,
  secret: process.env.VITE_PUSHER_SECRET!,
  cluster: process.env.VITE_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const socketId = data.socket_id;
    const channel = data.channel_name;
    
    // For private channels, we can add any additional authorization logic here
    // For now, we'll authorize all requests
    const authResponse = pusher.authorizeChannel(socketId, channel);
    
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Could not authenticate Pusher channel' },
      { status: 500 }
    );
  }
} 