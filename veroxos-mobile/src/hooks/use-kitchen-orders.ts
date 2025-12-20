import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrdersByRestaurant,
  getRestaurant,
  updateOrderStatus,
} from "../lib/api/orders";
import { useOrderWebSocket } from "./use-order-websocket";
import { OrderStatus } from "../types/order";

const STATUS_ORDER: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.COMPLETED,
];

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
};

export function useKitchenOrders(restaurantSlug: string) {
  const queryClient = useQueryClient();
  const { orders: wsOrders, status: connectionStatus } =
    useOrderWebSocket(restaurantSlug);

  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ["restaurant", restaurantSlug],
    queryFn: () => getRestaurant(restaurantSlug),
  });

  const { data: initialOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders", restaurantSlug],
    queryFn: () => getOrdersByRestaurant(restaurantSlug),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantSlug] });
    },
  });

  const allOrders = wsOrders.length > 0 ? wsOrders : initialOrders;

  const ordersByStatus = useMemo(
    () =>
      STATUS_ORDER.reduce((acc, status) => {
        acc[status] = allOrders.filter((order) => order.status === status);
        return acc;
      }, {} as Record<OrderStatus, typeof allOrders>),
    [allOrders]
  );

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  return {
    restaurant: restaurant ?? null,
    ordersByStatus,
    isLoading: isLoadingRestaurant || isLoadingOrders,
    connectionStatus,
    updatingOrderId: updateStatusMutation.isPending
      ? updateStatusMutation.variables?.orderId ?? null
      : null,
    handleStatusUpdate,
    statusOrder: STATUS_ORDER,
    statusTransitions: STATUS_TRANSITIONS,
  };
}
