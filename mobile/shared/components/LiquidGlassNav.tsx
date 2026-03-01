/**
 * Okinawa Design System - Liquid Glass Navigation (Client App)
 * 
 * A premium glassmorphism bottom navigation bar inspired by iOS design.
 * Features:
 * - Frosted glass effect with backdrop blur
 * - Active state with gradient and glow
 * - Center QR Scanner action button
 * - Home indicator for iPhone X+ style
 * - Full semantic token support for dark/light modes
 */

import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOkinawaTheme, useColors } from '../contexts/ThemeContext';

// Icons - using Lucide React Native if available, fallback to simple components
import { 
  Home,
  Search,
  QrCode,
  Calendar,
  User,
} from 'lucide-react-native';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'explore', icon: Search, label: 'Explorar' },
  { id: 'qr-scanner', icon: QrCode, label: 'Escanear' },
  { id: 'reservations', icon: Calendar, label: 'Reservas' },
  { id: 'profile', icon: User, label: 'Perfil' },
];

interface LiquidGlassNavProps {
  activeTab: string;
  onNavigate: (screen: string) => void;
}

const LiquidGlassNav: React.FC<LiquidGlassNavProps> = ({ activeTab, onNavigate }) => {
  const { theme, isDark } = useOkinawaTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scaleValues = useRef(navItems.map(() => new Animated.Value(1))).current;
  const glowValues = useRef(navItems.map(() => new Animated.Value(0))).current;

  // Animate active item glow
  useEffect(() => {
    navItems.forEach((item, index) => {
      const isActive = item.id === activeTab;
      Animated.timing(glowValues[index], {
        toValue: isActive ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab]);

  const handlePressIn = (index: number) => {
    Animated.spring(scaleValues[index], {
      toValue: 0.9,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleValues[index], {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  // Dynamic styles using semantic tokens
  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
    },
    navWrapper: {
      position: 'relative',
      borderRadius: 28,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 32,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    glassBackground: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 28,
    },
    topReflection: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    glassBorder: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 28,
      borderWidth: 1,
    },
    navItems: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    centerNavItem: {
      marginTop: -16,
    },
    iconContainer: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      overflow: 'hidden',
    },
    centerIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 16,
    },
    activeGradient: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 14,
    },
    glowEffect: {
      position: 'absolute',
      top: -8,
      left: -8,
      right: -8,
      bottom: -8,
      backgroundColor: colors.primary,
      borderRadius: 22,
      opacity: 0.4,
      transform: [{ scale: 1.3 }],
    },
    navLabel: {
      marginTop: 2,
      fontSize: 10,
      fontWeight: '500',
      letterSpacing: 0.5,
    },
    homeIndicatorContainer: {
      alignItems: 'center',
      marginTop: 8,
    },
    homeIndicator: {
      width: 112,
      height: 4,
      borderRadius: 2,
    },
  }), [colors]);

  // Dynamic colors based on theme
  const glassBackgroundColor = isDark 
    ? 'rgba(17, 24, 39, 0.6)' 
    : 'rgba(255, 255, 255, 0.6)';
  const glassBackgroundColorAndroid = isDark 
    ? 'rgba(17, 24, 39, 0.85)' 
    : 'rgba(255, 255, 255, 0.85)';
  const glassBorderColor = isDark 
    ? colors.border 
    : 'rgba(255, 255, 255, 0.8)';
  const inactiveIconColor = colors.foregroundMuted;
  const homeIndicatorColor = isDark 
    ? 'rgba(255,255,255,0.2)' 
    : 'rgba(0,0,0,0.2)';

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.navWrapper}>
        {/* Glass Background */}
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.glassBackground,
              { backgroundColor: glassBackgroundColor },
            ]}
          />
        ) : (
          <View
            style={[
              styles.glassBackground,
              { backgroundColor: glassBackgroundColorAndroid },
            ]}
          />
        )}

        {/* Top Gradient Reflection */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'transparent', 'transparent']}
          style={styles.topReflection}
        />

        {/* Border */}
        <View style={[
          styles.glassBorder,
          { borderColor: glassBorderColor },
        ]} />

        {/* Nav Items */}
        <View style={styles.navItems}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCenter = item.id === 'qr-scanner';

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onNavigate(item.id)}
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                activeOpacity={0.9}
                style={[styles.navItem, isCenter && styles.centerNavItem]}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    isCenter && styles.centerIconContainer,
                    { transform: [{ scale: scaleValues[index] }] },
                  ]}
                >
                  {/* Active/Center Gradient Background */}
                  {(isActive || isCenter) && (
                    <LinearGradient
                      colors={theme.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeGradient}
                    />
                  )}

                  {/* Glow Effect */}
                  {(isActive || isCenter) && (
                    <Animated.View
                      style={[
                        styles.glowEffect,
                        { opacity: isCenter ? 0.4 : glowValues[index] },
                      ]}
                    />
                  )}

                  <Icon
                    size={20}
                    color={isActive || isCenter ? colors.primaryForeground : inactiveIconColor}
                    strokeWidth={isActive || isCenter ? 2 : 1.5}
                  />
                </Animated.View>

                {!isCenter && (
                  <Text
                    style={[
                      styles.navLabel,
                      {
                        color: isActive ? colors.primary : inactiveIconColor,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicatorContainer}>
        <View
          style={[
            styles.homeIndicator,
            { backgroundColor: homeIndicatorColor },
          ]}
        />
      </View>
    </View>
  );
};

export default LiquidGlassNav;
