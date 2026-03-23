import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';
import logger from './logger';

/**
 * Deep Linking Configuration
 *
 * Supported URL patterns:
 * - okinawa://restaurant/:id - View restaurant details
 * - okinawa://menu/:restaurantId - View restaurant menu
 * - okinawa://order/:orderId - View order details
 * - okinawa://reservation/:reservationId - View reservation
 * - okinawa://qr/:tableId - Scan QR code and navigate to table
 *
 * Universal Links:
 * - https://okinawa.app/restaurant/:id
 * - https://okinawa.app/menu/:restaurantId
 * - https://okinawa.app/order/:orderId
 * - https://okinawa.app/reservation/:reservationId
 */

export interface DeepLinkParams {
  path: string;
  params?: Record<string, string>;
}

/**
 * Parse deep link URL and extract path and params
 */
export const parseDeepLink = (url: string): DeepLinkParams | null => {
  try {
    const parsed = Linking.parse(url);
    logger.debug('Deep link parsed:', parsed);

    return {
      path: parsed.path || '',
      params: parsed.queryParams as Record<string, string>,
    };
  } catch (error) {
    logger.error('Error parsing deep link:', error);
    return null;
  }
};

/**
 * Handle deep link navigation
 */
export const handleDeepLink = (url: string): void => {
  const parsed = parseDeepLink(url);
  if (!parsed) {
    logger.warn('Invalid deep link:', url);
    return;
  }

  const { path, params } = parsed;
  logger.info('Handling deep link:', { path, params });

  // Route based on path
  if (path.startsWith('restaurant/')) {
    const restaurantId = path.split('/')[1];
    router.push(`/restaurant/${restaurantId}`);
  } else if (path.startsWith('menu/')) {
    const restaurantId = path.split('/')[1];
    router.push(`/menu/${restaurantId}`);
  } else if (path.startsWith('order/')) {
    const orderId = path.split('/')[1];
    router.push(`/orders/${orderId}`);
  } else if (path.startsWith('reservation/')) {
    const reservationId = path.split('/')[1];
    router.push(`/reservations/${reservationId}`);
  } else if (path.startsWith('qr/')) {
    const tableId = path.split('/')[1];
    router.push(`/qr/${tableId}`);
  } else {
    logger.warn('Unknown deep link path:', path);
  }
};

/**
 * Initialize deep linking listeners
 */
export const initDeepLinking = (): (() => void) => {
  // Handle initial URL (app opened from deep link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      logger.info('App opened with URL:', url);
      handleDeepLink(url);
    }
  });

  // Handle incoming URLs (app already running)
  const subscription = Linking.addEventListener('url', (event) => {
    logger.info('Received deep link:', event.url);
    handleDeepLink(event.url);
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
};

/**
 * Create deep link URL
 */
export const createDeepLink = (
  path: string,
  params?: Record<string, string>
): string => {
  const prefix = Linking.createURL('/');
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return `${prefix}${path}${queryString}`;
};

/**
 * Share deep link (for social sharing, etc)
 * Uses expo-sharing for native share sheet
 */
export const shareDeepLink = async (
  path: string,
  params?: Record<string, string>,
  message?: string
): Promise<void> => {
  const url = createDeepLink(path, params);
  logger.info('Sharing deep link:', url);

  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      // Use native share dialog
      await Sharing.shareAsync(url, {
        dialogTitle: 'Compartilhar Link',
        mimeType: 'text/plain',
      });
    } else {
      // Fallback: Copy to clipboard and show alert
      Alert.alert(
        'Compartilhar',
        `Link copiado: ${url}`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    logger.error('Failed to share deep link:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar o link');
  }
};

/**
 * Deep link configuration for expo-router
 */
export const deepLinkConfig = {
  prefixes: [
    'okinawa://',
    'https://okinawa.app',
    'https://*.okinawa.app',
  ],
  config: {
    screens: {
      Restaurant: 'restaurant/:id',
      Menu: 'menu/:restaurantId',
      Order: 'orders/:orderId',
      Reservation: 'reservations/:reservationId',
      QRScanner: 'qr/:tableId',
    },
  },
};

export default {
  parseDeepLink,
  handleDeepLink,
  initDeepLinking,
  createDeepLink,
  shareDeepLink,
  deepLinkConfig,
};
