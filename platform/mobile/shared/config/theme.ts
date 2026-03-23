/**
 * Centralized Theme Configuration for Project Okinawa
 * All colors, spacing, typography, and design tokens in one place
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#FFF5F0',
    100: '#FFE6D9',
    200: '#FFCBB3',
    300: '#FFB08C',
    400: '#FF9566',
    500: '#FF6B35', // Main primary color
    600: '#E55A2B',
    700: '#CC4A21',
    800: '#B33A17',
    900: '#992A0D',
  },

  // Secondary Colors
  secondary: {
    50: '#F0F7FF',
    100: '#E0EFFF',
    200: '#B8DBFF',
    300: '#8FC7FF',
    400: '#66B3FF',
    500: '#3D9FFF',
    600: '#2B8CE5',
    700: '#1A79CC',
    800: '#0A66B2',
    900: '#005399',
  },

  // Neutral/Gray Colors
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Semantic Colors
  success: {
    light: '#E8F5E9',
    main: '#4CAF50',
    dark: '#2E7D32',
    contrast: '#FFFFFF',
  },

  warning: {
    light: '#FFF8E1',
    main: '#FFC107',
    dark: '#FF8F00',
    contrast: '#000000',
  },

  error: {
    light: '#FFEBEE',
    main: '#F44336',
    dark: '#C62828',
    contrast: '#FFFFFF',
  },

  info: {
    light: '#E3F2FD',
    main: '#2196F3',
    dark: '#1565C0',
    contrast: '#FFFFFF',
  },

  // Order Status Colors
  orderStatus: {
    pending: '#FFC107',
    confirmed: '#2196F3',
    preparing: '#FF9800',
    ready: '#4CAF50',
    delivering: '#9C27B0',
    delivered: '#4CAF50',
    completed: '#4CAF50',
    cancelled: '#F44336',
  },

  // Reservation Status Colors
  reservationStatus: {
    pending: '#FFC107',
    confirmed: '#4CAF50',
    seated: '#2196F3',
    completed: '#9E9E9E',
    cancelled: '#F44336',
    no_show: '#FF5722',
  },

  // Table Status Colors
  tableStatus: {
    available: '#4CAF50',
    occupied: '#F44336',
    reserved: '#2196F3',
    cleaning: '#FFC107',
  },

  // KDS Priority Colors
  kdsPriority: {
    normal: '#4CAF50',
    rush: '#FF9800',
    vip: '#9C27B0',
    delayed: '#F44336',
  },

  // Background Colors
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    elevated: '#FFFFFF',
    dark: '#121212',
    darkPaper: '#1E1E1E',
  },

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // Divider
  divider: '#E0E0E0',
  dividerDark: '#424242',

  // Overlay
  overlay: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(0, 0, 0, 0.5)',
    darker: 'rgba(0, 0, 0, 0.7)',
  },
};

// ============================================
// SPACING
// ============================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
    hero: 40,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================
// BORDERS & RADIUS
// ============================================

export const borders = {
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },

  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 4,
  },
};

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// ============================================
// COMPONENT SIZES
// ============================================

export const componentSizes = {
  // Touch targets (minimum recommended: 44px)
  touchTarget: {
    min: 44,
    sm: 36,
    md: 44,
    lg: 52,
  },

  // Buttons
  button: {
    sm: { height: 32, paddingHorizontal: 12 },
    md: { height: 44, paddingHorizontal: 16 },
    lg: { height: 52, paddingHorizontal: 24 },
  },

  // Input fields
  input: {
    sm: { height: 36 },
    md: { height: 48 },
    lg: { height: 56 },
  },

  // Icons
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Avatar
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },

  // Cards
  card: {
    borderRadius: 12,
    padding: 16,
  },
};

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
};

// ============================================
// ANIMATION
// ============================================

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
  },
};

// ============================================
// THEME OBJECT
// ============================================

export const lightTheme = {
  colors: {
    primary: colors.primary[500],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[700],
    secondary: colors.secondary[500],
    background: colors.background.default,
    surface: colors.background.paper,
    error: colors.error.main,
    success: colors.success.main,
    warning: colors.warning.main,
    info: colors.info.main,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    textDisabled: colors.text.disabled,
    divider: colors.divider,
    ...colors,
  },
  spacing,
  typography,
  borders,
  shadows,
  componentSizes,
  zIndex,
  animation,
  isDark: false,
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: colors.primary[400],
    primaryLight: colors.primary[800],
    primaryDark: colors.primary[200],
    background: colors.background.dark,
    surface: colors.background.darkPaper,
    text: colors.text.inverse,
    textSecondary: colors.neutral[400],
    textDisabled: colors.neutral[600],
    divider: colors.dividerDark,
  },
  isDark: true,
};

// Default export
export default lightTheme;

// React Native Paper theme integration
export const paperLightTheme = {
  colors: {
    primary: colors.primary[500],
    accent: colors.secondary[500],
    background: colors.background.default,
    surface: colors.background.paper,
    error: colors.error.main,
    text: colors.text.primary,
    onSurface: colors.text.primary,
    disabled: colors.text.disabled,
    placeholder: colors.text.hint,
    backdrop: colors.overlay.dark,
    notification: colors.error.main,
  },
  roundness: borders.radius.md,
};

export const paperDarkTheme = {
  colors: {
    primary: colors.primary[400],
    accent: colors.secondary[400],
    background: colors.background.dark,
    surface: colors.background.darkPaper,
    error: colors.error.main,
    text: colors.text.inverse,
    onSurface: colors.text.inverse,
    disabled: colors.neutral[600],
    placeholder: colors.neutral[500],
    backdrop: colors.overlay.darker,
    notification: colors.error.main,
  },
  roundness: borders.radius.md,
};
