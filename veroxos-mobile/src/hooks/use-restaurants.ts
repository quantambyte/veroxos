import { useQuery } from "@tanstack/react-query";
import { getAllRestaurants } from "../lib/api/orders";

export function useRestaurants() {
  const {
    data: restaurants = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["restaurants"],
    queryFn: getAllRestaurants,
  });

  return {
    restaurants,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
