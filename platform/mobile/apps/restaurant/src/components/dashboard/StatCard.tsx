import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

interface StatCardProps {
  icon: string;
  iconColor?: string;
  value: string | number;
  label: string;
  onPress?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({
  icon,
  iconColor,
  value,
  label,
  onPress,
  trend,
}: StatCardProps) {
  const colors = useColors();
  const finalIconColor = iconColor || colors.primary;

  const styles = useMemo(() => StyleSheet.create({
    card: {
      width: '48%',
      margin: 8,
      elevation: 2,
      backgroundColor: colors.card,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    icon: {
      margin: 0,
      padding: 0,
    },
    textContainer: {
      flex: 1,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    value: {
      fontWeight: 'bold',
      color: colors.foreground,
    },
    label: {
      color: colors.foregroundMuted,
      marginTop: 4,
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    trendIcon: {
      margin: 0,
      padding: 0,
    },
    trendText: {
      fontWeight: '600',
      fontSize: 12,
    },
  }), [colors]);

  const CardContent = () => (
    <Card.Content style={styles.content}>
      <IconButton icon={icon} size={32} iconColor={finalIconColor} style={styles.icon} />
      <View style={styles.textContainer}>
        <View style={styles.valueRow}>
          <Text variant="displaySmall" style={styles.value}>
            {value}
          </Text>
          {trend && (
            <View style={styles.trendContainer}>
              <IconButton
                icon={trend.isPositive ? 'trending-up' : 'trending-down'}
                size={16}
                iconColor={trend.isPositive ? colors.success : '#d32f2f'}
                style={styles.trendIcon}
              />
              <Text
                variant="bodySmall"
                style={[styles.trendText, { color: trend.isPositive ? colors.success : '#d32f2f' }]}
              >
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>
        <Text variant="bodyMedium" style={styles.label}>
          {label}
        </Text>
      </View>
    </Card.Content>
  );

  return (
    <Card style={styles.card} onPress={onPress}>
      {CardContent()}
    </Card>
  );
}
