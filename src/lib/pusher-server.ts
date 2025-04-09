import PusherServer from 'pusher';

if (!process.env.PUSHER_APP_ID) throw new Error('PUSHER_APP_ID is required');
if (!process.env.PUSHER_KEY) throw new Error('PUSHER_KEY is required');
if (!process.env.PUSHER_SECRET) throw new Error('PUSHER_SECRET is required');
if (!process.env.PUSHER_CLUSTER) throw new Error('PUSHER_CLUSTER is required');

// Initialize Pusher server instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Helper function to trigger events on channels
export const triggerEvent = async (channel: string, event: string, data: any) => {
  try {
    await pusherServer.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error('Error triggering Pusher event:', error);
    return false;
  }
}; 