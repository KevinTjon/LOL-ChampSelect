import PusherServer from 'pusher';

// Validate environment variables
const config = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
} as const;

// Check for missing environment variables
Object.entries(config).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Initialize Pusher server instance
export const pusherServer = new PusherServer({
  appId: config.appId,
  key: config.key,
  secret: config.secret,
  cluster: config.cluster,
  useTLS: true,
});

// Helper function to trigger events on channels
export const triggerEvent = async (
  channel: string,
  event: string,
  data: unknown
): Promise<boolean> => {
  try {
    await pusherServer.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error('Error triggering Pusher event:', error);
    return false;
  }
}; 