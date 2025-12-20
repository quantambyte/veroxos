"use client";

import { useQuery } from "@tanstack/react-query";
import { useOrderWebSocket } from "@/hooks/use-order-websocket";
import { getOrdersByRestaurant, getRestaurant } from "@/lib/api/orders";
import { type Order, type Restaurant, OrderStatus } from "@/types/order";
import { ConnectionStatusIndicator } from "./connection-status";
import { OrderCard } from "./order-card";
import Link from "next/link";

interface OrderBoardProps {
  restaurantSlug: string;
}

const statusOrder: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.COMPLETED,
];

export function OrderBoard({ restaurantSlug }: OrderBoardProps) {
  const { data: restaurant, isLoading: isLoadingRestaurant } =
    useQuery<Restaurant>({
      queryKey: ["restaurant", restaurantSlug],
      queryFn: () => getRestaurant(restaurantSlug),
    });

  const { data: initialOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders", restaurantSlug],
    queryFn: () => getOrdersByRestaurant(restaurantSlug),
  });

  const { orders: wsOrders, status } = useOrderWebSocket(restaurantSlug);

  const isLoading = isLoadingRestaurant || isLoadingOrders;

  const allOrders =
    wsOrders.length > 0
      ? wsOrders
      : initialOrders.length > 0
      ? initialOrders
      : [];

  const ordersByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = allOrders.filter((order) => order.status === status);
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <div className="text-lg font-medium text-gray-700">
            Loading orders...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Restaurants
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {restaurant?.name || restaurantSlug}
            </h1>
            <p className="mt-1 text-sm text-gray-600">Kitchen Orders</p>
          </div>
          <ConnectionStatusIndicator status={status} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {statusOrder.map((status) => (
            <div key={status} className="flex flex-col">
              <div className="mb-4 rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold capitalize text-gray-900">
                  {status}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {ordersByStatus[status].length} order
                  {ordersByStatus[status].length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="space-y-3">
                {ordersByStatus[status].map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    restaurantSlug={restaurantSlug}
                  />
                ))}
                {ordersByStatus[status].length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="text-sm text-gray-400">No orders</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
