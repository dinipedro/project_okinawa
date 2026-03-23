/**
 * Vitest Setup File for Restaurant App
 * 
 * Configures test environment with mocks for React Native modules,
 * Expo modules, and global utilities used across tests.
 * 
 * @module __tests__/setup
 */

import { vi, beforeAll, afterAll, beforeEach } from 'vitest';

// ============================================================
// REACT NATIVE MOCKS
// ============================================================

vi.mock('react-native', () => ({
  Platform: { OS: 'ios', select: vi.fn() },
  StyleSheet: { create: (styles: any) => styles },
  Dimensions: { get: () => ({ width: 768, height: 1024 }) },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  Image: 'Image',
  TextInput: 'TextInput',
  ActivityIndicator: 'ActivityIndicator',
  FlatList: 'FlatList',
  Switch: 'Switch',
  Share: { share: vi.fn() },
  Alert: { alert: vi.fn() },
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    currentState: 'active',
  },
  Vibration: { vibrate: vi.fn() },
}));

// ============================================================
// EXPO MODULE MOCKS
// ============================================================

vi.mock('expo-camera', () => ({
  requestCameraPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  Camera: 'Camera',
  CameraView: 'CameraView',
  useCameraPermissions: vi.fn(() => [{ status: 'granted' }, vi.fn()]),
}));

vi.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: 'SafeAreaProvider',
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// ============================================================
// STORAGE MOCKS
// ============================================================

vi.mock('@react-native-async-storage/async-storage', () => ({
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}));

vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

// ============================================================
// NAVIGATION MOCKS
// ============================================================

vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: vi.fn(),
    setOptions: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: vi.fn(),
}));

// ============================================================
// WEBSOCKET MOCKS
// ============================================================

(globalThis as any).WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
}));

// ============================================================
// FETCH MOCKS
// ============================================================

(globalThis as any).fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// ============================================================
// CONSOLE MOCKS
// ============================================================

const originalConsole = { ...console };

beforeAll(() => {
  console.log = vi.fn();
  console.info = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
});

// ============================================================
// GLOBAL TEST UTILITIES
// ============================================================

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockNavigation = {
  navigate: vi.fn(),
  goBack: vi.fn(),
  setOptions: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatch: vi.fn(),
  reset: vi.fn(),
  canGoBack: vi.fn(() => true),
};

export const mockRoute = (params: any = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

export const mockRestaurant = {
  id: 'rest-123',
  name: 'Test Restaurant',
  description: 'A test restaurant',
  cuisine_type: ['Italian', 'Pizza'],
  address: '123 Test St',
  city: 'São Paulo',
  state: 'SP',
  phone: '(11) 99999-9999',
  email: 'test@restaurant.com',
  is_active: true,
};

export const mockStaffMember = {
  id: 'staff-123',
  user_id: 'user-123',
  restaurant_id: 'rest-123',
  role: 'manager',
  status: 'active',
  permissions: ['orders', 'reservations', 'menu'],
};

// ============================================================
// RESET MOCKS BETWEEN TESTS
// ============================================================

beforeEach(() => {
  vi.clearAllMocks();
});

console.log = originalConsole.log;
console.log('✅ Restaurant App test environment configured');
