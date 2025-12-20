"use client";

import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { Order } from "@/types/order";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export function useOrderWebSocket(restaurantSlug: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasReceivedInitialData, setHasReceivedInitialData] = useState(false);

  useEffect(() => {
    const newSocket = io(`${WS_URL}/orders`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      setStatus("connected");
      newSocket.emit("join-restaurant", { slug: restaurantSlug });
    });

    newSocket.on("disconnect", () => {
      setStatus("disconnected");
    });

    newSocket.on("connect_error", () => {
      setStatus("error");
    });

    newSocket.on("order:created", (order: Order) => {
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === order.id);
        if (exists) return prev;
        return [order, ...prev];
      });
      setHasReceivedInitialData(true);
    });

    newSocket.on("order:status:updated", (order: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      setHasReceivedInitialData(true);
    });

    setSocket(newSocket);
    setStatus("connecting");

    return () => {
      newSocket.emit("leave-restaurant", { slug: restaurantSlug });
      newSocket.close();
    };
  }, [restaurantSlug]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  return {
    socket,
    status,
    orders: hasReceivedInitialData ? orders : [],
    reconnect,
  };
}
