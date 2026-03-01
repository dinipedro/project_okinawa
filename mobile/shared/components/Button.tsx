/**
 * Okinawa Design System - Button Component
 * 
 * A comprehensive button component with multiple variants,
 * sizes, and states following the Modern Chic aesthetic.
 * Integrates haptic feedback for enhanced tactile experience.
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOkinawaTheme } from '../contexts/ThemeContext';
import Haptic from '../utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  textStyle,
  hapticFeedback = true,
}) => {
  const { theme, isDark } = useOkinawaTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const handlePress = () => {
    if (hapticFeedback) {
      // Use appropriate haptic based on variant
      if (variant === 'destructive') {
        Haptic.heavyImpact();
      } else if (variant === 'success') {
        Haptic.successNotification();
      } else {
        Haptic.mediumImpact();
      }
    }
    onPress?.();
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            height: theme.layout.buttonHeightSmall,
            paddingHorizontal: theme.spacing[3],
            borderRadius: theme.borderRadius.button,
          },
          text: {
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.medium,
          },
        };
      case 'lg':
        return {
          container: {
            height: theme.layout.buttonHeightLarge,
            paddingHorizontal: theme.spacing[6],
            borderRadius: theme.borderRadius.buttonLarge,
          },
          text: {
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.semibold,
          },
        };
      default:
        return {
          container: {
            height: theme.layout.buttonHeightMedium,
            paddingHorizontal: theme.spacing[5],
            borderRadius: theme.borderRadius.button,
          },
          text: {
            fontSize: theme.fontSize.base,
            fontWeight: theme.fontWeight.semibold,
          },
        };
    }
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; useGradient: boolean } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            ...theme.componentShadows.buttonPrimaryGlow,
          },
          text: {
            color: theme.colors.primaryForeground,
          },
          useGradient: true,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.colors.secondary,
            ...theme.componentShadows.button,
          },
          text: {
            color: theme.colors.secondaryForeground,
          },
          useGradient: false,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.colors.border,
          },
          text: {
            color: theme.colors.foreground,
          },
          useGradient: false,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: theme.colors.foregroundSecondary,
          },
          useGradient: false,
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: theme.colors.error,
            ...theme.componentShadows.button,
          },
          text: {
            color: '#FFFFFF',
          },
          useGradient: false,
        };
      case 'success':
        return {
          container: {
            backgroundColor: theme.colors.success,
            ...theme.componentShadows.button,
          },
          text: {
            color: '#FFFFFF',
          },
          useGradient: false,
        };
      default:
        return {
          container: {},
          text: {},
          useGradient: false,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...sizeStyles.container,
    ...variantStyles.container,
    ...(fullWidth && { width: '100%' }),
    ...(isDisabled && { opacity: 0.5 }),
    ...style,
  };

  const textStyleFinal: TextStyle = {
    ...styles.text,
    ...sizeStyles.text,
    ...variantStyles.text,
    ...textStyle,
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color as string}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={textStyleFinal}>{children}</Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {variantStyles.useGradient ? (
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={containerStyle}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View style={containerStyle}>{renderContent()}</View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.5,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
