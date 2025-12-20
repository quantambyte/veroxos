import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRestaurants } from "../hooks/use-restaurants";
import { restaurantListStyles as styles } from "../styles/restaurant-list.styles";

interface RestaurantListScreenProps {
  onSelectRestaurant: (slug: string) => void;
}

export function RestaurantListScreen({
  onSelectRestaurant,
}: RestaurantListScreenProps) {
  const { restaurants, isLoading, error, refetch } = useRestaurants();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            void refetch();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Restaurant</Text>
        <Text style={styles.subtitle}>
          Choose a restaurant to manage orders
        </Text>
      </View>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => onSelectRestaurant(item.slug)}
          >
            <View style={styles.restaurantCardContent}>
              <Text style={styles.restaurantName}>{item.name}</Text>
              <Text style={styles.restaurantSlug}>{item.slug}</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    item.isActive ? styles.statusActive : styles.statusInactive,
                  ]}
                />
                <Text style={styles.statusText}>
                  {item.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}
