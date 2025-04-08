import Pusher from 'pusher-js';

// Initialize Pusher with your credentials
const pusher = new Pusher(process.env.VITE_PUSHER_KEY || import.meta.env.VITE_PUSHER_KEY || '', {
  cluster: process.env.VITE_PUSHER_CLUSTER || import.meta.env.VITE_PUSHER_CLUSTER || '',
  forceTLS: true,
  authEndpoint: '/api/pusher/auth',
  enabledTransports: ['ws', 'wss'], // Only use WebSocket transport
  timeout: 10000, // Connection timeout in ms
});

// Add debug logging
console.log('Pusher Environment Check:', {
  keyExists: !!(process.env.VITE_PUSHER_KEY || import.meta.env.VITE_PUSHER_KEY),
  clusterExists: !!(process.env.VITE_PUSHER_CLUSTER || import.meta.env.VITE_PUSHER_CLUSTER),
});

// Connection state handling
pusher.connection.bind('state_change', ({ current }: { current: string }) => {
  switch (current) {
    case 'connecting':
      console.log('Connecting to Pusher...');
      break;
    case 'connected':
      console.log('Connected to Pusher');
      break;
    case 'disconnected':
      console.log('Disconnected from Pusher');
      break;
    case 'failed':
      console.log('Connection to Pusher failed');
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        pusher.connect();
      }, 3000);
      break;
    default:
      break;
  }
});

// Helper function to get a draft channel
export const draftChannel = (draftId: string) => {
  const channel = pusher.subscribe(`private-draft-${draftId}`);
  
  // Channel state handling
  channel.bind('pusher:subscription_error', (error: any) => {
    console.error('Draft channel subscription error:', error);
  });

  channel.bind('pusher:subscription_succeeded', () => {
    console.log('Successfully subscribed to draft channel');
  });

  return channel;
};

// Helper function to unsubscribe from a draft channel
export const unsubscribeFromDraft = (draftId: string) => {
  pusher.unsubscribe(`private-draft-${draftId}`);
};

// Helper function to check connection state
export const isConnected = () => pusher.connection.state === 'connected';

// Helper function to manually reconnect
export const reconnect = () => {
  if (pusher.connection.state !== 'connected') {
    pusher.connect();
  }
};

// Helper function to trigger events on a channel
export const triggerEvent = (channelName: string, eventName: string, data: any) => {
  const channel = pusher.channel(channelName);
  if (channel) {
    channel.trigger(eventName, data);
  }
};

export default pusher; 