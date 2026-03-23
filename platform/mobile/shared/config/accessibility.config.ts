/**
 * Okinawa Accessibility (a11y) Configuration
 * 
 * Accessibility standards and testing utilities.
 * Follows WCAG 2.1 AA guidelines.
 * 
 * @module shared/config/accessibility
 */

export const A11Y_CONFIG = {
  // Minimum touch target size (in dp)
  minTouchTarget: 44,
  
  // Minimum contrast ratios (WCAG 2.1 AA)
  contrastRatios: {
    normalText: 4.5,
    largeText: 3.0,
    uiComponents: 3.0,
  },
  
  // Font size minimums
  fontSizes: {
    minimum: 12,
    body: 14,
    largeText: 18,
  },
  
  // Animation preferences
  animations: {
    respectReducedMotion: true,
    maxDuration: 500,
  },
  
  // Screen reader labels required for
  requiredLabels: [
    'buttons', 'images', 'icons', 'inputs', 'links', 'interactive_elements',
  ],
};

/**
 * Accessibility helper utilities
 */
export const a11yHelpers = {
  /**
   * Generate accessible props for touchable elements
   */
  touchableProps: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button' as const,
  }),
  
  /**
   * Generate accessible props for images
   */
  imageProps: (description: string) => ({
    accessible: true,
    accessibilityLabel: description,
    accessibilityRole: 'image' as const,
  }),
  
  /**
   * Generate accessible props for text inputs
   */
  inputProps: (label: string, error?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityState: { disabled: false },
    ...(error && { accessibilityHint: `Error: ${error}` }),
  }),
  
  /**
   * Check if element meets touch target requirements
   */
  meetsTouchTarget: (width: number, height: number): boolean => {
    return width >= A11Y_CONFIG.minTouchTarget && height >= A11Y_CONFIG.minTouchTarget;
  },
};

/**
 * Accessibility audit checklist
 */
export const A11Y_CHECKLIST = {
  screens: [
    'All interactive elements have accessibilityLabel',
    'Images have descriptive alt text',
    'Form inputs have associated labels',
    'Color is not the only means of conveying information',
    'Touch targets are at least 44x44dp',
    'Text contrast meets WCAG AA (4.5:1 for normal, 3:1 for large)',
    'Screen reader navigation order is logical',
    'Focus states are visible',
    'Animations respect reduced motion preferences',
    'Error messages are announced to screen readers',
  ],
  testing: [
    'Test with VoiceOver (iOS) enabled',
    'Test with TalkBack (Android) enabled',
    'Test with increased font sizes',
    'Test with reduced motion enabled',
    'Test with high contrast mode',
    'Verify all modals trap focus correctly',
    'Verify skip links work on complex screens',
  ],
};

export default { A11Y_CONFIG, a11yHelpers, A11Y_CHECKLIST };
