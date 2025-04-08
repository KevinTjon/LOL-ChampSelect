import Pusher from 'pusher';

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

export async function POST(req: Request): Promise<Response> {
  try {
    // Log request details
    const contentType = req.headers.get('content-type');
    console.log('Auth request content-type:', contentType);

    let socketId: string | undefined;
    let channel: string | undefined;

    // Get the raw text first
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    // Try to parse as URLSearchParams first (for form data)
    try {
      const params = new URLSearchParams(rawBody);
      socketId = params.get('socket_id') || undefined;
      channel = params.get('channel_name') || undefined;
      console.log('Form data parsed:', { socketId, channel });
    } catch (e) {
      console.log('Not valid form data, trying JSON');
      // If not form data, try JSON
      try {
        const jsonData = JSON.parse(rawBody) as PusherAuthRequestBody;
        socketId = jsonData.socket_id;
        channel = jsonData.channel_name;
        console.log('JSON data parsed:', { socketId, channel });
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }

    // Ensure required parameters are present
    if (!socketId || !channel) {
      console.error('Missing required parameters:', { socketId, channel });
      return new Response(JSON.stringify({ error: 'Missing socket_id or channel_name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For private channels
    if (channel.startsWith('private-')) {
      try {
        const auth = pusher.authorizeChannel(socketId, channel);
        console.log('Private channel auth successful:', { channel, auth });
        return new Response(JSON.stringify(auth), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (authError) {
        console.error('Error authorizing channel:', authError);
        return new Response(JSON.stringify({ 
          error: 'Authorization failed', 
          details: authError instanceof Error ? authError.message : String(authError)
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    console.warn('Unsupported channel type:', channel);
    return new Response(JSON.stringify({ error: 'Channel type not supported' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auth endpoint error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Unknown error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 