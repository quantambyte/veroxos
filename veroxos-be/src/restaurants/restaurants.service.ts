import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async findBySlug(slug: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { slug },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with slug '${slug}' not found`);
    }

    return restaurant;
  }

  async findById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id '${id}' not found`);
    }

    return restaurant;
  }

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }
}
