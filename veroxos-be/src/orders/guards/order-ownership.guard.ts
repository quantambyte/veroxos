import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from '../orders.service';
import { Order } from '../../entities/order.entity';

interface RequestWithOrder {
  order?: Order;
  params: {
    id?: string;
    slug?: string;
  };
  body?: {
    restaurantSlug?: string;
  };
}

@Injectable()
export class OrderOwnershipGuard implements CanActivate {
  constructor(private readonly ordersService: OrdersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithOrder>();
    const orderId = request.params?.id;
    const restaurantSlug = request.params?.slug || request.body?.restaurantSlug;

    if (!orderId) {
      throw new NotFoundException('Order ID is required');
    }

    const order = await this.ordersService.findOne(orderId);

    if (!order) {
      throw new NotFoundException(`Order with id '${orderId}' not found`);
    }

    if (restaurantSlug) {
      const restaurant =
        await this.ordersService.getRestaurantBySlug(restaurantSlug);
      if (order.restaurantId !== restaurant.id) {
        throw new ForbiddenException(
          'Order does not belong to this restaurant',
        );
      }
    }

    request.order = order;
    return true;
  }
}
