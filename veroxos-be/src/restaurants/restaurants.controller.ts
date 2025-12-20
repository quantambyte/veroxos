import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { RestaurantResponseDto } from './dto/restaurant.dto';
import { OrdersService } from '../orders/orders.service';
import { OrderResponseDto } from '../orders/dto/order-response.dto';
import { OrderStatus } from '../entities/order-status.enum';

@ApiTags('restaurants')
@Controller('api/restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active restaurants' })
  @ApiResponse({ status: 200, type: [RestaurantResponseDto] })
  async getAllRestaurants(): Promise<RestaurantResponseDto[]> {
    return this.restaurantsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get restaurant by slug' })
  @ApiResponse({ status: 200, type: RestaurantResponseDto })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getRestaurant(
    @Param('slug') slug: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.findBySlug(slug);
  }

  @Get(':slug/orders')
  @ApiOperation({ summary: 'Get orders for a restaurant' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getOrdersByRestaurant(
    @Param('slug') slug: string,
    @Query('status') status?: OrderStatus,
  ): Promise<OrderResponseDto[]> {
    return this.ordersService.findByRestaurantSlug(slug, status);
  }
}
