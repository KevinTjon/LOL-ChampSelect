import Pusher from 'pusher-js';

// Initialize Pusher with your credentials
const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY ?? '', {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER ?? '',
  forceTLS: true,
  authEndpoint: '/api/pusher/auth'
});

// Helper function to get a draft channel
export const draftChannel = (draftId: string) => pusher.subscribe(`private-draft-${draftId}`);

// Helper function to unsubscribe from a draft channel
export const unsubscribeFromDraft = (draftId: string) => pusher.unsubscribe(`private-draft-${draftId}`);

// Helper function to trigger events on a channel
export const triggerEvent = (channelName: string, eventName: string, data: any) => {
  const channel = pusher.channel(channelName);
  if (channel) {
    channel.trigger(eventName, data);
  }
};

export default pusher; 