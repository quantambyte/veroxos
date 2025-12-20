"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/lib/api/orders";
import { type Order, OrderStatus } from "@/types/order";

interface OrderCardProps {
  order: Order;
  restaurantSlug: string;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-300",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-800 border-blue-300",
  [OrderStatus.PREPARING]: "bg-purple-100 text-purple-800 border-purple-300",
  [OrderStatus.READY]: "bg-green-100 text-green-800 border-green-300",
  [OrderStatus.COMPLETED]: "bg-gray-100 text-gray-800 border-gray-300",
};

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
};

export function OrderCard({ order, restaurantSlug }: OrderCardProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newStatus: OrderStatus) =>
      updateOrderStatus(order.id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", restaurantSlug],
      });
    },
  });

  const nextStatuses = statusTransitions[order.status];
  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        statusColors[order.status]
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-gray-900 truncate">{order.customerName}</h3>
          <p className="text-xs text-gray-600 mt-0.5">#{order.id.slice(0, 8)}</p>
        </div>
        <div className="text-right ml-2 flex-shrink-0">
          <p className="text-xs font-medium text-gray-600">{formatTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="mb-3 space-y-1.5">
        {order.items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex justify-between text-sm"
          >
            <span className="text-gray-700">
              {item.quantity}x {item.name}
            </span>
            <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mb-3 border-t border-gray-300 pt-2">
        <div className="flex justify-between font-bold text-base">
          <span className="text-gray-900">Total:</span>
          <span className="text-gray-900">${total.toFixed(2)}</span>
        </div>
      </div>

      {nextStatuses.length > 0 && (
        <div className="flex gap-2">
          {nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => mutation.mutate(status)}
              disabled={mutation.isPending}
              className="flex-1 rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Updating..." : `Mark as ${status}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
