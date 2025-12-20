import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantOwnershipGuard } from './guards/restaurant-ownership.guard';
import { OrdersService } from '../orders/orders.service';
import { Order } from '../entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Order])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, RestaurantOwnershipGuard, OrdersService],
  exports: [RestaurantsService, RestaurantOwnershipGuard],
})
export class RestaurantsModule {}
