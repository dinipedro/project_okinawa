import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read: boolean;
}

class NotificationsSocketService {
  private socket: Socket | null = null;
  private connected = false;

  async connect() {
    if (this.socket?.connected) {
      console.log('Notifications socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(`${SOCKET_URL}/notifications`, {
        auth: { token },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to notifications socket');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from notifications socket');
        this.connected = false;
      });

      this.socket.on('error', (error: any) => {
        console.error('Notifications socket error:', error);
      });
    } catch (error) {
      console.error('Failed to connect to notifications socket:', error);
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

  joinUserRoom(userId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('join', { room: `user:${userId}` });
    }
  }

  leaveUserRoom(userId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('leave', { room: `user:${userId}` });
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  offNotification(callback?: (notification: Notification) => void) {
    if (this.socket) {
      this.socket.off('notification', callback);
    }
  }

  markAsRead(notificationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('notification:read', { notificationId });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const notificationsSocketService = new NotificationsSocketService();
