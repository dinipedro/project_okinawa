/**
 * Okinawa Design System - Shadow System
 * Platform-specific shadow definitions with iOS and Android support
 */

import { Platform, ViewStyle } from 'react-native';

// Shadow definitions (iOS style shadows)
interface ShadowDefinition {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Android
}

// Create platform-aware shadow
const createShadow = (
  color: string,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number
): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: Platform.OS === 'android' ? elevation : 0,
});

// Shadow scale
export const shadows = {
  // No shadow
  none: createShadow('#000', 0, 0, 0, 0),
  
  // Subtle shadow
  xs: createShadow('#000', 1, 0.05, 2, 1),
  
  // Small shadow
  sm: createShadow('#000', 2, 0.1, 4, 2),
  
  // Medium shadow
  md: createShadow('#000', 4, 0.12, 8, 4),
  
  // Large shadow
  lg: createShadow('#000', 8, 0.15, 16, 8),
  
  // Extra large shadow
  xl: createShadow('#000', 12, 0.18, 24, 12),
  
  // 2XL shadow
  '2xl': createShadow('#000', 16, 0.2, 32, 16),
  
  // Inner shadow (simulated)
  inner: createShadow('#000', -1, 0.1, 4, 0),
};

// Component-specific shadows
export const componentShadows = {
  // Card shadows
  card: createShadow('#000', 4, 0.08, 12, 4),
  cardElevated: createShadow('#000', 6, 0.12, 16, 6),
  cardHover: createShadow('#000', 8, 0.12, 20, 8),
  cardActive: createShadow('#000', 2, 0.06, 6, 2),
  
  // Button shadows
  button: createShadow('#000', 2, 0.1, 6, 3),
  buttonPressed: createShadow('#000', 1, 0.08, 2, 1),
  
  // Primary button glow (orange)
  buttonPrimaryGlow: createShadow('#EA580C', 4, 0.4, 16, 6),
  buttonPrimaryGlowIntense: createShadow('#EA580C', 6, 0.5, 24, 8),
  
  // Secondary button glow (teal)
  buttonSecondaryGlow: createShadow('#0D9488', 4, 0.3, 16, 6),
  
  // Input shadows
  input: createShadow('#000', 2, 0.05, 4, 2),
  inputFocus: createShadow('#EA580C', 0, 0.15, 8, 4),
  
  // Modal / Bottom sheet shadows
  modal: createShadow('#000', -8, 0.15, 24, 12),
  bottomSheet: createShadow('#000', -4, 0.1, 20, 10),
  
  // Navigation shadows
  header: createShadow('#000', 2, 0.08, 8, 4),
  tabBar: createShadow('#000', -2, 0.08, 8, 4),
  
  // Liquid Glass Navigation
  liquidGlass: {
    ...createShadow('#000', 8, 0.12, 32, 8),
    // Additional inner glow effect handled separately
  },
  
  // Floating action button
  fab: createShadow('#000', 6, 0.2, 16, 8),
  fabPressed: createShadow('#000', 2, 0.15, 8, 4),
  
  // Toast / Snackbar
  toast: createShadow('#000', 4, 0.15, 12, 6),
  
  // Dropdown / Popover
  dropdown: createShadow('#000', 4, 0.12, 16, 8),
  
  // Avatar with border
  avatar: createShadow('#000', 2, 0.1, 8, 3),
  
  // Image cards
  imageCard: createShadow('#000', 8, 0.15, 20, 8),
};

// Glow effects (colored shadows)
export const glowEffects = {
  // Primary orange glow
  primarySoft: createShadow('#EA580C', 0, 0.2, 16, 4),
  primaryMedium: createShadow('#EA580C', 0, 0.35, 24, 6),
  primaryIntense: createShadow('#EA580C', 0, 0.5, 40, 10),
  
  // Secondary teal glow
  secondarySoft: createShadow('#0D9488', 0, 0.2, 16, 4),
  secondaryMedium: createShadow('#0D9488', 0, 0.35, 24, 6),
  
  // Accent gold glow
  accentSoft: createShadow('#F59E0B', 0, 0.2, 16, 4),
  accentMedium: createShadow('#F59E0B', 0, 0.35, 24, 6),
  
  // Success glow
  successSoft: createShadow('#10B981', 0, 0.2, 16, 4),
  
  // Error glow
  errorSoft: createShadow('#EF4444', 0, 0.2, 16, 4),
  
  // Info glow
  infoSoft: createShadow('#3B82F6', 0, 0.2, 16, 4),
};

export type ShadowKey = keyof typeof shadows;
export type ComponentShadowKey = keyof typeof componentShadows;
export type GlowEffectKey = keyof typeof glowEffects;
