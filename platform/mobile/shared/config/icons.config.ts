/**
 * Okinawa App Icons Configuration
 * 
 * Configuration and specifications for app icons across all platforms.
 * This file defines the required icon sizes and provides guidance for asset generation.
 * 
 * @module shared/config/icons
 */

/**
 * iOS App Icon Specifications
 * All icons should be PNG format with no transparency for App Store
 */
export const IOS_ICON_SIZES = {
  // iPhone icons
  iphone: [
    { size: 20, scales: [2, 3], usage: 'Notification' },
    { size: 29, scales: [2, 3], usage: 'Settings' },
    { size: 40, scales: [2, 3], usage: 'Spotlight' },
    { size: 60, scales: [2, 3], usage: 'App' },
  ],
  // iPad icons
  ipad: [
    { size: 20, scales: [1, 2], usage: 'Notification' },
    { size: 29, scales: [1, 2], usage: 'Settings' },
    { size: 40, scales: [1, 2], usage: 'Spotlight' },
    { size: 76, scales: [1, 2], usage: 'App' },
    { size: 83.5, scales: [2], usage: 'App (iPad Pro)' },
  ],
  // App Store
  appStore: { size: 1024, scale: 1, usage: 'App Store' },
};

/**
 * Android App Icon Specifications
 */
export const ANDROID_ICON_SIZES = {
  // Adaptive icon specifications
  adaptive: {
    foreground: { size: 108, description: 'Foreground layer (with safe zone)' },
    background: { size: 108, description: 'Background layer (color or image)' },
    safeZone: { size: 66, description: 'Safe zone for foreground content' },
  },
  // Legacy icons for older Android versions
  legacy: [
    { density: 'mdpi', size: 48 },
    { density: 'hdpi', size: 72 },
    { density: 'xhdpi', size: 96 },
    { density: 'xxhdpi', size: 144 },
    { density: 'xxxhdpi', size: 192 },
  ],
  // Play Store
  playStore: { size: 512, usage: 'Play Store listing' },
};

/**
 * Client App Icon Configuration
 */
export const CLIENT_ICON_CONFIG = {
  // Brand colors for icon
  primaryColor: '#EA580C', // Warm orange
  backgroundColor: '#FFFFFF',
  
  // Design specifications
  design: {
    shape: 'rounded_square',
    iconPadding: '15%', // Padding inside icon boundaries
    cornerRadius: '22.5%', // iOS corner radius
  },
  
  // File paths (relative to app root)
  paths: {
    // Main icon (1024x1024)
    icon: './assets/icon.png',
    
    // iOS specific
    ios: './assets/ios/',
    
    // Android adaptive
    adaptiveForeground: './assets/adaptive-icon.png',
    adaptiveBackground: '#EA580C',
    
    // Android legacy
    android: './assets/android/',
    
    // Favicon for web
    favicon: './assets/favicon.png',
  },
};

/**
 * Restaurant App Icon Configuration
 */
export const RESTAURANT_ICON_CONFIG = {
  // Brand colors for icon
  primaryColor: '#0D9488', // Teal
  backgroundColor: '#FFFFFF',
  
  // Design specifications
  design: {
    shape: 'rounded_square',
    iconPadding: '15%',
    cornerRadius: '22.5%',
  },
  
  // File paths (relative to app root)
  paths: {
    // Main icon (1024x1024)
    icon: './assets/icon-restaurant.png',
    
    // iOS specific
    ios: './assets/ios-restaurant/',
    
    // Android adaptive
    adaptiveForeground: './assets/adaptive-icon-restaurant.png',
    adaptiveBackground: '#0D9488',
    
    // Android legacy
    android: './assets/android-restaurant/',
    
    // Favicon for web
    favicon: './assets/favicon-restaurant.png',
  },
};

/**
 * Generate all required icon filenames with sizes
 */
export const generateIconList = (platform: 'ios' | 'android') => {
  const icons: Array<{ filename: string; size: number; description: string }> = [];
  
  if (platform === 'ios') {
    // iPhone icons
    IOS_ICON_SIZES.iphone.forEach(({ size, scales, usage }) => {
      scales.forEach(scale => {
        const pixelSize = size * scale;
        icons.push({
          filename: `icon-${size}@${scale}x.png`,
          size: pixelSize,
          description: `${usage} icon ${size}pt @${scale}x`,
        });
      });
    });
    
    // iPad icons
    IOS_ICON_SIZES.ipad.forEach(({ size, scales, usage }) => {
      scales.forEach(scale => {
        const pixelSize = Math.round(size * scale);
        icons.push({
          filename: `icon-${size}@${scale}x~ipad.png`,
          size: pixelSize,
          description: `iPad ${usage} icon ${size}pt @${scale}x`,
        });
      });
    });
    
    // App Store icon
    icons.push({
      filename: 'icon-1024.png',
      size: 1024,
      description: 'App Store icon',
    });
  } else {
    // Android legacy icons
    ANDROID_ICON_SIZES.legacy.forEach(({ density, size }) => {
      icons.push({
        filename: `mipmap-${density}/ic_launcher.png`,
        size,
        description: `${density} icon`,
      });
    });
    
    // Play Store icon
    icons.push({
      filename: 'playstore-icon.png',
      size: 512,
      description: 'Play Store icon',
    });
  }
  
  return icons;
};

/**
 * Expo icon configuration (for app.json/app.config.js)
 */
export const EXPO_ICON_CONFIG = {
  client: {
    icon: './assets/icon.png',
    ios: {
      icon: './assets/icon.png',
      supportsTablet: true,
    },
    android: {
      icon: './assets/icon.png',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#EA580C',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
  restaurant: {
    icon: './assets/icon-restaurant.png',
    ios: {
      icon: './assets/icon-restaurant.png',
      supportsTablet: true,
    },
    android: {
      icon: './assets/icon-restaurant.png',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon-restaurant.png',
        backgroundColor: '#0D9488',
      },
    },
    web: {
      favicon: './assets/favicon-restaurant.png',
    },
  },
};

/**
 * Icon generation command helper
 * Use with tools like @expo/icon-builder or react-native-make
 */
export const getIconGenerationCommands = () => ({
  // Using @expo/cli
  expo: {
    client: 'npx expo-cli publish --icon ./assets/icon.png',
    restaurant: 'npx expo-cli publish --icon ./assets/icon-restaurant.png',
  },
  
  // Using react-native-make
  reactNativeMake: {
    client: 'npx react-native set-icon --path ./assets/icon.png',
    restaurant: 'npx react-native set-icon --path ./assets/icon-restaurant.png',
  },
  
  // Manual generation (requires ImageMagick)
  imagemagick: {
    resize: (input: string, output: string, size: number) =>
      `convert ${input} -resize ${size}x${size} ${output}`,
    roundCorners: (input: string, output: string, radius: number) =>
      `convert ${input} \\( +clone -alpha extract -draw "fill black polygon 0,0 0,${radius} ${radius},0 fill white circle ${radius},${radius} ${radius},0" \\( +clone -flip \\) -compose Multiply -composite \\( +clone -flop \\) -compose Multiply -composite \\) -alpha off -compose CopyOpacity -composite ${output}`,
  },
});

/**
 * Asset checklist for app submission
 */
export const SUBMISSION_CHECKLIST = {
  ios: [
    { asset: 'App Icon (1024x1024)', required: true, format: 'PNG, no alpha' },
    { asset: 'Screenshots (6.5" iPhone)', required: true, count: '2-10' },
    { asset: 'Screenshots (5.5" iPhone)', required: false, count: '2-10' },
    { asset: 'iPad Screenshots', required: 'if iPad supported', count: '2-10' },
    { asset: 'App Preview Video', required: false, duration: '15-30 seconds' },
  ],
  android: [
    { asset: 'High-res Icon (512x512)', required: true, format: 'PNG' },
    { asset: 'Feature Graphic (1024x500)', required: true, format: 'PNG/JPEG' },
    { asset: 'Screenshots', required: true, count: '2-8', minSize: '320px' },
    { asset: 'Promo Video', required: false, format: 'YouTube URL' },
  ],
};

export default {
  IOS_ICON_SIZES,
  ANDROID_ICON_SIZES,
  CLIENT_ICON_CONFIG,
  RESTAURANT_ICON_CONFIG,
  generateIconList,
  EXPO_ICON_CONFIG,
  getIconGenerationCommands,
  SUBMISSION_CHECKLIST,
};
