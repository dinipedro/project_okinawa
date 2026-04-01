import { ordersSocketService } from './orders-socket';
import { reservationsSocketService } from './reservations-socket';
import { notificationsSocketService } from './notifications-socket';
import { waitlistSocketService } from './waitlist-socket';

class SocketManager {
  async connectAll() {
    try {
      await Promise.all([
        ordersSocketService.connect(),
        reservationsSocketService.connect(),
        notificationsSocketService.connect(),
        waitlistSocketService.connect(),
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
    waitlistSocketService.disconnect();
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

  getWaitlistSocket() {
    return waitlistSocketService;
  }
}

export const socketManager = new SocketManager();
export { ordersSocketService, reservationsSocketService, notificationsSocketService, waitlistSocketService };
