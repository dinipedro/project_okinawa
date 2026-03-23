/**
 * Navigation Transition Animations for Project Okinawa
 * 
 * Custom screen transition configurations for a polished
 * and consistent user experience across both apps.
 * 
 * @module config/navigation-animations
 */

import { TransitionPresets, StackCardInterpolationProps } from '@react-navigation/stack';
import { Animated, Easing, Platform } from 'react-native';

// ============================================
// TIMING CONFIGURATIONS
// ============================================

export const TIMING = {
  fast: 200,
  normal: 300,
  slow: 400,
} as const;

// ============================================
// CUSTOM INTERPOLATORS
// ============================================

/**
 * Fade transition interpolator
 */
export const fadeInterpolator = ({ current }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

/**
 * Slide from right interpolator (default iOS-like)
 */
export const slideFromRightInterpolator = ({ current, layouts }: StackCardInterpolationProps) => ({
  cardStyle: {
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      },
    ],
  },
});

/**
 * Slide from bottom interpolator (modal-like)
 */
export const slideFromBottomInterpolator = ({ current, layouts }: StackCardInterpolationProps) => ({
  cardStyle: {
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.height, 0],
        }),
      },
    ],
  },
});

/**
 * Scale fade interpolator (elegant entry)
 */
export const scaleFadeInterpolator = ({ current }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    }),
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  },
});

/**
 * Slide and fade from right
 */
export const slideFadeFromRightInterpolator = ({ current, layouts }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
    }),
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width * 0.3, 0],
        }),
      },
    ],
  },
});

/**
 * Zoom in interpolator
 */
export const zoomInInterpolator = ({ current }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.5, 1],
    }),
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  },
});

// ============================================
// TRANSITION SPECS
// ============================================

/**
 * Default spring transition spec
 */
export const springTransitionSpec = {
  open: {
    animation: 'spring' as const,
    config: {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 10,
      restSpeedThreshold: 10,
    },
  },
  close: {
    animation: 'spring' as const,
    config: {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 10,
      restSpeedThreshold: 10,
    },
  },
};

/**
 * Timing-based transition spec
 */
export const timingTransitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: TIMING.normal,
      easing: Easing.out(Easing.cubic),
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: TIMING.fast,
      easing: Easing.in(Easing.cubic),
    },
  },
};

/**
 * Fast timing transition spec
 */
export const fastTimingTransitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: TIMING.fast,
      easing: Easing.out(Easing.cubic),
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: TIMING.fast,
      easing: Easing.in(Easing.cubic),
    },
  },
};

// ============================================
// COMPLETE SCREEN OPTIONS
// ============================================

/**
 * Default screen transition options
 * Smooth slide from right with fade
 */
export const defaultScreenOptions = {
  headerShown: false,
  cardStyleInterpolator: slideFadeFromRightInterpolator,
  transitionSpec: timingTransitionSpec,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
};

/**
 * Modal screen options
 * Slide from bottom
 */
export const modalScreenOptions = {
  headerShown: false,
  cardStyleInterpolator: slideFromBottomInterpolator,
  transitionSpec: timingTransitionSpec,
  gestureEnabled: true,
  gestureDirection: 'vertical' as const,
  presentation: 'modal' as const,
};

/**
 * Fade screen options
 * Simple fade transition
 */
export const fadeScreenOptions = {
  headerShown: false,
  cardStyleInterpolator: fadeInterpolator,
  transitionSpec: fastTimingTransitionSpec,
  gestureEnabled: false,
};

/**
 * Scale fade screen options
 * Elegant zoom with fade
 */
export const scaleFadeScreenOptions = {
  headerShown: false,
  cardStyleInterpolator: scaleFadeInterpolator,
  transitionSpec: timingTransitionSpec,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
};

/**
 * Zoom screen options
 * For detail screens and focus states
 */
export const zoomScreenOptions = {
  headerShown: false,
  cardStyleInterpolator: zoomInInterpolator,
  transitionSpec: timingTransitionSpec,
  gestureEnabled: true,
};

/**
 * No animation options
 * For instant transitions
 */
export const noAnimationOptions = {
  headerShown: false,
  animationEnabled: false,
  gestureEnabled: false,
};

// ============================================
// PLATFORM-SPECIFIC PRESETS
// ============================================

/**
 * Get default transition preset based on platform
 */
export function getPlatformTransitionPreset() {
  if (Platform.OS === 'ios') {
    return TransitionPresets.SlideFromRightIOS;
  }
  return TransitionPresets.FadeFromBottomAndroid;
}

/**
 * Get modal transition preset based on platform
 */
export function getPlatformModalPreset() {
  if (Platform.OS === 'ios') {
    return TransitionPresets.ModalPresentationIOS;
  }
  return TransitionPresets.ModalSlideFromBottomIOS;
}

// ============================================
// SCREEN TYPE CONFIGURATIONS
// ============================================

/**
 * Get screen options by screen type
 */
export function getScreenOptions(type: 'default' | 'modal' | 'fade' | 'zoom' | 'detail' | 'auth') {
  switch (type) {
    case 'modal':
      return modalScreenOptions;
    case 'fade':
      return fadeScreenOptions;
    case 'zoom':
      return zoomScreenOptions;
    case 'detail':
      return scaleFadeScreenOptions;
    case 'auth':
      return fadeScreenOptions;
    case 'default':
    default:
      return defaultScreenOptions;
  }
}

// ============================================
// TAB NAVIGATION ANIMATIONS
// ============================================

/**
 * Tab bar animation config
 */
export const tabBarAnimationConfig = {
  animation: 'spring',
  config: {
    stiffness: 1500,
    damping: 100,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

/**
 * Tab bar label animation
 */
export function createTabLabelAnimation(focused: boolean) {
  const value = new Animated.Value(focused ? 1 : 0);
  
  return {
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    }),
    scale: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
    }),
  };
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Timing
  TIMING,
  
  // Interpolators
  fadeInterpolator,
  slideFromRightInterpolator,
  slideFromBottomInterpolator,
  scaleFadeInterpolator,
  slideFadeFromRightInterpolator,
  zoomInInterpolator,
  
  // Transition specs
  springTransitionSpec,
  timingTransitionSpec,
  fastTimingTransitionSpec,
  
  // Screen options
  defaultScreenOptions,
  modalScreenOptions,
  fadeScreenOptions,
  scaleFadeScreenOptions,
  zoomScreenOptions,
  noAnimationOptions,
  
  // Platform helpers
  getPlatformTransitionPreset,
  getPlatformModalPreset,
  getScreenOptions,
  
  // Tab animations
  tabBarAnimationConfig,
  createTabLabelAnimation,
};
