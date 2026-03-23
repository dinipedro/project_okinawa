/**
 * Shared Contexts Index
 * 
 * Central export point for all shared React contexts.
 * Import contexts from this file for cleaner imports.
 * 
 * @module contexts
 */

// Theme Context - provides light/dark mode support
export { ThemeProvider, useOkinawaTheme, useTheme, useColors } from './ThemeContext';

// Restaurant Context - provides restaurant authentication for Restaurant App
export { 
  RestaurantProvider, 
  useRestaurant, 
  useRestaurantId, 
  useRestaurantRole,
  type Restaurant,
  type StaffMember,
} from './RestaurantContext';

// Analytics Context - if exists
export * from './AnalyticsContext';

// Cart Context - if exists  
export * from './CartContext';
