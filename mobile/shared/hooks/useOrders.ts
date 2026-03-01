import { useState, useEffect } from 'react';
import ApiService from '../services/api';

interface Order {
  id: string;
  restaurant_id: string;
  status: string;
  subtotal_amount: number;
  tax_amount: number;
  tip_amount: number;
  total_amount: number;
  created_at: string;
  items: Array<{
    id: string;
    menu_item: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    unit_price: number;
  }>;
  restaurant?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export const useOrders = (restaurantId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [restaurantId]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = restaurantId
        ? await ApiService.getRestaurantOrders({ restaurant_id: restaurantId })
        : await ApiService.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId: string) => {
    try {
      return await ApiService.getOrder(orderId);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to get order');
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      const order = await ApiService.createOrder(orderData);
      await loadOrders();
      return order;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const order = await ApiService.updateOrderStatus(orderId, status);
      await loadOrders();
      return order;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update order');
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await ApiService.cancelOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  return {
    orders,
    loading,
    error,
    loadOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    cancelOrder,
  };
};
