import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  namespace: '/orders',
  cors: {
    origin: '*',
  },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  @OnEvent('order.ws.created')
  handleOrderCreated(payload: { order: any; restaurantSlug: string }) {
    this.emitOrderCreated(payload.order, payload.restaurantSlug);
  }

  @OnEvent('order.ws.status.updated')
  handleOrderStatusUpdated(payload: { order: any; restaurantSlug: string }) {
    this.emitOrderStatusUpdated(payload.order, payload.restaurantSlug);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-restaurant')
  handleJoinRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { slug: string },
  ) {
    const room = `restaurant:${data.slug}`;
    void client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leave-restaurant')
  handleLeaveRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { slug: string },
  ) {
    const room = `restaurant:${data.slug}`;
    void client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { success: true };
  }

  emitOrderCreated(order: any, restaurantSlug: string) {
    const room = `restaurant:${restaurantSlug}`;
    this.server.to(room).emit('order:created', order);
    this.logger.log(`Emitted order:created to room ${room}`);
  }

  emitOrderStatusUpdated(order: any, restaurantSlug: string) {
    const room = `restaurant:${restaurantSlug}`;
    this.server.to(room).emit('order:status:updated', order);
    this.logger.log(`Emitted order:status:updated to room ${room}`);
  }
}
