import { io, Socket } from 'socket.io-client';

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;

  private constructor() {
    // Get the Socket.IO server URL from environment variables
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Prefer WebSocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // Champion selection events
  public emitChampionSelect(data: any) {
    this.socket?.emit('champion:select', data);
  }

  public onChampionSelected(callback: (data: any) => void) {
    this.socket?.on('champion:selected', callback);
  }

  public emitChampionBan(data: any) {
    this.socket?.emit('champion:ban', data);
  }

  public onChampionBanned(callback: (data: any) => void) {
    this.socket?.on('champion:banned', callback);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = SocketClient.getInstance(); 