import { MD3LightTheme as DefaultTheme, MD3DarkTheme } from 'react-native-paper';

// Restaurant app uses purple as primary (different from client app)
export const colors = {
  primary: '#A855F7',
  primaryLight: '#C084FC',
  primaryDark: '#9333EA',
  secondary: '#FF6B35',
  secondaryLight: '#FF8F66',
  secondaryDark: '#E55A2B',
  accent: '#FFBF00',

  // Status colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',
  infoLight: '#60A5FA',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Specific use cases
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  cardBackground: '#FFFFFF',
  inputBackground: '#F9FAFB',

  // KDS specific colors
  kdsUrgent: '#EF4444',
  kdsHigh: '#F59E0B',
  kdsNormal: '#10B981',
  kdsNew: '#3B82F6',

  // Table status colors
  tableAvailable: '#10B981',
  tableOccupied: '#EF4444',
  tableReserved: '#3B82F6',
  tableCleaning: '#F59E0B',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.accent,
    background: colors.white,
    surface: colors.gray50,
    surfaceVariant: colors.gray100,
    error: colors.error,
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.text,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    elevation: {
      level0: 'transparent',
      level1: colors.white,
      level2: colors.gray50,
      level3: colors.gray100,
      level4: colors.gray100,
      level5: colors.gray200,
    },
  },
  custom: {
    success: colors.success,
    successLight: colors.successLight,
    warning: colors.warning,
    warningLight: colors.warningLight,
    info: colors.info,
    infoLight: colors.infoLight,
    textMuted: colors.textMuted,
    divider: colors.divider,
    cardBackground: colors.cardBackground,
    inputBackground: colors.inputBackground,
    backdrop: colors.backdrop,
    // KDS specific
    kdsUrgent: colors.kdsUrgent,
    kdsHigh: colors.kdsHigh,
    kdsNormal: colors.kdsNormal,
    kdsNew: colors.kdsNew,
    // Table status
    tableAvailable: colors.tableAvailable,
    tableOccupied: colors.tableOccupied,
    tableReserved: colors.tableReserved,
    tableCleaning: colors.tableCleaning,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.accent,
    background: colors.gray900,
    surface: colors.gray800,
    surfaceVariant: colors.gray700,
    error: colors.error,
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.gray100,
    onSurface: colors.gray100,
    onSurfaceVariant: colors.gray300,
    outline: colors.gray600,
    elevation: {
      level0: 'transparent',
      level1: colors.gray800,
      level2: colors.gray700,
      level3: colors.gray700,
      level4: colors.gray600,
      level5: colors.gray600,
    },
  },
  custom: {
    success: colors.success,
    successLight: colors.successLight,
    warning: colors.warning,
    warningLight: colors.warningLight,
    info: colors.info,
    infoLight: colors.infoLight,
    textMuted: colors.gray400,
    divider: colors.gray700,
    cardBackground: colors.gray800,
    inputBackground: colors.gray700,
    backdrop: colors.backdrop,
    // KDS specific
    kdsUrgent: colors.kdsUrgent,
    kdsHigh: colors.kdsHigh,
    kdsNormal: colors.kdsNormal,
    kdsNew: colors.kdsNew,
    // Table status
    tableAvailable: colors.tableAvailable,
    tableOccupied: colors.tableOccupied,
    tableReserved: colors.tableReserved,
    tableCleaning: colors.tableCleaning,
  },
};

export type AppTheme = typeof theme;
export type CustomColors = typeof theme.custom;
