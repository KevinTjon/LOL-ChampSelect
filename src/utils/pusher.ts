import Pusher from 'pusher-js';

// Initialize Pusher with your credentials using import.meta.env for client-side
const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY || '', {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER || '',
  forceTLS: true,
  channelAuthorization: {
    endpoint: '/api/pusher/auth',
    transport: 'ajax',
    headers: {
      'Content-Type': 'application/json',
      // Add CSRF token if available
      ...(typeof document !== 'undefined' && document.querySelector('meta[name="csrf-token"]')
        ? { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' }
        : {}),
    },
  },
  enabledTransports: ['ws', 'wss'], // Only use WebSocket transport
});

// Add debug logging using import.meta.env
console.log('Pusher Environment Check:', {
  keyExists: !!import.meta.env.VITE_PUSHER_KEY,
  clusterExists: !!import.meta.env.VITE_PUSHER_CLUSTER,
});

// More detailed connection state logging
pusher.connection.bind('state_change', (states: { previous: string; current: string }) => {
  console.log(
    `Pusher connection state changed from ${states.previous} to ${states.current}`
  );
});

pusher.connection.bind('error', (err: any) => {
  console.error('Pusher connection error:', err);
  if (err.error && err.error.data && err.error.data.code) {
    console.error(`Pusher error code: ${err.error.data.code}`);
  }
});

// Helper function to get a draft channel
export const draftChannel = (draftId: string) => {
  const channelName = `private-draft-${draftId}`;
  console.log(`Attempting to subscribe to channel: ${channelName}`);
  const channel = pusher.subscribe(channelName);
  
  // Channel state handling
  channel.bind('pusher:subscription_error', (error: any) => {
    console.error(`Draft channel (${channelName}) subscription error:`, error);
  });

  channel.bind('pusher:subscription_succeeded', () => {
    console.log(`Successfully subscribed to draft channel: ${channelName}`);
  });

  return channel;
};

// Helper function to unsubscribe from a draft channel
export const unsubscribeFromDraft = (draftId: string) => {
  const channelName = `private-draft-${draftId}`;
  console.log(`Unsubscribing from channel: ${channelName}`);
  pusher.unsubscribe(channelName);
};

// Helper function to check connection state
export const isConnected = () => pusher.connection.state === 'connected';

// Helper function to manually reconnect
export const reconnect = () => {
  if (pusher.connection.state !== 'connected') {
    console.log('Attempting Pusher reconnect...');
    pusher.connect();
  }
};

// Helper function to trigger events on a channel
export const triggerEvent = (channelName: string, eventName: string, data: any) => {
  const channel = pusher.channel(channelName);
  if (channel && channel.subscribed) {
    console.log(`Triggering event '${eventName}' on channel '${channelName}'`);
    channel.trigger(eventName, data);
  } else {
    console.warn(`Cannot trigger event '${eventName}' on channel '${channelName}': Channel not found or not subscribed.`);
  }
};

export default pusher; 