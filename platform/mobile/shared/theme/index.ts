/**
 * Okinawa Design System - Theme Entry Point
 * Modern Chic aesthetic with Warm Orange primary color
 * 
 * This design system provides:
 * - Semantic color tokens with light/dark mode support
 * - Typography scale with consistent hierarchy
 * - Spacing system based on 4px grid
 * - Shadow/elevation system
 * - Animation presets and timing functions
 */

// Export all theme modules
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './animations';

// Import for theme object construction
import { lightTheme, darkTheme, colorPalette, gradients } from './colors';
import { typography, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from './typography';
import { spacing, borderRadius, layout, zIndex } from './spacing';
import { shadows, componentShadows, glowEffects } from './shadows';
import { duration, easing, animationPresets } from './animations';

// Unified theme object for light mode
export const OkinawaLightTheme = {
  colors: lightTheme,
  palette: colorPalette,
  gradients,
  typography,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  spacing,
  borderRadius,
  layout,
  zIndex,
  shadows,
  componentShadows,
  glowEffects,
  duration,
  easing,
  animations: animationPresets,
  dark: false,
} as const;

// Unified theme object for dark mode
export const OkinawaDarkTheme = {
  colors: darkTheme,
  palette: colorPalette,
  gradients,
  typography,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  spacing,
  borderRadius,
  layout,
  zIndex,
  shadows,
  componentShadows,
  glowEffects,
  duration,
  easing,
  animations: animationPresets,
  dark: true,
} as const;

// Theme type
export type OkinawaTheme = typeof OkinawaLightTheme;

// Default export
export default OkinawaLightTheme;

// Migration helper: Convert old theme to new theme
// This helps existing components transition to the new design system
export const legacyThemeMapping = {
  // Old color names -> New semantic tokens
  primary: 'colors.primary',
  primaryLight: 'colors.primaryLight',
  primaryDark: 'colors.primaryDark',
  secondary: 'colors.secondary',
  accent: 'colors.accent',
  
  // Text colors
  text: 'colors.foreground',
  textSecondary: 'colors.foregroundSecondary',
  textMuted: 'colors.foregroundMuted',
  
  // Background colors
  white: 'colors.background',
  gray50: 'colors.backgroundSecondary',
  gray100: 'colors.backgroundTertiary',
  
  // Status colors
  success: 'colors.success',
  warning: 'colors.warning',
  error: 'colors.error',
  info: 'colors.info',
  
  // Border colors
  border: 'colors.border',
  divider: 'colors.borderLight',
  
  // Surface colors
  cardBackground: 'colors.card',
  inputBackground: 'colors.input',
};
