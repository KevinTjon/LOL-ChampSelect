import Pusher from 'pusher';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Use environment variables directly without VITE_ prefix for server-side
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: true,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the method received
  console.log('Auth request method:', req.method);

  // --- Check Method --- 
  if (req.method !== 'POST') {
    console.warn(`Method ${req.method} not allowed.`);
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }
  // --- End Check Method --- 

  // Vercel automatically parses the body for common content types
  const socketId = req.body.socket_id as string;
  const channel = req.body.channel_name as string;
  const contentType = req.headers['content-type'];

  console.log('Auth request received:', { socketId, channel, contentType });

  // Check if Vercel failed to parse or if params are missing
  if (!socketId || !channel) {
    console.error('Missing socket_id or channel_name in request body:', req.body);
    res.status(400).json({ error: 'Missing socket_id or channel_name' });
    return;
  }

  try {
    console.log('Auth endpoint server environment check:', { /* Env check */ });

    // --- Authorization Logic --- 
    if (channel.startsWith('presence-')) {
      const presenceData = {
        user_id: 'unique_user_id', // Replace with actual user ID from your auth system
        user_info: { name: 'Anonymous User' } // Customize as needed
      };
      const auth = pusher.authorizeChannel(socketId, channel, presenceData);
      console.log('Presence channel auth successful for:', channel);
      res.status(200).json(auth);
    } else if (channel.startsWith('private-')) {
      if (channel.startsWith('private-draft-')) {
        const auth = pusher.authorizeChannel(socketId, channel);
        console.log('Private channel auth successful for:', channel);
        res.status(200).json(auth);
      }
    } else {
      console.warn('Unsupported channel type attempted:', channel);
      res.status(403).json({ error: 'Channel type not supported' });
    }
    // --- End Authorization Logic --- 

  } catch (error) {
    console.error('Auth error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('Auth error stack:', error.stack);
    }
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
} 