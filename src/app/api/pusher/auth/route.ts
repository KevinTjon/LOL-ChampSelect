import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.VITE_PUSHER_APP_ID || '',
  key: process.env.VITE_PUSHER_KEY || '',
  secret: process.env.VITE_PUSHER_SECRET || '',
  cluster: process.env.VITE_PUSHER_CLUSTER || '',
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    // Log environment variables (redacted for security)
    console.log('Auth endpoint environment check:', {
      appIdExists: !!process.env.VITE_PUSHER_APP_ID,
      keyExists: !!process.env.VITE_PUSHER_KEY,
      secretExists: !!process.env.VITE_PUSHER_SECRET,
      clusterExists: !!process.env.VITE_PUSHER_CLUSTER
    });

    let socketId: string;
    let channel: string;

    // Check content type and parse accordingly
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      socketId = formData.get('socket_id') as string;
      channel = formData.get('channel_name') as string;
    } else {
      const data = await req.json();
      socketId = data.socket_id;
      channel = data.channel_name;
    }

    console.log('Auth request received for:', { socketId, channel });

    if (!socketId || !channel) {
      console.error('Missing socket_id or channel_name');
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // For presence channels
    if (channel.startsWith('presence-')) {
      const presenceData = {
        user_id: 'unique_user_id', // You should get this from your auth system
        user_info: {
          name: 'Anonymous User', // You can customize this based on your needs
        }
      };
      
      const auth = pusher.authorizeChannel(socketId, channel, presenceData);
      return NextResponse.json(auth);
    }
    
    // For private channels
    if (channel.startsWith('private-')) {
      // Here you can add your custom authorization logic
      // For example, check if the user should have access to this draft
      if (channel.startsWith('private-draft-')) {
        // For now, we'll authorize all draft channels
        // In production, you should check if the user has access to this draft
        const auth = pusher.authorizeChannel(socketId, channel);
        return NextResponse.json(auth);
      }
    }

    // If not a private or presence channel, or channel type not supported
    return NextResponse.json(
      { error: 'Channel type not supported' },
      { status: 403 }
    );

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 