import { io, Socket } from 'socket.io-client';

export interface DeviceUpdate {
  event?: string;
  device_id: string;
  device_code?: string;
  device_gen?: string;
  status?: any;
  online?: boolean;
  trid?: number;
  data?: any;
  timestamp: string;
}

export interface WebSocketEvents {
  device_update: (data: DeviceUpdate) => void;
  shelly_connected: (data: { message: string }) => void;
  shelly_disconnected: (data: { message: string }) => void;
  shelly_error: (data: { error: string }) => void;
  connected: (data: { message: string }) => void;
  error: (data: { error: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token?: string) {
    if (this.socket?.connected) {
      this.disconnect();
    }

    this.token = token || localStorage.getItem('access_token');
    // const API_URL = import.meta.env.VITE_API_URL || 'http:/localhost:9000';
    const API_URL = import.meta.env.VITE_API_URL || 'https://api.shellydashboard.com';
    
    this.socket = io(API_URL);

    this.socket.on('connect', () => {
      // console.log('WebSocket connected');
      
      // Authenticate with the server if we have a token
      if (this.token) {
        this.socket?.emit('authenticate', { token: this.token });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data);
    });

    // this.socket.on('authenticated', (data) => {
    //   console.log('WebSocket authenticated:', data);
    // });

    this.socket.on('shelly_error', (data) => {
      // Only log as error if it's not a configuration issue
      if (data.error && (
        data.error.includes('configure') || 
        data.error.includes('settings') || 
        data.error.includes('API Key') ||
        data.error.includes('User Link') ||
        data.error.includes('No devices found')
      )) {
        console.warn('Shelly WebSocket configuration issue:', data);
      } else {
        console.error('Shelly WebSocket error:', data);
      }
    });

    // this.socket.on('shelly_disconnected', (data) => {
    //   console.warn('Shelly WebSocket disconnected:', data);
    // });

    // this.socket.on('shelly_connected', (data) => {
    //   console.log('Shelly WebSocket connected:', data);
    // });

    // this.socket.on('device_update', (data: DeviceUpdate) => {
    //    // console.log('Device update received:', data);
      
    //   // Handle different event types
    //   switch (data.event) {
    //     case 'Shelly:StatusOnChange':
    //       // console.log(`Status change for device ${data.device_id} (${data.device_code}, ${data.device_gen}):`, data.status);
    //       break;
    //     // case 'Shelly:Online':
    //     //   console.log(`Device ${data.device_id} (${data.device_code}, ${data.device_gen}) online status: ${data.online}`);
    //     //   break;
    //     // case 'Shelly:CommandResponse':
    //     //   console.log(`Command response for device ${data.device_id}, transaction ${data.trid}:`, data.data);
    //     //   break;
    //     // default:
    //     //   console.log('Unknown device update event:', data);
    //   }
    // });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.token = null;
  }

  on<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]) {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]) {
    if (this.socket) {
      this.socket.off(event, callback as any);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const websocketService = new WebSocketService();
export default websocketService; 