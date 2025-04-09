import PusherServer from 'pusher';

// Initialize Pusher server instance with error handling
function createPusherInstance() {
  const config = {
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
  };

  // Check for missing environment variables
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing Pusher environment variables:', missingVars);
    throw new Error(`Missing required Pusher environment variables: ${missingVars.join(', ')}`);
  }

  try {
    return new PusherServer({
      appId: config.appId!,
      key: config.key!,
      secret: config.secret!,
      cluster: config.cluster!,
      useTLS: true,
    });
  } catch (error) {
    console.error('Error creating Pusher instance:', error);
    throw error;
  }
}

// Export the Pusher instance
export const pusherServer = createPusherInstance();

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