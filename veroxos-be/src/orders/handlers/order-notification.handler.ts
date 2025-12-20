import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Order } from '../../entities/order.entity';
import { Restaurant } from '../../entities/restaurant.entity';
import { OrderStatus } from '../../entities/order-status.enum';

interface Notification {
  type: string;
  restaurantId: string;
  orderId: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
}

@Injectable()
export class OrderNotificationHandler {
  private readonly logger = new Logger(OrderNotificationHandler.name);
  private readonly notifications: Notification[] = [];

  @OnEvent('order.created')
  handleOrderCreated(payload: { order: Order; restaurant: Restaurant }) {
    const notification: Notification = {
      type: 'NEW_ORDER',
      restaurantId: payload.restaurant.id,
      orderId: payload.order.id,
      message: `New order from ${payload.order.customerName} with ${payload.order.items.length} item(s)`,
      priority: 'high',
      timestamp: new Date(),
    };

    this.notifications.push(notification);
    this.logger.log(
      `Notification: ${notification.message} for restaurant ${payload.restaurant.name}`,
    );
  }

  @OnEvent('order.status.updated')
  handleOrderStatusUpdated(payload: { order: Order; previousStatus: string }) {
    const priorityMap: Record<OrderStatus, 'low' | 'medium' | 'high'> = {
      [OrderStatus.PENDING]: 'low',
      [OrderStatus.CONFIRMED]: 'medium',
      [OrderStatus.PREPARING]: 'medium',
      [OrderStatus.READY]: 'high',
      [OrderStatus.COMPLETED]: 'low',
    };

    const notification: Notification = {
      type: 'ORDER_STATUS_CHANGED',
      restaurantId: payload.order.restaurantId,
      orderId: payload.order.id,
      message: `Order ${payload.order.id} status changed to ${payload.order.status}`,
      priority: priorityMap[payload.order.status] || 'medium',
      timestamp: new Date(),
    };

    this.notifications.push(notification);
    this.logger.log(`Notification: ${notification.message}`);

    if (payload.order.status === OrderStatus.READY) {
      this.logger.warn(
        `HIGH PRIORITY: Order ${payload.order.id} is ready for pickup!`,
      );
    }
  }

  getNotifications(restaurantId?: string): Notification[] {
    if (restaurantId) {
      return this.notifications.filter(
        (notification) => notification.restaurantId === restaurantId,
      );
    }
    return [...this.notifications];
  }
}
