import { useQuery, useMutation } from '@tanstack/react-query';
import ApiService from '../services/api';
import { queryKeys, invalidateQueries } from '../config/react-query';

// Fetch user's favorites
export function useFavorites() {
  return useQuery({
    queryKey: queryKeys.favorites.my,
    queryFn: () => ApiService.getFavorites(),
    staleTime: 1000 * 60 * 10, // 10 minutes - favorites don't change often
  });
}

// Add to favorites
export function useAddFavorite() {
  return useMutation({
    mutationFn: (restaurantId: string) => ApiService.addFavorite(restaurantId),
    onSuccess: () => {
      invalidateQueries.afterFavoriteMutation();
    },
  });
}

// Remove from favorites
export function useRemoveFavorite() {
  return useMutation({
    mutationFn: (restaurantId: string) => ApiService.removeFavorite(restaurantId),
    onSuccess: () => {
      invalidateQueries.afterFavoriteMutation();
    },
  });
}

// Check if restaurant is favorited
export function useIsFavorite(restaurantId: string) {
  const { data: favorites } = useFavorites();

  return {
    isFavorite: favorites?.some((fav: any) => fav.restaurant_id === restaurantId) ?? false,
  };
}
