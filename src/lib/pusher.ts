import PusherClient from 'pusher-js';

// Initialize Pusher client
export const pusherClient = new PusherClient(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  forceTLS: true,
  authEndpoint: '/api/pusher/auth'
});

// Helper function to subscribe to a private channel
export const subscribeToPrivateChannel = (channelName: string) => {
  return pusherClient.subscribe(channelName);
};

// Helper function to unsubscribe from a channel
export const unsubscribeFromChannel = (channelName: string) => {
  pusherClient.unsubscribe(channelName);
};

// Helper function to disconnect Pusher client
export const disconnectPusher = () => {
  pusherClient.disconnect();
}; 