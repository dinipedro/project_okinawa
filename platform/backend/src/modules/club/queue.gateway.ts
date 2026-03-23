import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/queue',
  cors: {
    origin: '*',
  },
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(QueueGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Queue client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Queue client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinQueueRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() restaurantId: string) {
    client.join(`queue:${restaurantId}`);
    return { event: 'joined', restaurantId };
  }

  @SubscribeMessage('leaveQueueRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() restaurantId: string) {
    client.leave(`queue:${restaurantId}`);
    return { event: 'left', restaurantId };
  }

  @SubscribeMessage('subscribeToMyPosition')
  handleSubscribePosition(@ConnectedSocket() client: Socket, @MessageBody() data: { restaurantId: string; userId: string }) {
    client.join(`queue:${data.restaurantId}:user:${data.userId}`);
    return { event: 'subscribed', ...data };
  }

  /**
   * Notify all users in queue about position updates
   */
  notifyQueueUpdate(restaurantId: string, queue: any[]) {
    this.server.to(`queue:${restaurantId}`).emit('queueUpdate', {
      type: 'queue_updated',
      queue,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify specific user about their position change
   */
  notifyPositionUpdate(restaurantId: string, userId: string, data: any) {
    this.server.to(`queue:${restaurantId}:user:${userId}`).emit('positionUpdate', {
      type: 'position_changed',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify user they are being called
   */
  notifyUserCalled(restaurantId: string, userId: string) {
    this.server.to(`queue:${restaurantId}:user:${userId}`).emit('called', {
      type: 'your_turn',
      message: 'Sua vez! Apresente-se na entrada em 5 minutos.',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify staff about queue stats update
   */
  notifyStatsUpdate(restaurantId: string, stats: any) {
    this.server.to(`queue:${restaurantId}`).emit('statsUpdate', {
      type: 'stats_updated',
      stats,
      timestamp: new Date().toISOString(),
    });
  }
}
