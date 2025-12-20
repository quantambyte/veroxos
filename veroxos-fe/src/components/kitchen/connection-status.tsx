"use client";

import type { ConnectionStatus } from "@/hooks/use-order-websocket";

interface ConnectionStatusProps {
  status: ConnectionStatus;
}

export function ConnectionStatusIndicator({ status }: ConnectionStatusProps) {
  const statusConfig = {
    connecting: {
      label: "Connecting...",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
    },
    connected: {
      label: "Connected",
      color: "bg-green-500",
      textColor: "text-green-700",
    },
    disconnected: {
      label: "Disconnected",
      color: "bg-gray-500",
      textColor: "text-gray-700",
    },
    error: {
      label: "Connection Error",
      color: "bg-red-500",
      textColor: "text-red-700",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm border border-gray-200">
      <div className={`h-2.5 w-2.5 rounded-full ${config.color} animate-pulse`} />
      <span className={`text-xs font-semibold ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}
