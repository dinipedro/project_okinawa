/**
 * Okinawa Firebase Analytics Configuration
 * 
 * Centralized analytics configuration and event tracking utilities.
 * Uses Firebase Analytics for comprehensive user behavior tracking.
 * 
 * @module shared/config/analytics
 */

import { ENV, isDevelopment } from './env';

// ============================================================
// ANALYTICS CONFIGURATION
// ============================================================

/**
 * Analytics configuration based on environment
 */
export const ANALYTICS_CONFIG = {
  enabled: ENV.ANALYTICS_ENABLED,
  debug: ENV.ANALYTICS_DEBUG,
  
  // Firebase configuration
  firebase: {
    projectId: ENV.FIREBASE_PROJECT_ID,
    appId: ENV.FIREBASE_APP_ID,
    apiKey: ENV.FIREBASE_API_KEY,
    messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  },
  
  // Session configuration
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes
    minimumDuration: 10 * 1000, // 10 seconds
  },
  
  // User properties to track
  userProperties: [
    'user_tier', // bronze, silver, gold, platinum
    'preferred_language',
    'preferred_payment_method',
    'notification_enabled',
    'biometric_enabled',
  ],
};

// ============================================================
// EVENT NAMES (Standard Firebase Events)
// ============================================================

/**
 * Standard Firebase Analytics event names
 * These follow Firebase's recommended naming conventions
 */
export const ANALYTICS_EVENTS = {
  // User Lifecycle Events
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Onboarding Events
  TUTORIAL_BEGIN: 'tutorial_begin',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  
  // App Engagement
  APP_OPEN: 'app_open',
  SESSION_START: 'session_start',
  SCREEN_VIEW: 'screen_view',
  
  // Restaurant Discovery
  SEARCH: 'search',
  VIEW_ITEM: 'view_item', // View restaurant
  VIEW_ITEM_LIST: 'view_item_list', // View restaurant list
  SELECT_CONTENT: 'select_content', // Select restaurant from list
  
  // Menu & Cart
  VIEW_MENU: 'view_menu',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_CART: 'view_cart',
  
  // Checkout & Payment
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_PAYMENT_INFO: 'add_payment_info',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  
  // Reservation Events
  RESERVATION_START: 'reservation_start',
  RESERVATION_COMPLETE: 'reservation_complete',
  RESERVATION_CANCEL: 'reservation_cancel',
  
  // Order Events
  ORDER_PLACED: 'order_placed',
  ORDER_TRACKED: 'order_tracked',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled',
  
  // QR Code Events
  QR_SCAN_START: 'qr_scan_start',
  QR_SCAN_SUCCESS: 'qr_scan_success',
  QR_SCAN_FAILURE: 'qr_scan_failure',
  
  // Interaction Events
  CALL_WAITER: 'call_waiter',
  CALL_MANAGER: 'call_manager',
  REQUEST_BILL: 'request_bill',
  
  // Loyalty Events
  EARN_POINTS: 'earn_virtual_currency',
  SPEND_POINTS: 'spend_virtual_currency',
  TIER_UPGRADE: 'tier_upgrade',
  REWARD_REDEEMED: 'reward_redeemed',
  
  // Review Events
  REVIEW_START: 'review_start',
  REVIEW_SUBMIT: 'review_submit',
  
  // Share Events
  SHARE: 'share',
  INVITE_FRIEND: 'invite_friend',
  
  // Feature Usage
  FEATURE_USE: 'feature_use',
  AI_SUGGESTION_VIEW: 'ai_suggestion_view',
  AI_SUGGESTION_ACCEPT: 'ai_suggestion_accept',
  DISH_BUILDER_START: 'dish_builder_start',
  DISH_BUILDER_COMPLETE: 'dish_builder_complete',
  
  // Error Events
  ERROR: 'app_error',
  API_ERROR: 'api_error',
  
  // Restaurant App Specific
  SHIFT_START: 'shift_start',
  SHIFT_END: 'shift_end',
  ORDER_ACCEPT: 'order_accept',
  ORDER_REJECT: 'order_reject',
  ITEM_PREPARED: 'item_prepared',
  TABLE_STATUS_CHANGE: 'table_status_change',
};

// ============================================================
// USER PROPERTY NAMES
// ============================================================

export const USER_PROPERTIES = {
  USER_ID: 'user_id',
  USER_TIER: 'user_tier',
  ACCOUNT_AGE_DAYS: 'account_age_days',
  TOTAL_ORDERS: 'total_orders',
  TOTAL_SPENT: 'total_spent',
  PREFERRED_CUISINE: 'preferred_cuisine',
  PREFERRED_PAYMENT: 'preferred_payment',
  LANGUAGE: 'language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  RESTAURANT_ID: 'restaurant_id', // For restaurant app
  STAFF_ROLE: 'staff_role', // For restaurant app
};

// ============================================================
// ANALYTICS SERVICE
// ============================================================

/**
 * Analytics Service for tracking events and user properties
 */
class AnalyticsService {
  private initialized = false;
  private userId: string | null = null;
  private userProperties: Record<string, any> = {};
  
  /**
   * Initialize analytics
   * Call this in your app's entry point
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (!ANALYTICS_CONFIG.enabled) {
      console.log('[Analytics] Disabled in this environment');
      return;
    }
    
    try {
      // In a real implementation, this would initialize Firebase
      // await analytics().setAnalyticsCollectionEnabled(true);
      
      this.initialized = true;
      console.log('[Analytics] Initialized successfully');
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
    }
  }
  
  /**
   * Set the current user ID for analytics
   */
  async setUserId(userId: string | null): Promise<void> {
    if (!this.checkEnabled()) return;
    
    this.userId = userId;
    // await analytics().setUserId(userId);
    
    if (isDevelopment) {
      console.log('[Analytics] User ID set:', userId);
    }
  }
  
  /**
   * Set a user property
   */
  async setUserProperty(name: string, value: string): Promise<void> {
    if (!this.checkEnabled()) return;
    
    this.userProperties[name] = value;
    // await analytics().setUserProperty(name, value);
    
    if (isDevelopment) {
      console.log('[Analytics] User property set:', name, value);
    }
  }
  
  /**
   * Set multiple user properties
   */
  async setUserProperties(properties: Record<string, string>): Promise<void> {
    if (!this.checkEnabled()) return;
    
    for (const [name, value] of Object.entries(properties)) {
      await this.setUserProperty(name, value);
    }
  }
  
  /**
   * Log an analytics event
   */
  async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
    if (!this.checkEnabled()) return;
    
    const eventParams = {
      ...params,
      timestamp: new Date().toISOString(),
    };
    
    // await analytics().logEvent(eventName, eventParams);
    
    if (isDevelopment || ANALYTICS_CONFIG.debug) {
      console.log('[Analytics] Event:', eventName, eventParams);
    }
  }
  
  /**
   * Log screen view event
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    await this.logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }
  
  /**
   * Log search event
   */
  async logSearch(searchTerm: string, category?: string): Promise<void> {
    await this.logEvent(ANALYTICS_EVENTS.SEARCH, {
      search_term: searchTerm,
      category: category,
    });
  }
  
  /**
   * Log purchase event (E-commerce)
   */
  async logPurchase(
    orderId: string,
    amount: number,
    currency: string = 'BRL',
    items?: Array<{ id: string; name: string; quantity: number; price: number }>
  ): Promise<void> {
    await this.logEvent(ANALYTICS_EVENTS.PURCHASE, {
      transaction_id: orderId,
      value: amount,
      currency: currency,
      items: items,
    });
  }
  
  /**
   * Log add to cart event
   */
  async logAddToCart(
    itemId: string,
    itemName: string,
    quantity: number,
    price: number
  ): Promise<void> {
    await this.logEvent(ANALYTICS_EVENTS.ADD_TO_CART, {
      item_id: itemId,
      item_name: itemName,
      quantity: quantity,
      price: price,
      value: quantity * price,
      currency: 'BRL',
    });
  }
  
  /**
   * Log reservation event
   */
  async logReservation(
    action: 'start' | 'complete' | 'cancel',
    restaurantId: string,
    partySize: number
  ): Promise<void> {
    const eventName = {
      start: ANALYTICS_EVENTS.RESERVATION_START,
      complete: ANALYTICS_EVENTS.RESERVATION_COMPLETE,
      cancel: ANALYTICS_EVENTS.RESERVATION_CANCEL,
    }[action];
    
    await this.logEvent(eventName, {
      restaurant_id: restaurantId,
      party_size: partySize,
    });
  }
  
  /**
   * Log error event
   */
  async logError(
    errorType: string,
    errorMessage: string,
    errorStack?: string
  ): Promise<void> {
    await this.logEvent(ANALYTICS_EVENTS.ERROR, {
      error_type: errorType,
      error_message: errorMessage,
      error_stack: errorStack?.substring(0, 500), // Limit stack trace length
    });
  }
  
  /**
   * Log feature usage
   */
  async logFeatureUse(featureName: string, metadata?: Record<string, any>): Promise<void> {
    await this.logEvent(ANALYTICS_EVENTS.FEATURE_USE, {
      feature_name: featureName,
      ...metadata,
    });
  }
  
  /**
   * Check if analytics is enabled and initialized
   */
  private checkEnabled(): boolean {
    if (!ANALYTICS_CONFIG.enabled) {
      return false;
    }
    
    if (!this.initialized) {
      console.warn('[Analytics] Not initialized. Call initialize() first.');
      return false;
    }
    
    return true;
  }
  
  /**
   * Reset analytics (for logout)
   */
  async reset(): Promise<void> {
    this.userId = null;
    this.userProperties = {};
    // await analytics().resetAnalyticsData();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// ============================================================
// ANALYTICS HOOKS
// ============================================================

/**
 * Hook for logging screen views
 * Use this in your screen components
 */
export const useAnalyticsScreen = (screenName: string) => {
  // In a real implementation, this would use useEffect to log screen view
  analytics.logScreenView(screenName);
};

/**
 * Track timing for performance analytics
 */
export const trackTiming = (
  category: string,
  name: string,
  startTime: number
): void => {
  const duration = Date.now() - startTime;
  analytics.logEvent('timing_complete', {
    category,
    name,
    duration_ms: duration,
  });
};

// ============================================================
// ANALYTICS MIDDLEWARE
// ============================================================

/**
 * Navigation analytics middleware
 * Attach this to your navigation container
 */
export const navigationAnalyticsMiddleware = {
  onStateChange: (state: any) => {
    if (!state) return;
    
    // Get current route name
    const getActiveRoute = (state: any): string => {
      if (!state.routes || state.routes.length === 0) return 'Unknown';
      
      const route = state.routes[state.index];
      if (route.state) {
        return getActiveRoute(route.state);
      }
      return route.name;
    };
    
    const screenName = getActiveRoute(state);
    analytics.logScreenView(screenName);
  },
};

export default analytics;
