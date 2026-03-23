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
  namespace: '/tabs',
  cors: {
    origin: '*',
  },
})
export class TabsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TabsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Tab client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Tab client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTab')
  handleJoinTab(@ConnectedSocket() client: Socket, @MessageBody() tabId: string) {
    client.join(`tab:${tabId}`);
    return { event: 'joined', tabId };
  }

  @SubscribeMessage('leaveTab')
  handleLeaveTab(@ConnectedSocket() client: Socket, @MessageBody() tabId: string) {
    client.leave(`tab:${tabId}`);
    return { event: 'left', tabId };
  }

  /**
   * Notify all members of a tab about an update
   */
  notifyTabUpdate(tabId: string, eventType: string, data: any) {
    this.server.to(`tab:${tabId}`).emit('tabUpdate', {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify about new item added
   */
  notifyItemAdded(tabId: string, item: any) {
    this.notifyTabUpdate(tabId, 'item_added', item);
  }

  /**
   * Notify about member joined
   */
  notifyMemberJoined(tabId: string, member: any) {
    this.notifyTabUpdate(tabId, 'member_joined', member);
  }

  /**
   * Notify about member left
   */
  notifyMemberLeft(tabId: string, userId: string) {
    this.notifyTabUpdate(tabId, 'member_left', { userId });
  }

  /**
   * Notify about payment made
   */
  notifyPaymentMade(tabId: string, payment: any) {
    this.notifyTabUpdate(tabId, 'payment_made', payment);
  }

  /**
   * Notify about tab closed
   */
  notifyTabClosed(tabId: string) {
    this.notifyTabUpdate(tabId, 'tab_closed', { closedAt: new Date() });
  }
}
