import type { Order, OrderStatus, Restaurant } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function createOrder(data: {
  restaurantSlug: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}): Promise<Order> {
  return fetchAPI<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOrdersByRestaurant(
  slug: string,
  status?: OrderStatus
): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status) {
    params.append("status", status);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchAPI<Order[]>(`/api/restaurants/${slug}/orders${query}`);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  return fetchAPI<Order>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getRestaurant(slug: string): Promise<Restaurant> {
  return fetchAPI<Restaurant>(`/api/restaurants/${slug}`);
}

export async function getAllRestaurants() {
  return fetchAPI<
    Array<{ id: string; name: string; slug: string; isActive: boolean }>
  >("/api/restaurants");
}
