import { useQuery, useMutation } from '@tanstack/react-query';
import ApiService from '../services/api';
import { queryKeys, invalidateQueries } from '../config/react-query';

// Fetch notifications with filters
export function useNotifications(filters?: {
  unread_only?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => ApiService.getNotifications(filters),
    staleTime: 1000 * 60 * 1, // 1 minute - notifications should be fresh
    refetchInterval: 60000, // Auto-refetch every minute
  });
}

// Fetch unread count
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => ApiService.getUnreadNotificationsCount(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  });
}

// Mark notification as read
export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: (notificationId: string) => ApiService.markNotificationRead(notificationId),
    onSuccess: () => {
      invalidateQueries.afterNotificationMutation();
    },
  });
}

// Mark multiple notifications as read
export function useMarkMultipleNotificationsRead() {
  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      ApiService.markMultipleNotificationsRead(notificationIds),
    onSuccess: () => {
      invalidateQueries.afterNotificationMutation();
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  return useMutation({
    mutationFn: (notificationId: string) => ApiService.deleteNotification(notificationId),
    onSuccess: () => {
      invalidateQueries.afterNotificationMutation();
    },
  });
}

// Delete all read notifications
export function useDeleteAllReadNotifications() {
  return useMutation({
    mutationFn: () => ApiService.deleteAllReadNotifications(),
    onSuccess: () => {
      invalidateQueries.afterNotificationMutation();
    },
  });
}
