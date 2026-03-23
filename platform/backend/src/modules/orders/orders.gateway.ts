import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';

@WebSocketGateway({
  namespace: '/orders',
  cors: { origin: '*' },
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  constructor(private ordersService: OrdersService) {}

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

  notifyOrderCreated(order: any) {
    this.server.to(`restaurant:${order.restaurant_id}`).emit('order:created', order);
  }

  notifyOrderUpdated(order: any) {
    this.server.to(`restaurant:${order.restaurant_id}`).emit('order:updated', order);
    this.server.to(`user:${order.user_id}`).emit('order:updated', order);
  }
}
