import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useServiceType, ServiceType } from '../contexts/ServiceTypeContext';
import { useConditionalFeature } from '../hooks/useServiceTypeFeatures';
import { colors } from '../../../shared/theme/colors';
import { typography } from '../../../shared/theme/typography';
import { spacing } from '../../../shared/theme/spacing';

interface ConditionalFeatureProps {
  feature: 
    | 'reservations'
    | 'virtualQueue'
    | 'tableManagement'
    | 'menuPersonalization'
    | 'geolocationTracking'
    | 'dishBuilder'
    | 'callWaiter'
    | 'splitPayment'
    | 'guestInvitations'
    | 'aiPairing'
    | 'loyalty';
  children: ReactNode;
  fallback?: ReactNode;
}

// Conditionally render children based on feature availability
export const ConditionalFeature: React.FC<ConditionalFeatureProps> = ({
  feature,
  children,
  fallback = null,
}) => {
  const isEnabled = useConditionalFeature(feature);
  return <>{isEnabled ? children : fallback}</>;
};

interface ServiceTypeGateProps {
  allowedTypes: ServiceType[];
  children: ReactNode;
  fallback?: ReactNode;
}

// Only render children for specific service types
export const ServiceTypeGate: React.FC<ServiceTypeGateProps> = ({
  allowedTypes,
  children,
  fallback = null,
}) => {
  const { currentServiceType } = useServiceType();
  
  if (!currentServiceType || !allowedTypes.includes(currentServiceType)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

interface ServiceTypeSwitchProps {
  cases: Partial<Record<ServiceType, ReactNode>>;
  default?: ReactNode;
}

// Switch between different content based on service type
export const ServiceTypeSwitch: React.FC<ServiceTypeSwitchProps> = ({
  cases,
  default: defaultCase = null,
}) => {
  const { currentServiceType } = useServiceType();
  
  if (!currentServiceType) {
    return <>{defaultCase}</>;
  }
  
  const content = cases[currentServiceType];
  return <>{content ?? defaultCase}</>;
};

interface FeatureUnavailableMessageProps {
  feature: string;
  message?: string;
}

// Display message when a feature is not available for current service type
export const FeatureUnavailableMessage: React.FC<FeatureUnavailableMessageProps> = ({
  feature,
  message,
}) => {
  const { config } = useServiceType();
  
  return (
    <View style={styles.unavailableContainer}>
      <Text style={styles.unavailableTitle}>
        {feature} não disponível
      </Text>
      <Text style={styles.unavailableText}>
        {message ?? `Esta funcionalidade não está disponível para ${config?.name ?? 'este tipo de estabelecimento'}.`}
      </Text>
    </View>
  );
};

interface ServiceTypeBadgeProps {
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Display current service type as a badge
export const ServiceTypeBadge: React.FC<ServiceTypeBadgeProps> = ({
  showIcon = true,
  size = 'medium',
}) => {
  const { config } = useServiceType();
  
  if (!config) return null;
  
  const sizeStyles = {
    small: styles.badgeSmall,
    medium: styles.badgeMedium,
    large: styles.badgeLarge,
  };
  
  const textStyles = {
    small: styles.badgeTextSmall,
    medium: styles.badgeTextMedium,
    large: styles.badgeTextLarge,
  };
  
  return (
    <View style={[styles.badge, sizeStyles[size]]}>
      <Text style={textStyles[size]}>{config.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  unavailableContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    alignItems: 'center',
  },
  unavailableTitle: {
    ...typography.headings.h4,
    color: colors.neutral.gray700,
    marginBottom: spacing.xs,
  },
  unavailableText: {
    ...typography.body.medium,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: colors.primary.orange + '20',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeMedium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeLarge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  badgeTextSmall: {
    ...typography.body.small,
    color: colors.primary.orange,
    fontWeight: '600',
  },
  badgeTextMedium: {
    ...typography.body.medium,
    color: colors.primary.orange,
    fontWeight: '600',
  },
  badgeTextLarge: {
    ...typography.body.large,
    color: colors.primary.orange,
    fontWeight: '600',
  },
});
