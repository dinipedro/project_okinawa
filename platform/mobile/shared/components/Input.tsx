/**
 * Okinawa Design System - Input Component
 * 
 * A styled input component with support for icons,
 * validation states, and focus effects.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useOkinawaTheme } from '../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  disabled = false,
  ...textInputProps
}) => {
  const { theme, isDark } = useOkinawaTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.inputBorder;
  };

  const animatedBorderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.inputBorder, theme.colors.primary],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: error
                ? theme.colors.error
                : isFocused
                ? theme.colors.primary
                : theme.colors.foregroundSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled
              ? theme.colors.backgroundTertiary
              : theme.colors.input,
            borderColor: error ? theme.colors.error : animatedBorderColor,
            borderRadius: theme.borderRadius.input,
            height: theme.layout.inputHeight,
          },
          isFocused && !error && theme.componentShadows.inputFocus,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            {
              color: theme.colors.foreground,
              fontSize: theme.fontSize.base,
            },
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.inputPlaceholder}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>

      {(error || hint) && (
        <Text
          style={[
            styles.helperText,
            {
              color: error ? theme.colors.error : theme.colors.foregroundMuted,
            },
          ]}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});

export default Input;
