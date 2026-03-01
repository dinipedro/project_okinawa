import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure Storage Service
 *
 * Uses Expo SecureStore for sensitive data (tokens, passwords)
 * and AsyncStorage for non-sensitive data (preferences, cache)
 */

// Keys for secure storage
const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  USER_EMAIL: 'user_email',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

// Keys for regular storage
const STORAGE_KEYS = {
  USER: 'user',
  CART: 'cart',
  PREFERENCES: 'preferences',
  THEME: 'theme',
} as const;

class SecureStorageService {
  // Secure storage methods (for sensitive data)

  async setSecure(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error saving ${key} to secure storage:`, error);
      throw error;
    }
  }

  async getSecure(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error(`Error reading ${key} from secure storage:`, error);
      return null;
    }
  }

  async deleteSecure(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error deleting ${key} from secure storage:`, error);
    }
  }

  // Token management (secure)

  async setAccessToken(token: string): Promise<void> {
    return this.setSecure(SECURE_KEYS.ACCESS_TOKEN, token);
  }

  async getAccessToken(): Promise<string | null> {
    return this.getSecure(SECURE_KEYS.ACCESS_TOKEN);
  }

  async setRefreshToken(token: string): Promise<void> {
    return this.setSecure(SECURE_KEYS.REFRESH_TOKEN, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getSecure(SECURE_KEYS.REFRESH_TOKEN);
  }

  async setUserId(userId: string): Promise<void> {
    return this.setSecure(SECURE_KEYS.USER_ID, userId);
  }

  async getUserId(): Promise<string | null> {
    return this.getSecure(SECURE_KEYS.USER_ID);
  }

  async setUserEmail(email: string): Promise<void> {
    return this.setSecure(SECURE_KEYS.USER_EMAIL, email);
  }

  async getUserEmail(): Promise<string | null> {
    return this.getSecure(SECURE_KEYS.USER_EMAIL);
  }

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    return this.setSecure(SECURE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
  }

  async getBiometricEnabled(): Promise<boolean> {
    const value = await this.getSecure(SECURE_KEYS.BIOMETRIC_ENABLED);
    return value === 'true';
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      this.deleteSecure(SECURE_KEYS.ACCESS_TOKEN),
      this.deleteSecure(SECURE_KEYS.REFRESH_TOKEN),
      this.deleteSecure(SECURE_KEYS.USER_ID),
      this.deleteSecure(SECURE_KEYS.USER_EMAIL),
      this.deleteSecure(SECURE_KEYS.BIOMETRIC_ENABLED),
    ]);
  }

  // Regular storage methods (for non-sensitive data)

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }

  // User data management (non-sensitive)

  async setUser(user: object): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  async getUser(): Promise<object | null> {
    const userStr = await this.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  async clearUser(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.USER);
  }

  // Cart management

  async setCart(cart: object): Promise<void> {
    return this.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }

  async getCart(): Promise<object | null> {
    const cartStr = await this.getItem(STORAGE_KEYS.CART);
    return cartStr ? JSON.parse(cartStr) : null;
  }

  async clearCart(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.CART);
  }

  // Clear all data (logout)

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearTokens(),
      this.clearUser(),
      this.clearCart(),
      AsyncStorage.multiRemove([
        STORAGE_KEYS.PREFERENCES,
        STORAGE_KEYS.THEME,
      ]),
    ]);
  }

  // Clear auth data only (for logout)
  async clearAuth(): Promise<void> {
    await Promise.all([
      this.clearTokens(),
      this.clearUser(),
    ]);
  }
}

export const secureStorage = new SecureStorageService();
export { SECURE_KEYS, STORAGE_KEYS };
