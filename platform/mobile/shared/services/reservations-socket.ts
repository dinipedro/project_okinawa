import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ReservationsSocketService {
  private socket: Socket | null = null;
  private connected = false;

  async connect() {
    if (this.socket?.connected) {
      console.log('Reservations socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(`${SOCKET_URL}/reservations`, {
        auth: { token },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to reservations socket');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from reservations socket');
        this.connected = false;
      });

      this.socket.on('error', (error: any) => {
        console.error('Reservations socket error:', error);
      });
    } catch (error) {
      console.error('Failed to connect to reservations socket:', error);
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

  // Event: New reservation received (for restaurant apps)
  onReservationNew(callback: (reservation: any) => void) {
    if (this.socket) {
      this.socket.on('reservation:new', callback);
    }
  }

  // Event: Reservation was updated (status, time, etc.)
  onReservationUpdate(callback: (reservation: any) => void) {
    if (this.socket) {
      this.socket.on('reservation:update', callback);
    }
  }

  // Event: Reservation was cancelled
  onReservationCancelled(callback: (data: { reservation_id: string; reason?: string }) => void) {
    if (this.socket) {
      this.socket.on('reservation:cancelled', callback);
    }
  }

  // Event: Reservation was confirmed
  onReservationConfirmed(callback: (data: { reservation_id: string }) => void) {
    if (this.socket) {
      this.socket.on('reservation:confirmed', callback);
    }
  }

  offReservationNew(callback?: (reservation: any) => void) {
    if (this.socket) {
      this.socket.off('reservation:new', callback);
    }
  }

  offReservationUpdate(callback?: (reservation: any) => void) {
    if (this.socket) {
      this.socket.off('reservation:update', callback);
    }
  }

  offReservationCancelled(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('reservation:cancelled', callback);
    }
  }

  offReservationConfirmed(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('reservation:confirmed', callback);
    }
  }

  // Event: Reservation reminder (upcoming reservation alert for customer)
  onReservationReminder(callback: (data: { reservation_id: string; reservation_time: string; restaurant_name?: string; minutes_until?: number }) => void) {
    if (this.socket) {
      this.socket.on('reservation:reminder', callback);
    }
  }

  offReservationReminder(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('reservation:reminder', callback);
    }
  }

  // Send: Join reservation room to receive updates for a specific reservation
  joinReservationRoom(reservationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('reservation:join', { reservation_id: reservationId });
    }
  }

  // Send: Leave reservation room
  leaveReservationRoom(reservationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit('reservation:leave', { reservation_id: reservationId });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const reservationsSocketService = new ReservationsSocketService();
