import { useState } from "react";
import { SafeAreaView } from "react-native";
import { ReactQueryProvider } from "./src/lib/react-query";
import { RestaurantListScreen } from "./src/screens/RestaurantListScreen";
import { KitchenScreen } from "./src/screens/KitchenScreen";
import { appStyles } from "./src/styles/app.styles";

export default function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(
    null
  );

  return (
    <ReactQueryProvider>
      <SafeAreaView style={appStyles.container}>
        {selectedRestaurant ? (
          <KitchenScreen
            restaurantSlug={selectedRestaurant}
            onBack={() => setSelectedRestaurant(null)}
          />
        ) : (
          <RestaurantListScreen
            onSelectRestaurant={(slug) => setSelectedRestaurant(slug)}
          />
        )}
      </SafeAreaView>
    </ReactQueryProvider>
  );
}
