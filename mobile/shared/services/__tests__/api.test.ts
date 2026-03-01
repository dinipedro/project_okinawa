import ApiService from '../api';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestaurant', () => {
    it('should fetch restaurant data', async () => {
      const mockRestaurant = { id: '1', name: 'Test Restaurant' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockRestaurant });

      const result = await ApiService.getRestaurant('1');

      expect(result).toEqual(mockRestaurant);
      expect(mockedAxios.get).toHaveBeenCalledWith('/restaurants/1');
    });

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiService.getRestaurant('1')).rejects.toThrow('Network error');
    });
  });

  describe('getRestaurantMenu', () => {
    it('should fetch menu items', async () => {
      const mockMenu = [{ id: '1', name: 'Pizza' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockMenu });

      const result = await ApiService.getRestaurantMenu('1');

      expect(result).toEqual(mockMenu);
    });
  });

  describe('createReservation', () => {
    it('should create a reservation', async () => {
      const reservationData = {
        restaurant_id: '1',
        party_size: 4,
        reservation_time: new Date().toISOString(),
      };
      const mockReservation = { id: 'res-1', ...reservationData };
      mockedAxios.post.mockResolvedValueOnce({ data: mockReservation });

      const result = await ApiService.createReservation(reservationData);

      expect(result).toEqual(mockReservation);
      expect(mockedAxios.post).toHaveBeenCalledWith('/reservations', reservationData);
    });
  });

  describe('processPayment', () => {
    it('should process payment', async () => {
      const paymentData = {
        order_id: 'order-1',
        amount: 99.99,
        payment_method: 'credit_card',
      };
      const mockPayment = { id: 'payment-1', status: 'completed' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockPayment });

      const result = await ApiService.processPayment(paymentData);

      expect(result).toEqual(mockPayment);
      expect(mockedAxios.post).toHaveBeenCalledWith('/payments', paymentData);
    });
  });
});
