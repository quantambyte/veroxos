import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Order } from '../../entities/order.entity';
import { Restaurant } from '../../entities/restaurant.entity';

@Injectable()
export class OrderLoggerHandler {
  private readonly logger = new Logger(OrderLoggerHandler.name);

  @OnEvent('order.created')
  handleOrderCreated(payload: { order: Order; restaurant: Restaurant }) {
    this.logger.log(
      `Order created: ${payload.order.id} for restaurant ${payload.restaurant.slug} (${payload.restaurant.name})`,
    );
    this.logger.debug(
      `Order details: ${JSON.stringify(payload.order, null, 2)}`,
    );
  }

  @OnEvent('order.status.updated')
  handleOrderStatusUpdated(payload: { order: Order; previousStatus: string }) {
    this.logger.log(
      `Order status updated: ${payload.order.id} from ${payload.previousStatus} to ${payload.order.status}`,
    );
    this.logger.debug(
      `Order details: ${JSON.stringify(payload.order, null, 2)}`,
    );
  }
}
