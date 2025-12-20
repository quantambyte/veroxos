import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Order } from '../entities/order.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { OrderOwnershipGuard } from './guards/order-ownership.guard';
import { OrderLoggerHandler } from './handlers/order-logger.handler';
import { OrderAuditHandler } from './handlers/order-audit.handler';
import { OrderNotificationHandler } from './handlers/order-notification.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant]), EventEmitterModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersGateway,
    OrderOwnershipGuard,
    OrderLoggerHandler,
    OrderAuditHandler,
    OrderNotificationHandler,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
