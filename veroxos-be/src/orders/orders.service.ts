import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../entities/order.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { OrderStatus } from '../entities/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { validateOrderStatusTransition } from './validators/order-status.validator';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { slug: createOrderDto.restaurantSlug },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with slug '${createOrderDto.restaurantSlug}' not found`,
      );
    }

    const order = this.orderRepository.create({
      restaurantId: restaurant.id,
      customerName: createOrderDto.customerName,
      items: createOrderDto.items,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    this.eventEmitter.emit('order.created', {
      order: savedOrder,
      restaurant,
    });

    this.eventEmitter.emit('order.ws.created', {
      order: savedOrder,
      restaurantSlug: restaurant.slug,
    });

    return savedOrder;
  }

  async findByRestaurantSlug(
    slug: string,
    status?: OrderStatus,
  ): Promise<Order[]> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { slug },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with slug '${slug}' not found`);
    }

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.restaurantId = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id '${id}' not found`);
    }

    return order;
  }

  async updateStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    const previousStatus = order.status;

    validateOrderStatusTransition(previousStatus, newStatus);

    order.status = newStatus;
    const updatedOrder = await this.orderRepository.save(order);

    const restaurant = await this.restaurantRepository.findOne({
      where: { id: order.restaurantId },
    });

    this.eventEmitter.emit('order.status.updated', {
      order: updatedOrder,
      previousStatus,
    });

    if (restaurant) {
      this.eventEmitter.emit('order.ws.status.updated', {
        order: updatedOrder,
        restaurantSlug: restaurant.slug,
      });
    }

    return updatedOrder;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { slug },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with slug '${slug}' not found`);
    }

    return restaurant;
  }
}
