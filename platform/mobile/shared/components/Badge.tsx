/**
 * Okinawa Design System - Badge Component
 * 
 * A versatile badge component for status indicators,
 * counts, and labels.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOkinawaTheme } from '../contexts/ThemeContext';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'muted'
  | 'outline';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  gradient = false,
  style,
  textStyle,
}) => {
  const { theme } = useOkinawaTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: theme.borderRadius.badge,
          },
          text: {
            fontSize: 10,
          },
          dot: {
            width: 6,
            height: 6,
          },
        };
      case 'lg':
        return {
          container: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: theme.borderRadius.md,
          },
          text: {
            fontSize: 14,
          },
          dot: {
            width: 10,
            height: 10,
          },
        };
      default:
        return {
          container: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: theme.borderRadius.badge,
          },
          text: {
            fontSize: 12,
          },
          dot: {
            width: 8,
            height: 8,
          },
        };
    }
  };

  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          text: theme.colors.primaryForeground,
        };
      case 'secondary':
        return {
          bg: theme.colors.secondary,
          text: theme.colors.secondaryForeground,
        };
      case 'success':
        return {
          bg: theme.colors.successBackground,
          text: theme.colors.success,
        };
      case 'warning':
        return {
          bg: theme.colors.warningBackground,
          text: theme.colors.warning,
        };
      case 'error':
        return {
          bg: theme.colors.errorBackground,
          text: theme.colors.error,
        };
      case 'info':
        return {
          bg: theme.colors.infoBackground,
          text: theme.colors.info,
        };
      case 'muted':
        return {
          bg: theme.colors.backgroundTertiary,
          text: theme.colors.foregroundMuted,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: theme.colors.foregroundSecondary,
          border: theme.colors.border,
        };
      default:
        return {
          bg: theme.colors.primary,
          text: theme.colors.primaryForeground,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          sizeStyles.dot,
          {
            backgroundColor: variantStyles.bg,
            borderRadius: sizeStyles.dot.width / 2,
          },
          style,
        ]}
      />
    );
  }

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...sizeStyles.container,
    backgroundColor: variantStyles.bg,
    ...(variantStyles.border && {
      borderWidth: 1,
      borderColor: variantStyles.border,
    }),
    ...style,
  };

  const textStyleFinal: TextStyle = {
    ...styles.text,
    ...sizeStyles.text,
    color: variantStyles.text,
    ...textStyle,
  };

  if (gradient && variant === 'primary') {
    return (
      <LinearGradient
        colors={theme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[containerStyle, { backgroundColor: undefined }]}
      >
        <Text style={[textStyleFinal, { color: '#FFFFFF' }]}>{children}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={textStyleFinal}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dot: {},
});

export default Badge;
