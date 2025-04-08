import { useEffect, useCallback } from 'react';
import { Channel } from 'pusher-js';
import { pusherClient, subscribeToPrivateChannel, unsubscribeFromChannel } from '@/lib/pusher';

interface UsePusherOptions {
  channelName: string;
  eventName: string;
  onEvent: (data: any) => void;
}

export function usePusher({ channelName, eventName, onEvent }: UsePusherOptions) {
  const subscribe = useCallback(() => {
    try {
      const channel = subscribeToPrivateChannel(channelName);
      
      // Bind to the event
      channel.bind(eventName, onEvent);
      
      return channel;
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      return null;
    }
  }, [channelName, eventName, onEvent]);

  useEffect(() => {
    let channel: Channel | null = null;

    // Subscribe to the channel
    channel = subscribe();

    // Cleanup function
    return () => {
      if (channel) {
        channel.unbind_all();
        unsubscribeFromChannel(channelName);
      }
    };
  }, [channelName, subscribe]);

  // Return function to manually trigger resubscription if needed
  return { resubscribe: subscribe };
} 