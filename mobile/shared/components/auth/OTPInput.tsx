/**
 * OTPInput Component
 * 
 * 6-digit OTP input with auto-advance and auto-fill support.
 * Follows the Okinawa authentication specification.
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, TextInput, StyleSheet, Keyboard, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import Haptic from '@/shared/utils/haptics';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}) => {
  const colors = useColors();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const styles = useMemo(() => createStyles(colors, error), [colors, error]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [autoFocus]);

  // Handle OTP completion
  useEffect(() => {
    if (value.length === length && onComplete) {
      Haptic.successNotification();
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = useCallback((text: string, index: number) => {
    // Handle paste of full OTP code
    if (text.length > 1) {
      const pastedCode = text.replace(/\D/g, '').slice(0, length);
      onChange(pastedCode);
      
      if (pastedCode.length === length) {
        Keyboard.dismiss();
      } else {
        const nextIndex = Math.min(pastedCode.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    // Single character input
    const digit = text.replace(/\D/g, '');
    const newValue = value.split('');
    newValue[index] = digit;
    onChange(newValue.join(''));

    // Move to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      Haptic.lightImpact();
    }
  }, [value, length, onChange]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Move to previous input and clear it
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
      Haptic.lightImpact();
    }
  }, [value, onChange]);

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  return (
    <View style={styles.container}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={[
            styles.input,
            value[index] && styles.inputFilled,
            focusedIndex === index && styles.inputFocused,
            error && styles.inputError,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          onFocus={() => handleFocus(index)}
          keyboardType="number-pad"
          maxLength={index === 0 ? length : 1}
          editable={!disabled}
          selectTextOnFocus
          textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : undefined}
        />
      ))}
    </View>
  );
};

const createStyles = (colors: any, error: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: error ? colors.destructive : colors.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  inputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.destructive,
    backgroundColor: colors.destructive + '10',
  },
});

export default OTPInput;
