/**
 * Okinawa Splash Screen Configuration
 * 
 * Configuration and utilities for managing splash screens in both apps.
 * Uses expo-splash-screen for native splash screen management.
 * 
 * @module shared/config/splash
 */

import * as SplashScreen from 'expo-splash-screen';
import { Animated, Easing } from 'react-native';

/**
 * Splash screen configuration for Client App
 */
export const CLIENT_SPLASH_CONFIG = {
  // Image path (relative to app root)
  image: './assets/splash.png',
  
  // Background color (Primary orange)
  backgroundColor: '#EA580C',
  
  // Resize mode
  resizeMode: 'contain' as const,
  
  // Animation settings
  animation: {
    fadeOutDuration: 400,
    scaleFrom: 1,
    scaleTo: 1.1,
  },
};

/**
 * Splash screen configuration for Restaurant App
 */
export const RESTAURANT_SPLASH_CONFIG = {
  // Image path (relative to app root)
  image: './assets/splash-restaurant.png',
  
  // Background color (Secondary teal)
  backgroundColor: '#0D9488',
  
  // Resize mode
  resizeMode: 'contain' as const,
  
  // Animation settings
  animation: {
    fadeOutDuration: 400,
    scaleFrom: 1,
    scaleTo: 1.1,
  },
};

/**
 * Keep splash screen visible while loading resources
 * Call this at the very start of your app
 */
export const preventAutoHide = async (): Promise<void> => {
  try {
    await SplashScreen.preventAutoHideAsync();
  } catch (error) {
    // Ignore errors - splash screen might already be hidden
    console.warn('Splash screen preventAutoHide warning:', error);
  }
};

/**
 * Hide splash screen with optional animation
 * Call this after your app is ready to display
 */
export const hideSplashScreen = async (): Promise<void> => {
  try {
    await SplashScreen.hideAsync();
  } catch (error) {
    // Ignore errors - splash screen might already be hidden
    console.warn('Splash screen hide warning:', error);
  }
};

/**
 * Animated splash screen hook
 * Returns animation values for custom splash screen transitions
 */
export const useAnimatedSplash = () => {
  const opacity = new Animated.Value(1);
  const scale = new Animated.Value(1);

  const animateOut = (callback?: () => void): void => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback?.();
    });
  };

  return {
    opacity,
    scale,
    animateOut,
  };
};

/**
 * Asset specifications for splash screens
 * Use these specifications when creating splash screen assets
 */
export const SPLASH_ASSET_SPECS = {
  client: {
    // Main splash image
    splash: {
      width: 1242,
      height: 2688,
      format: 'PNG',
      description: 'Main splash screen with Okinawa logo centered',
    },
    // iOS Launch Screen storyboard assets
    launchScreen: {
      logo: {
        width: 200,
        height: 200,
        format: 'PNG',
        description: 'Centered logo for launch screen',
      },
    },
  },
  restaurant: {
    splash: {
      width: 1242,
      height: 2688,
      format: 'PNG',
      description: 'Restaurant app splash with teal background',
    },
    launchScreen: {
      logo: {
        width: 200,
        height: 200,
        format: 'PNG',
        description: 'Restaurant logo for launch screen',
      },
    },
  },
};

/**
 * Expo splash screen configuration (for app.json/app.config.js)
 */
export const EXPO_SPLASH_CONFIG = {
  client: {
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#EA580C',
    },
    ios: {
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#EA580C',
        dark: {
          image: './assets/splash-dark.png',
          resizeMode: 'contain',
          backgroundColor: '#0D1117',
        },
      },
    },
    android: {
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#EA580C',
        dark: {
          image: './assets/splash-dark.png',
          resizeMode: 'contain',
          backgroundColor: '#0D1117',
        },
      },
    },
  },
  restaurant: {
    splash: {
      image: './assets/splash-restaurant.png',
      resizeMode: 'contain',
      backgroundColor: '#0D9488',
    },
    ios: {
      splash: {
        image: './assets/splash-restaurant.png',
        resizeMode: 'contain',
        backgroundColor: '#0D9488',
        dark: {
          image: './assets/splash-restaurant-dark.png',
          resizeMode: 'contain',
          backgroundColor: '#0D1117',
        },
      },
    },
    android: {
      splash: {
        image: './assets/splash-restaurant.png',
        resizeMode: 'contain',
        backgroundColor: '#0D9488',
        dark: {
          image: './assets/splash-restaurant-dark.png',
          resizeMode: 'contain',
          backgroundColor: '#0D1117',
        },
      },
    },
  },
};

export default {
  CLIENT_SPLASH_CONFIG,
  RESTAURANT_SPLASH_CONFIG,
  preventAutoHide,
  hideSplashScreen,
  useAnimatedSplash,
  SPLASH_ASSET_SPECS,
  EXPO_SPLASH_CONFIG,
};
