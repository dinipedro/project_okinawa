/**
 * Haptic Feedback Utilities for Project Okinawa
 * 
 * Provides consistent haptic feedback across the application
 * for enhanced user experience and tactile responses.
 * 
 * @module utils/haptics
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import logger from './logger';

// ============================================
// TYPES
// ============================================

export type HapticFeedbackType = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

export type NotificationFeedbackType = 'success' | 'warning' | 'error';

// ============================================
// CONFIGURATION
// ============================================

let hapticsEnabled = true;

/**
 * Enable or disable haptic feedback globally
 */
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
  logger.debug('[Haptics] Haptics enabled:', enabled);
}

/**
 * Check if haptics are enabled
 */
export function isHapticsEnabled(): boolean {
  return hapticsEnabled && Platform.OS !== 'web';
}

// ============================================
// IMPACT FEEDBACK
// ============================================

/**
 * Trigger light impact feedback
 * Use for: small interactions, toggles, list selections
 */
export async function lightImpact(): Promise<void> {
  if (!isHapticsEnabled()) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    logger.warn('[Haptics] Light impact failed:', error);
  }
}

/**
 * Trigger medium impact feedback
 * Use for: button presses, card taps, confirmations
 */
export async function mediumImpact(): Promise<void> {
  if (!isHapticsEnabled()) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    logger.warn('[Haptics] Medium impact failed:', error);
  }
}

/**
 * Trigger heavy impact feedback
 * Use for: significant actions, destructive operations, major confirmations
 */
export async function heavyImpact(): Promise<void> {
  if (!isHapticsEnabled()) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    logger.warn('[Haptics] Heavy impact failed:', error);
  }
}

// ============================================
// NOTIFICATION FEEDBACK
// ============================================

/**
 * Trigger success notification feedback
 * Use for: successful operations, completed tasks, positive confirmations
 */
export async function successNotification(): Promise<void> {
  if (!isHapticsEnabled()) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    logger.warn('[Haptics] Success notification failed:', error);
  }
}

/**
 * Trigger warning notification feedback
 * Use for: alerts, important notices, caution required
 */
export async function warningNotification(): Promise<void> {
  if (!isHapticsEnabled()) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    logger.warn('[Haptics] Warning notification failed:', error);
  }
}

/**
 * Trigger error notification feedback
 * Use for: failures, errors, validation issues
 */
export async function errorNotification(): Promise<void> {
  if (!isHapticsEnabled()) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    logger.warn('[Haptics] Error notification failed:', error);
  }
}

// ============================================
// SELECTION FEEDBACK
// ============================================

/**
 * Trigger selection changed feedback
 * Use for: picker changes, slider movements, tab switches
 */
export async function selectionChanged(): Promise<void> {
  if (!isHapticsEnabled()) return;
  
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    logger.warn('[Haptics] Selection feedback failed:', error);
  }
}

// ============================================
// UNIFIED FEEDBACK INTERFACE
// ============================================

/**
 * Trigger haptic feedback by type
 * Provides a unified interface for all haptic feedback types
 */
export async function trigger(type: HapticFeedbackType): Promise<void> {
  switch (type) {
    case 'light':
      return lightImpact();
    case 'medium':
      return mediumImpact();
    case 'heavy':
      return heavyImpact();
    case 'success':
      return successNotification();
    case 'warning':
      return warningNotification();
    case 'error':
      return errorNotification();
    case 'selection':
      return selectionChanged();
    default:
      logger.warn('[Haptics] Unknown feedback type:', type);
  }
}

// ============================================
// CONTEXTUAL HELPERS
// ============================================

/**
 * Button press feedback
 */
export const buttonPress = mediumImpact;

/**
 * Tab switch feedback
 */
export const tabSwitch = selectionChanged;

/**
 * Form submission success
 */
export const formSuccess = successNotification;

/**
 * Form validation error
 */
export const formError = errorNotification;

/**
 * Item added to cart
 */
export const itemAdded = lightImpact;

/**
 * Order confirmed
 */
export const orderConfirmed = successNotification;

/**
 * Payment success
 */
export const paymentSuccess = successNotification;

/**
 * Payment failed
 */
export const paymentFailed = errorNotification;

/**
 * Delete action confirmation
 */
export const deleteConfirm = heavyImpact;

/**
 * Refresh/Pull action
 */
export const pullRefresh = lightImpact;

/**
 * Swipe action
 */
export const swipeAction = lightImpact;

/**
 * Long press action
 */
export const longPress = mediumImpact;

/**
 * QR code scanned
 */
export const qrScanned = successNotification;

/**
 * Notification received
 */
export const notificationReceived = lightImpact;

// ============================================
// DEFAULT EXPORT
// ============================================

const Haptic = {
  // Configuration
  setEnabled: setHapticsEnabled,
  isEnabled: isHapticsEnabled,
  
  // Impact feedback
  lightImpact,
  mediumImpact,
  heavyImpact,
  
  // Notification feedback
  successNotification,
  warningNotification,
  errorNotification,
  
  // Selection feedback
  selectionChanged,
  
  // Unified interface
  trigger,
  
  // Contextual helpers
  buttonPress,
  tabSwitch,
  formSuccess,
  formError,
  itemAdded,
  orderConfirmed,
  paymentSuccess,
  paymentFailed,
  deleteConfirm,
  pullRefresh,
  swipeAction,
  longPress,
  qrScanned,
  notificationReceived,
};

export default Haptic;
