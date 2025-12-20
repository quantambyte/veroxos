import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order } from '../types/order';

const WS_URL = process.env.WS_URL || 'http://localhost:4000';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useOrderWebSocket(restaurantSlug: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const newSocket = io(`${WS_URL}/orders`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setStatus('connected');
      newSocket.emit('join-restaurant', { slug: restaurantSlug });
    });

    newSocket.on('disconnect', () => {
      setStatus('disconnected');
    });

    newSocket.on('connect_error', () => {
      setStatus('error');
    });

    newSocket.on('order:created', (order: Order) => {
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === order.id);
        if (exists) return prev;
        return [order, ...prev];
      });
    });

    newSocket.on('order:status:updated', (order: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? order : o)),
      );
    });

    setSocket(newSocket);
    setStatus('connecting');

    return () => {
      newSocket.emit('leave-restaurant', { slug: restaurantSlug });
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
    orders,
    reconnect,
  };
}

