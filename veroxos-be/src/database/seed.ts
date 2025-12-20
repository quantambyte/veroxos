import { DataSource } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../entities/order-status.enum';

export async function seedDatabase(dataSource: DataSource) {
  const restaurantRepository = dataSource.getRepository(Restaurant);
  const orderRepository = dataSource.getRepository(Order);

  const restaurants = [
    {
      name: 'Pizza Palace',
      slug: 'pizza-palace',
      isActive: true,
    },
    {
      name: 'Burger House',
      slug: 'burger-house',
      isActive: true,
    },
    {
      name: 'Sushi Express',
      slug: 'sushi-express',
      isActive: true,
    },
  ];

  const createdRestaurants = await Promise.all(
    restaurants.map((restaurant) =>
      restaurantRepository.save(restaurantRepository.create(restaurant)),
    ),
  );

  const orders = [
    {
      restaurantId: createdRestaurants[0].id,
      customerName: 'John Doe',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
        { name: 'Garlic Bread', quantity: 2, price: 4.99 },
      ],
      status: OrderStatus.PENDING,
    },
    {
      restaurantId: createdRestaurants[0].id,
      customerName: 'Jane Smith',
      items: [{ name: 'Pepperoni Pizza', quantity: 1, price: 14.99 }],
      status: OrderStatus.CONFIRMED,
    },
    {
      restaurantId: createdRestaurants[0].id,
      customerName: 'Bob Johnson',
      items: [
        { name: 'Hawaiian Pizza', quantity: 1, price: 15.99 },
        { name: 'Coca Cola', quantity: 2, price: 2.99 },
      ],
      status: OrderStatus.PREPARING,
    },
    {
      restaurantId: createdRestaurants[1].id,
      customerName: 'Alice Brown',
      items: [
        { name: 'Classic Burger', quantity: 2, price: 8.99 },
        { name: 'French Fries', quantity: 1, price: 3.99 },
      ],
      status: OrderStatus.PENDING,
    },
    {
      restaurantId: createdRestaurants[1].id,
      customerName: 'Charlie Wilson',
      items: [{ name: 'Cheeseburger', quantity: 1, price: 9.99 }],
      status: OrderStatus.READY,
    },
    {
      restaurantId: createdRestaurants[2].id,
      customerName: 'Diana Prince',
      items: [
        { name: 'Salmon Roll', quantity: 2, price: 6.99 },
        { name: 'Tuna Roll', quantity: 2, price: 7.99 },
        { name: 'Miso Soup', quantity: 1, price: 3.99 },
      ],
      status: OrderStatus.CONFIRMED,
    },
    {
      restaurantId: createdRestaurants[2].id,
      customerName: 'Edward Norton',
      items: [{ name: 'Dragon Roll', quantity: 1, price: 12.99 }],
      status: OrderStatus.COMPLETED,
    },
  ];

  await Promise.all(
    orders.map((order) => orderRepository.save(orderRepository.create(order))),
  );

  console.log('Database seeded successfully!');
  console.log(`Created ${createdRestaurants.length} restaurants`);
  console.log(`Created ${orders.length} orders`);
}
