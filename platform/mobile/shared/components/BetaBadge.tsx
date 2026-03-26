/**
 * BetaBadge - Small badge component that shows a "BETA" label.
 *
 * Used to indicate experimental features throughout the app.
 * Visibility is controlled via a `visible` prop (driven by feature flags).
 *
 * Positioned absolutely at top-right of its parent container so the
 * parent should have `position: 'relative'` or be a wrapping View.
 *
 * @example
 * <View style={{ position: 'relative' }}>
 *   <BetaBadge visible={featureFlags.aiPairing} />
 *   <Text>AI Pairing</Text>
 * </View>
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

interface BetaBadgeProps {
  /** When false, the badge is not rendered. */
  visible: boolean;
}

export const BetaBadge: React.FC<BetaBadgeProps> = ({ visible }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>BETA</Text>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.warning || '#F59E0B',
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
      zIndex: 10,
    },
    label: {
      fontSize: 9,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
  });

export default BetaBadge;
