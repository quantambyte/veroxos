import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { Order } from '../entities/order.entity';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Order])],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {
  constructor(private readonly databaseService: DatabaseService) {}
}
