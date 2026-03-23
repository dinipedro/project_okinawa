import { ordersSocketService } from './orders-socket';
import { reservationsSocketService } from './reservations-socket';
import { notificationsSocketService } from './notifications-socket';

class SocketManager {
  async connectAll() {
    try {
      await Promise.all([
        ordersSocketService.connect(),
        reservationsSocketService.connect(),
        notificationsSocketService.connect(),
      ]);
      console.log('All sockets connected');
    } catch (error) {
      console.error('Failed to connect all sockets:', error);
    }
  }

  disconnectAll() {
    ordersSocketService.disconnect();
    reservationsSocketService.disconnect();
    notificationsSocketService.disconnect();
    console.log('All sockets disconnected');
  }

  getOrdersSocket() {
    return ordersSocketService;
  }

  getReservationsSocket() {
    return reservationsSocketService;
  }

  getNotificationsSocket() {
    return notificationsSocketService;
  }
}

export const socketManager = new SocketManager();
export { ordersSocketService, reservationsSocketService, notificationsSocketService };
