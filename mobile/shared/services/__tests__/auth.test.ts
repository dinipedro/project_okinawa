import { authService } from '../auth';
import axios from 'axios';
import { secureStorage } from '../storage';

jest.mock('axios');
jest.mock('../storage');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', role: 'customer' },
        access_token: 'token123',
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(secureStorage.setAccessToken).toHaveBeenCalledWith('token123');
    });

    it('should handle login errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });

      await expect(authService.login('test@example.com', 'wrong')).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        user: { id: '1', email: 'new@example.com', role: 'customer' },
        access_token: 'token456',
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.register('new@example.com', 'password123', 'John Doe');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        full_name: 'John Doe',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await authService.logout();

      expect(secureStorage.clearAll).toHaveBeenCalled();
    });
  });
});
