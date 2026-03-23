/**
 * Test Setup for Shared Components
 * 
 * Configures Vitest for React Native component testing.
 * 
 * @module shared/components/__tests__/setup
 */

import { vi } from 'vitest';

// Mock React Native
vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  Image: 'Image',
  StyleSheet: {
    create: (styles: any) => styles,
    absoluteFillObject: {},
  },
  Animated: {
    View: 'Animated.View',
    Value: class {
      constructor(val: number) {
        this.value = val;
      }
      value: number;
      interpolate = () => 'interpolated';
    },
    timing: () => ({ start: vi.fn() }),
    spring: () => ({ start: vi.fn() }),
  },
  Platform: { OS: 'ios' },
  ActivityIndicator: 'ActivityIndicator',
  Easing: {
    out: (fn: any) => fn,
    ease: (t: number) => t,
  },
  useColorScheme: () => 'light',
}));

// Mock Expo modules
vi.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

vi.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
  selectionAsync: vi.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

vi.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: vi.fn(),
  hideAsync: vi.fn(),
}));

// Mock navigation
vi.mock('@react-navigation/native', () => ({
  NavigationContainer: 'NavigationContainer',
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

vi.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

vi.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

vi.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
}));

// Global test helpers
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

export {};
