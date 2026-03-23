import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class OrdersSocketService {
  private socket: Socket | null = null;
  private connected = false;

  async connect() {
    if (this.socket?.connected) {
      console.log('Orders socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(`${SOCKET_URL}/orders`, {
        auth: { token },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to orders socket');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from orders socket');
        this.connected = false;
      });

      this.socket.on('error', (error: any) => {
        console.error('Orders socket error:', error);
      });
    } catch (error) {
      console.error('Failed to connect to orders socket:', error);
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
  // Backend expects 'joinRestaurant' and 'leaveRestaurant' events
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

  // Event: New order received (for restaurant apps)
  onOrderNew(callback: (order: any) => void) {
    if (this.socket) {
      this.socket.on('order:new', callback);
    }
  }

  // Event: Order was updated (status, items, etc.)
  onOrderUpdate(callback: (order: any) => void) {
    if (this.socket) {
      this.socket.on('order:update', callback);
    }
  }

  // Event: Order was cancelled
  onOrderCancelled(callback: (data: { order_id: string; reason?: string }) => void) {
    if (this.socket) {
      this.socket.on('order:cancelled', callback);
    }
  }

  offOrderNew(callback?: (order: any) => void) {
    if (this.socket) {
      this.socket.off('order:new', callback);
    }
  }

  offOrderUpdate(callback?: (order: any) => void) {
    if (this.socket) {
      this.socket.off('order:update', callback);
    }
  }

  offOrderCancelled(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('order:cancelled', callback);
    }
  }

  // Send: Join order room to receive updates for a specific order
  joinOrderRoom(orderId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('order:join', { order_id: orderId });
    }
  }

  // Send: Leave order room
  leaveOrderRoom(orderId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('order:leave', { order_id: orderId });
    }
  }

  // Send: Update order status (for restaurant staff)
  updateOrderStatus(orderId: string, status: string, estimatedTime?: number) {
    if (this.socket && this.connected) {
      this.socket.emit('order:status_update', {
        order_id: orderId,
        status,
        estimated_time: estimatedTime,
      });
    }
  }

  // Send: Mark order as ready
  markOrderReady(orderId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('order:ready', { order_id: orderId });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const ordersSocketService = new OrdersSocketService();
