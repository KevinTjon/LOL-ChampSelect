const Pusher = require('pusher');
import { VercelRequest, VercelResponse } from '@vercel/node';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { socket_id, channel_name } = request.body;

  const auth = pusher.authorizeChannel(socket_id, channel_name);
  response.send(auth);
} 