import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Order } from '../../entities/order.entity';
import { Restaurant } from '../../entities/restaurant.entity';

interface AuditEntry {
  orderId: string;
  restaurantId: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class OrderAuditHandler {
  private readonly logger = new Logger(OrderAuditHandler.name);
  private readonly auditLog: AuditEntry[] = [];

  @OnEvent('order.created')
  handleOrderCreated(payload: { order: Order; restaurant: Restaurant }) {
    const auditEntry: AuditEntry = {
      orderId: payload.order.id,
      restaurantId: payload.restaurant.id,
      action: 'ORDER_CREATED',
      newStatus: payload.order.status,
      timestamp: new Date(),
      metadata: {
        customerName: payload.order.customerName,
        itemsCount: payload.order.items.length,
      },
    };

    this.auditLog.push(auditEntry);
    this.logger.log(`Audit: Order ${payload.order.id} created`);
  }

  @OnEvent('order.status.updated')
  handleOrderStatusUpdated(payload: { order: Order; previousStatus: string }) {
    const auditEntry: AuditEntry = {
      orderId: payload.order.id,
      restaurantId: payload.order.restaurantId,
      action: 'ORDER_STATUS_UPDATED',
      previousStatus: payload.previousStatus,
      newStatus: payload.order.status,
      timestamp: new Date(),
    };

    this.auditLog.push(auditEntry);
    this.logger.log(
      `Audit: Order ${payload.order.id} status changed from ${payload.previousStatus} to ${payload.order.status}`,
    );
  }

  getAuditLog(orderId?: string): AuditEntry[] {
    if (orderId) {
      return this.auditLog.filter((entry) => entry.orderId === orderId);
    }
    return [...this.auditLog];
  }
}
