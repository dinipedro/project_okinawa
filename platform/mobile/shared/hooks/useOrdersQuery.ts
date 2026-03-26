import { useQuery, useMutation } from '@tanstack/react-query';
import ApiService from '../services/api';
import { queryKeys, invalidateQueries } from '../config/react-query';

// Fetch user's orders
export function useMyOrders() {
  return useQuery({
    queryKey: queryKeys.orders.my,
    queryFn: () => ApiService.getMyOrders(),
    staleTime: 1000 * 60 * 2, // 2 minutes - orders update frequently
  });
}

// Fetch single order details
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => ApiService.getOrder(orderId),
    enabled: !!orderId,
    refetchInterval: (query) => {
      // Auto-refetch active orders every 30 seconds
      const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering'];
      const data = query.state?.data as any;
      return data?.status && activeStatuses.includes(data.status) ? 30000 : false;
    },
  });
}

// Create new order
export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: any) => ApiService.createOrder(data),
    onSuccess: () => {
      invalidateQueries.afterOrderMutation();
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      ApiService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      invalidateQueries.afterOrderMutation();
    },
  });
}

// Cancel order
export function useCancelOrder() {
  return useMutation({
    mutationFn: (orderId: string) => ApiService.cancelOrder(orderId),
    onSuccess: () => {
      invalidateQueries.afterOrderMutation();
    },
  });
}

// Rate order
export function useRateOrder() {
  return useMutation({
    mutationFn: ({ orderId, rating, review }: { orderId: string; rating: number; review?: string }) =>
      ApiService.rateOrder(orderId, rating, review),
    onSuccess: () => {
      invalidateQueries.afterOrderMutation();
    },
  });
}
