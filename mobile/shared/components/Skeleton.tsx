/**
 * Okinawa Design System - Skeleton Components
 * 
 * Migrated to semantic tokens using useColors() + useMemo pattern
 * for dynamic theme support (light/dark modes).
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useColors } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}

/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}: SkeletonProps) {
  const colors = useColors();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, shimmerAnim]);

  const opacity = animated
    ? shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
      })
    : 0.5;

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.muted,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  lastLineWidth = '60%',
  spacing: lineSpacing = 8,
}: {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: number | string;
  spacing?: number;
}) {
  return (
    <View style={skeletonStyles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          style={index < lines - 1 ? { marginBottom: lineSpacing } : undefined}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton for circular avatars
 */
export function SkeletonAvatar({
  size = 48,
}: {
  size?: number;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
    />
  );
}

/**
 * Skeleton for restaurant cards
 */
export function SkeletonRestaurantCard() {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    content: {
      padding: 16,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Skeleton height={150} borderRadius={12} />
      <View style={styles.content}>
        <Skeleton height={20} width="70%" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="40%" style={{ marginBottom: 12 }} />
        <View style={skeletonStyles.row}>
          <Skeleton height={14} width={60} />
          <Skeleton height={14} width={80} style={{ marginLeft: 12 }} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for menu item cards
 */
export function SkeletonMenuItem() {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    content: {
      flex: 1,
      marginRight: 16,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Skeleton height={18} width="80%" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="100%" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="60%" style={{ marginBottom: 12 }} />
        <Skeleton height={16} width={70} />
      </View>
      <Skeleton width={80} height={80} borderRadius={8} />
    </View>
  );
}

/**
 * Skeleton for order cards
 */
export function SkeletonOrderCard() {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={skeletonStyles.row}>
        <Skeleton height={18} width="50%" />
        <Skeleton height={24} width={80} borderRadius={100} />
      </View>
      <View style={[skeletonStyles.row, { marginTop: 12 }]}>
        <SkeletonAvatar size={40} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="40%" />
        </View>
      </View>
      <View style={styles.divider} />
      <View style={skeletonStyles.row}>
        <Skeleton height={14} width="30%" />
        <Skeleton height={18} width="25%" />
      </View>
    </View>
  );
}

/**
 * Skeleton for reservation cards
 */
export function SkeletonReservationCard() {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={skeletonStyles.row}>
        <SkeletonAvatar size={50} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Skeleton height={18} width="70%" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="50%" />
        </View>
        <Skeleton height={24} width={80} borderRadius={100} />
      </View>
      <View style={styles.divider} />
      <View style={skeletonStyles.row}>
        <Skeleton height={14} width="40%" />
        <Skeleton height={14} width="30%" />
      </View>
    </View>
  );
}

/**
 * Skeleton for notification items
 */
export function SkeletonNotification() {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: colors.card,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <SkeletonAvatar size={40} />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Skeleton height={16} width="80%" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="60%" style={{ marginBottom: 8 }} />
        <Skeleton height={12} width="30%" />
      </View>
    </View>
  );
}

/**
 * Skeleton for list items
 */
export function SkeletonListItem({
  hasAvatar = true,
  hasSubtitle = true,
  hasTrailing = false,
}: {
  hasAvatar?: boolean;
  hasSubtitle?: boolean;
  hasTrailing?: boolean;
}) {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
    },
    content: {
      flex: 1,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      {hasAvatar && <SkeletonAvatar size={40} />}
      <View style={[styles.content, hasAvatar && { marginLeft: 16 }]}>
        <Skeleton height={16} width="70%" style={{ marginBottom: hasSubtitle ? 8 : 0 }} />
        {hasSubtitle && <Skeleton height={14} width="50%" />}
      </View>
      {hasTrailing && <Skeleton width={40} height={16} />}
    </View>
  );
}

/**
 * Skeleton for financial summary cards
 */
export function SkeletonFinancialCard() {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Skeleton height={14} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={28} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="30%" />
    </View>
  );
}

/**
 * Skeleton for KDS order cards
 */
export function SkeletonKDSCard() {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.muted,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={skeletonStyles.row}>
        <Skeleton height={20} width="30%" />
        <Skeleton height={20} width={60} />
      </View>
      <View style={styles.divider} />
      <View style={{ marginTop: 12 }}>
        <Skeleton height={16} width="90%" style={{ marginBottom: 8 }} />
        <Skeleton height={16} width="70%" style={{ marginBottom: 8 }} />
        <Skeleton height={16} width="80%" />
      </View>
      <View style={[skeletonStyles.row, { marginTop: 16 }]}>
        <Skeleton height={36} width="100%" borderRadius={8} />
      </View>
    </View>
  );
}

/**
 * Skeleton loader for full screen loading
 */
export function SkeletonScreen({
  type = 'list',
  count = 5,
}: {
  type?: 'list' | 'grid' | 'restaurant' | 'order' | 'menu' | 'notification';
  count?: number;
}) {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    screen: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
  }), [colors]);

  const renderItem = () => {
    switch (type) {
      case 'restaurant':
        return <SkeletonRestaurantCard />;
      case 'order':
        return <SkeletonOrderCard />;
      case 'menu':
        return <SkeletonMenuItem />;
      case 'notification':
        return <SkeletonNotification />;
      case 'grid':
        return <SkeletonRestaurantCard />;
      default:
        return <SkeletonListItem />;
    }
  };

  return (
    <View style={styles.screen}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ marginBottom: 16 }}>
          {renderItem()}
        </View>
      ))}
    </View>
  );
}

// Static styles that don't depend on theme
const skeletonStyles = StyleSheet.create({
  textContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default Skeleton;
