/**
 * ResendTimer Component
 * 
 * Countdown timer for OTP resend with channel switching.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import Haptic from '@/shared/utils/haptics';

type OTPChannel = 'whatsapp' | 'sms';

interface ResendTimerProps {
  initialSeconds?: number;
  onResend: (channel: OTPChannel) => void;
  currentChannel: OTPChannel;
  disabled?: boolean;
}

export const ResendTimer: React.FC<ResendTimerProps> = ({
  initialSeconds = 60,
  onResend,
  currentChannel,
  disabled = false,
}) => {
  const colors = useColors();
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const handleResend = useCallback((channel: OTPChannel) => {
    if (seconds > 0 || disabled) return;
    
    Haptic.mediumImpact();
    onResend(channel);
    setSeconds(initialSeconds);
    setIsActive(true);
  }, [seconds, disabled, onResend, initialSeconds]);

  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const alternateChannel: OTPChannel = currentChannel === 'whatsapp' ? 'sms' : 'whatsapp';
  const alternateLabel = currentChannel === 'whatsapp' ? 'Send via SMS instead' : 'Send via WhatsApp instead';

  return (
    <View style={styles.container}>
      {seconds > 0 ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            Resend code in{' '}
            <Text style={styles.timerValue}>{formatTime(seconds)}</Text>
          </Text>
        </View>
      ) : (
        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            onPress={() => handleResend(currentChannel)}
            disabled={disabled}
            style={styles.resendButton}
            icon={currentChannel === 'whatsapp' ? 'whatsapp' : 'message-text'}
          >
            Resend Code
          </Button>

          <TouchableOpacity
            onPress={() => handleResend(alternateChannel)}
            disabled={disabled}
            style={styles.alternateLink}
          >
            <Text style={styles.alternateLinkText}>
              {alternateLabel}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 24,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  timerValue: {
    fontWeight: '600',
    color: colors.primary,
  },
  actionsContainer: {
    alignItems: 'center',
  },
  resendButton: {
    borderRadius: 8,
    marginBottom: 12,
  },
  alternateLink: {
    padding: 8,
  },
  alternateLinkText: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default ResendTimer;
