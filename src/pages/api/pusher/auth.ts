import type { NextApiRequest, NextApiResponse } from 'next';
import { pusherServer } from '@/lib/pusher-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { socket_id, channel_name } = req.body;

    console.log('Auth request received:', {
      socketId: socket_id,
      channelName: channel_name,
      body: req.body,
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
      socket_id.toString(),
      channel_name.toString()
    );

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(authResponse);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 