import { useQuery, useMutation } from '@tanstack/react-query';
import ApiService from '../services/api';
import { queryKeys, queryClient } from '../config/react-query';

// Fetch all restaurants with optional filters
export function useRestaurants(filters?: {
  search?: string;
  cuisine_type?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  return useQuery({
    queryKey: queryKeys.restaurants.list(filters),
    queryFn: () => ApiService.getRestaurants(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch nearby restaurants
export function useNearbyRestaurants(latitude: number, longitude: number, radius: number = 5000) {
  return useQuery({
    queryKey: queryKeys.restaurants.nearby(latitude, longitude),
    queryFn: () => ApiService.getNearbyRestaurants(latitude, longitude, radius),
    enabled: !!latitude && !!longitude, // Only fetch if coordinates are available
    staleTime: 1000 * 60 * 2, // 2 minutes - location data changes more frequently
  });
}

// Fetch single restaurant details
export function useRestaurant(id: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.detail(id),
    queryFn: () => ApiService.getRestaurant(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes - restaurant details change less frequently
  });
}

// Fetch restaurant menu
export function useRestaurantMenu(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.menu(restaurantId),
    queryFn: () => ApiService.getRestaurantMenu(restaurantId),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 15, // 15 minutes - menu items don't change often
  });
}

// Create restaurant (for restaurant app)
export function useCreateRestaurant() {
  return useMutation({
    mutationFn: (data: any) => ApiService.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
  });
}

// Update restaurant (for restaurant app)
export function useUpdateRestaurant() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ApiService.updateRestaurant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.detail(variables.id) });
    },
  });
}
