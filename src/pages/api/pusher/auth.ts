import type { NextApiRequest, NextApiResponse } from 'next';
import { pusherServer } from '@/lib/pusher-server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Get raw body as string
    const rawBody = await new Promise<string>((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });

    // Parse the raw body
    const params = new URLSearchParams(rawBody);
    const socket_id = params.get('socket_id');
    const channel_name = params.get('channel_name');

    console.log('Auth request details:', {
      socketId: socket_id,
      channelName: channel_name,
      rawBody,
      contentType: req.headers['content-type']
    });

    if (!socket_id || !channel_name) {
      return res.status(400).json({
        error: 'Missing socket_id or channel_name',
        received: { socket_id, channel_name }
      });
    }

    // Log environment check
    console.log('Environment check:', {
      appId: process.env.PUSHER_APP_ID?.slice(0, 4) + '...',
      key: process.env.PUSHER_KEY?.slice(0, 4) + '...',
      hasSecret: !!process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER
    });

    const authResponse = pusherServer.authorizeChannel(
      socket_id,
      channel_name
    );

    return res.status(200).json(authResponse);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 