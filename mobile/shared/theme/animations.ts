/**
 * Okinawa Design System - Animations
 * Timing functions and animation configurations
 */

import { Animated, Easing } from 'react-native';

// Duration scale (in milliseconds)
export const duration = {
  instant: 0,
  fastest: 50,
  faster: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
  // For complex animations
  enter: 300,
  exit: 200,
  page: 350,
};

// Easing functions
export const easing = {
  // Standard Material Design easings
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  
  // Cubic bezier approximations
  decelerate: Easing.out(Easing.cubic), // For entering elements
  accelerate: Easing.in(Easing.cubic), // For exiting elements
  standard: Easing.bezier(0.4, 0, 0.2, 1), // Standard motion
  emphasized: Easing.bezier(0.2, 0, 0, 1), // For important elements
  
  // Bounce / Spring
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  back: Easing.back(1.5), // Overshoot
};

// Animation presets
export const animationPresets = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: duration.normal,
    easing: easing.easeOut,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: duration.fast,
    easing: easing.easeIn,
  },
  
  // Scale animations
  scaleIn: {
    from: { opacity: 0, scale: 0.95 },
    to: { opacity: 1, scale: 1 },
    duration: duration.normal,
    easing: easing.decelerate,
  },
  scaleOut: {
    from: { opacity: 1, scale: 1 },
    to: { opacity: 0, scale: 0.95 },
    duration: duration.fast,
    easing: easing.accelerate,
  },
  
  // Slide animations
  slideInFromBottom: {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
    duration: duration.slow,
    easing: easing.decelerate,
  },
  slideInFromTop: {
    from: { opacity: 0, translateY: -20 },
    to: { opacity: 1, translateY: 0 },
    duration: duration.slow,
    easing: easing.decelerate,
  },
  slideInFromRight: {
    from: { opacity: 0, translateX: 20 },
    to: { opacity: 1, translateX: 0 },
    duration: duration.slow,
    easing: easing.decelerate,
  },
  slideInFromLeft: {
    from: { opacity: 0, translateX: -20 },
    to: { opacity: 1, translateX: 0 },
    duration: duration.slow,
    easing: easing.decelerate,
  },
  
  // Pop animation (for buttons, badges)
  pop: {
    from: { scale: 0.8 },
    to: { scale: 1 },
    duration: duration.fast,
    easing: easing.back,
  },
  
  // Pulse animation
  pulse: {
    from: { scale: 1 },
    to: { scale: 1.05 },
    duration: duration.slow,
    easing: easing.easeInOut,
    loop: true,
    reverse: true,
  },
  
  // Shake animation (for errors)
  shake: {
    keyframes: [0, -10, 10, -10, 10, -5, 5, 0],
    duration: duration.slower,
    easing: easing.easeOut,
  },
  
  // Bottom sheet enter
  bottomSheetEnter: {
    from: { translateY: 300 },
    to: { translateY: 0 },
    duration: duration.slow,
    easing: easing.decelerate,
  },
  
  // Stagger delay for list items (in ms)
  staggerDelay: 50,
};

// Create animated value helper
export const createAnimatedValue = (initialValue: number = 0) => new Animated.Value(initialValue);

// Animation helper functions
export const animateValue = (
  value: Animated.Value,
  toValue: number,
  durationMs: number = duration.normal,
  easingFn: (value: number) => number = easing.standard,
  callback?: () => void
) => {
  return Animated.timing(value, {
    toValue,
    duration: durationMs,
    easing: easingFn,
    useNativeDriver: true,
  }).start(callback);
};

export const animateSpring = (
  value: Animated.Value,
  toValue: number,
  config?: Partial<Animated.SpringAnimationConfig>,
  callback?: () => void
) => {
  return Animated.spring(value, {
    toValue,
    useNativeDriver: true,
    damping: 15,
    stiffness: 150,
    ...config,
  }).start(callback);
};

// Sequence multiple animations
export const sequence = (animations: Animated.CompositeAnimation[]) => {
  return Animated.sequence(animations);
};

// Run animations in parallel
export const parallel = (animations: Animated.CompositeAnimation[]) => {
  return Animated.parallel(animations);
};

// Stagger animations
export const stagger = (
  delay: number,
  animations: Animated.CompositeAnimation[]
) => {
  return Animated.stagger(delay, animations);
};

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
