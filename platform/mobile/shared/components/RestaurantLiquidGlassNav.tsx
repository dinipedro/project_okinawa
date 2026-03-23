/**
 * Okinawa Design System - Restaurant Liquid Glass Navigation
 * 
 * A premium glassmorphism bottom navigation bar for the Restaurant app.
 * Customized icons and labels for restaurant staff operations.
 * Full semantic token support for dark/light modes.
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

// Icons
import { 
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Users,
  Settings,
} from 'lucide-react-native';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'kitchen-kds', icon: ChefHat, label: 'Cozinha' },
  { id: 'tables', icon: Users, label: 'Mesas' },
  { id: 'settings', icon: Settings, label: 'Config' },
];

interface RestaurantLiquidGlassNavProps {
  activeTab: string;
  onNavigate: (screen: string) => void;
}

const RestaurantLiquidGlassNav: React.FC<RestaurantLiquidGlassNavProps> = ({
  activeTab,
  onNavigate,
}) => {
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
      paddingHorizontal: 8,
      borderRadius: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      overflow: 'hidden',
    },
    activeGradient: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 12,
    },
    glowEffect: {
      position: 'absolute',
      top: -8,
      left: -8,
      right: -8,
      bottom: -8,
      backgroundColor: colors.primary,
      borderRadius: 20,
      opacity: 0.4,
      transform: [{ scale: 1.3 }],
    },
    navLabel: {
      marginTop: 2,
      fontSize: 9,
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

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onNavigate(item.id)}
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                activeOpacity={0.9}
                style={styles.navItem}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    { transform: [{ scale: scaleValues[index] }] },
                  ]}
                >
                  {/* Active Gradient Background */}
                  {isActive && (
                    <LinearGradient
                      colors={theme.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeGradient}
                    />
                  )}

                  {/* Glow Effect */}
                  {isActive && (
                    <Animated.View
                      style={[
                        styles.glowEffect,
                        { opacity: glowValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.4],
                        }) },
                      ]}
                    />
                  )}

                  <Icon
                    size={20}
                    color={isActive ? colors.primaryForeground : inactiveIconColor}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </Animated.View>

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

export default RestaurantLiquidGlassNav;
