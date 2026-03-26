/**
 * SocialLoginButton Component
 * 
 * OAuth login buttons for Apple and Google following platform guidelines.
 * Follows Apple Human Interface Guidelines and Google Sign-In branding.
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, View, Platform, ActivityIndicator, Text as RNText } from 'react-native';
import { Text } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import Haptic from '@/shared/utils/haptics';

type SocialProvider = 'apple' | 'google';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outlined';
  label?: string;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
  loading = false,
  disabled = false,
  variant = 'outlined',
  label,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const config = {
    apple: {
      icon: '', // Apple logo will be rendered as text
      text: label || 'Continue with Apple',
      backgroundColor: variant === 'primary' ? '#000000' : 'transparent',
      textColor: variant === 'primary' ? '#FFFFFF' : colors.foreground,
      borderColor: colors.foreground,
    },
    google: {
      icon: 'G',
      text: label || 'Continue with Google',
      backgroundColor: variant === 'primary' ? '#FFFFFF' : 'transparent',
      textColor: variant === 'primary' ? '#3C4043' : colors.foreground,
      borderColor: colors.border,
    },
  };

  const buttonConfig = config[provider];

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptic.mediumImpact();
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonConfig.backgroundColor,
          borderColor: buttonConfig.borderColor,
        },
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={buttonConfig.textColor}
          style={styles.loader}
        />
      ) : (
        <>
          <View style={styles.iconContainer}>
            {provider === 'apple' ? (
              <RNText style={[styles.appleIcon, { color: buttonConfig.textColor }]}>
                {'\uF8FF'}
              </RNText>
            ) : (
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.text,
              { color: buttonConfig.textColor },
            ]}
          >
            {buttonConfig.text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appleIcon: {
    fontSize: 22,
    fontWeight: '500',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 4,
  },
});

export default SocialLoginButton;
