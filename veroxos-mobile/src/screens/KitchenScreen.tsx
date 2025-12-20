import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useKitchenOrders } from "../hooks/use-kitchen-orders";
import { formatTime, calculateOrderTotal } from "../utils/format";
import { kitchenStyles as styles } from "../styles/kitchen.styles";

interface KitchenScreenProps {
  restaurantSlug: string;
  onBack?: () => void;
}

export function KitchenScreen({ restaurantSlug, onBack }: KitchenScreenProps) {
  const {
    restaurant,
    ordersByStatus,
    isLoading,
    connectionStatus,
    updatingOrderId,
    handleStatusUpdate,
    statusOrder,
    statusTransitions,
  } = useKitchenOrders(restaurantSlug);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  const getConnectionStatusText = () => {
    if (connectionStatus === "connected") return "Connected";
    if (connectionStatus === "connecting") return "Connecting...";
    return "Disconnected";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{restaurant?.name || restaurantSlug}</Text>
        <Text style={styles.subtitle}>Kitchen Orders</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              connectionStatus === "connected"
                ? styles.statusConnected
                : styles.statusDisconnected,
            ]}
          />
          <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
        </View>
      </View>

      {statusOrder.map((status) => (
        <View key={status} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {status} ({ordersByStatus[status].length})
            </Text>
          </View>
          {ordersByStatus[status].map((order) => {
            const nextStatuses = statusTransitions[order.status];
            const total = calculateOrderTotal(order.items);
            const isUpdating = updatingOrderId === order.id;

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.customerName}>
                      {order.customerName}
                    </Text>
                    <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                  </View>
                  <Text style={styles.orderTime}>
                    {formatTime(order.createdAt)}
                  </Text>
                </View>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItemRow}>
                    <Text style={styles.orderItem}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Text style={styles.orderItemPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalContainer}>
                  <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
                </View>
                {nextStatuses.length > 0 && (
                  <View style={styles.actionButtons}>
                    {nextStatuses.map((nextStatus) => (
                      <TouchableOpacity
                        key={nextStatus}
                        style={[
                          styles.actionButton,
                          isUpdating && styles.actionButtonDisabled,
                        ]}
                        onPress={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.actionButtonText}>
                            Mark as {nextStatus}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
          {ordersByStatus[status].length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No orders</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
