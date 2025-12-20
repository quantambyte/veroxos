import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { RestaurantsService } from '../restaurants.service';
import { Restaurant } from '../../entities/restaurant.entity';

interface RequestWithRestaurant {
  restaurant?: Restaurant;
  params: {
    slug?: string;
  };
}

@Injectable()
export class RestaurantOwnershipGuard implements CanActivate {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithRestaurant>();
    const slug = request.params?.slug;

    if (!slug) {
      throw new NotFoundException('Restaurant slug is required');
    }

    const restaurant = await this.restaurantsService.findBySlug(slug);

    if (!restaurant || !restaurant.isActive) {
      throw new NotFoundException(
        `Restaurant with slug '${slug}' not found or inactive`,
      );
    }

    request.restaurant = restaurant;
    return true;
  }
}
