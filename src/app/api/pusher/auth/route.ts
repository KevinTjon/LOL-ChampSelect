import Pusher from 'pusher';

// Define the expected request body structure
interface PusherAuthRequestBody {
  socket_id?: string;
  channel_name?: string;
}

// Use environment variables directly without VITE_ prefix for server-side
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: true,
});

export async function POST(req: Request): Promise<Response> {
  try {
    // Log environment variables used by the function (redacted for security)
    console.log('Auth endpoint server environment check:', {
      appIdExists: !!process.env.PUSHER_APP_ID,
      keyExists: !!process.env.PUSHER_KEY,
      secretExists: !!process.env.PUSHER_SECRET,
      clusterExists: !!process.env.PUSHER_CLUSTER
    });

    let requestBody: PusherAuthRequestBody;
    let socketId: string | undefined;
    let channel: string | undefined;

    // Check content type and parse accordingly
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      socketId = formData.get('socket_id')?.toString();
      channel = formData.get('channel_name')?.toString();
    } else {
      // Assume JSON, add type assertion after parsing
      requestBody = await req.json() as PusherAuthRequestBody;
      socketId = requestBody.socket_id;
      channel = requestBody.channel_name;
    }

    console.log('Auth request received for:', { socketId, channel });

    // Ensure required parameters are present
    if (!socketId || !channel) {
      console.error('Missing socket_id or channel_name');
      return new Response(JSON.stringify({ error: 'Missing socket_id or channel_name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For presence channels
    if (channel.startsWith('presence-')) {
      const presenceData = {
        user_id: 'unique_user_id', // Replace with actual user ID from your auth system
        user_info: {
          name: 'Anonymous User', // Customize as needed
        }
      };

      const auth = pusher.authorizeChannel(socketId, channel, presenceData);
      console.log('Presence channel auth successful for:', channel);
      return new Response(JSON.stringify(auth), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For private channels
    if (channel.startsWith('private-')) {
      if (channel.startsWith('private-draft-')) {
        const auth = pusher.authorizeChannel(socketId, channel);
        console.log('Private channel auth successful for:', channel);
        return new Response(JSON.stringify(auth), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    console.warn('Unsupported channel type attempted:', channel);
    return new Response(JSON.stringify({ error: 'Channel type not supported' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Log the specific error that occurred
    console.error('Auth error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('Auth error stack:', error.stack);
    }
    return new Response(JSON.stringify({ error: 'Internal server error during authentication' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 