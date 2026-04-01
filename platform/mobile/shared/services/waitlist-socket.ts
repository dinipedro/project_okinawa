import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class WaitlistSocketService {
  private socket: Socket | null = null;
  private connected = false;

  async connect() {
    if (this.socket?.connected) {
      console.log('Waitlist socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(`${SOCKET_URL}/waitlist`, {
        auth: { token },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to waitlist socket');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from waitlist socket');
        this.connected = false;
      });

      this.socket.on('error', (error: any) => {
        console.error('Waitlist socket error:', error);
      });
    } catch (error) {
      console.error('Failed to connect to waitlist socket:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // IMPORTANT: Event names must match backend gateway handlers
  joinRestaurantRoom(restaurantId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('joinRestaurant', { restaurantId });
    }
  }

  joinUserRoom(userId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('joinUser', { userId });
    }
  }

  leaveRestaurantRoom(restaurantId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('leaveRestaurant', { restaurantId });
    }
  }

  leaveUserRoom(userId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('leaveUser', { userId });
    }
  }

  // Event: Queue position update (for customers waiting)
  onPositionUpdate(callback: (data: { waitlist_id: string; position: number; estimated_wait?: number }) => void) {
    if (this.socket) {
      this.socket.on('waitlist:positionUpdate', callback);
    }
  }

  // Event: Customer's table is ready
  onCalled(callback: (data: { waitlist_id: string; table_id?: string; message?: string }) => void) {
    if (this.socket) {
      this.socket.on('waitlist:called', callback);
    }
  }

  // Event: Auto-called (system triggered, same behavior as called)
  onAutoCalled(callback: (data: { waitlist_id: string; table_id?: string; message?: string }) => void) {
    if (this.socket) {
      this.socket.on('waitlist:auto_called', callback);
    }
  }

  offPositionUpdate(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('waitlist:positionUpdate', callback);
    }
  }

  offCalled(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('waitlist:called', callback);
    }
  }

  offAutoCalled(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('waitlist:auto_called', callback);
    }
  }

  // Send: Join waitlist room to receive updates for a specific entry
  joinWaitlistRoom(waitlistId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('waitlist:join', { waitlist_id: waitlistId });
    }
  }

  // Send: Leave waitlist room
  leaveWaitlistRoom(waitlistId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('waitlist:leave', { waitlist_id: waitlistId });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const waitlistSocketService = new WaitlistSocketService();
