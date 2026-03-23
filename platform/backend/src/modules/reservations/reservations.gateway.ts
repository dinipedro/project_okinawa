import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/reservations',
  cors: { origin: '*' },
})
export class ReservationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`restaurant:${data.restaurantId}`);
    return { event: 'joined', data: { restaurantId: data.restaurantId } };
  }

  @SubscribeMessage('leaveRestaurant')
  handleLeaveRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`restaurant:${data.restaurantId}`);
    return { event: 'left', data: { restaurantId: data.restaurantId } };
  }

  notifyReservationCreated(reservation: any) {
    this.server.to(`restaurant:${reservation.restaurant_id}`).emit('reservation:created', reservation);
  }

  notifyReservationUpdated(reservation: any) {
    this.server.to(`restaurant:${reservation.restaurant_id}`).emit('reservation:updated', reservation);
    this.server.to(`user:${reservation.user_id}`).emit('reservation:updated', reservation);
  }
}
