import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { Order } from '../entities/order.entity';
import { seedDatabase } from './seed';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectRepository(Restaurant)
    public readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Order)
    public readonly orderRepository: Repository<Order>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Check if database is empty and seed if needed
    const restaurantCount = await this.restaurantRepository.count();
    if (restaurantCount === 0) {
      console.log('Database is empty, seeding initial data...');
      await seedDatabase(this.dataSource);
      console.log('Database seeding completed!');
    }
  }
}
