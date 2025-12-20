import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { Order } from '../entities/order.entity';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    return {
      type: 'postgres',
      url: dbUrl,
      entities: [Restaurant, Order],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'veroxos',
    password: process.env.DB_PASSWORD || 'veroxos123',
    database: process.env.DB_NAME || 'veroxos',
    entities: [Restaurant, Order],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  };
};
