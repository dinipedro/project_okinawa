import { useMemo } from 'react';
import { useServiceType, ServiceType } from '../contexts/ServiceTypeContext';

interface FeatureAvailability {
  reservations: boolean;
  virtualQueue: boolean;
  tableManagement: boolean;
  menuPersonalization: boolean;
  geolocationTracking: boolean;
  dishBuilder: boolean;
  callWaiter: boolean;
  splitPayment: boolean;
  guestInvitations: boolean;
  aiPairing: boolean;
  loyalty: boolean;
  // Pub & Bar features
  digitalTab: boolean;
  happyHour: boolean;
  repeatRound: boolean;
  tabSplit: boolean;
  // Club & Balada features
  ticketPurchase: boolean;
  vipTables: boolean;
  guestList: boolean;
  occupancyTracking: boolean;
  lineup: boolean;
  birthdayEntry: boolean;
}

interface ServiceTypeFeatureHook {
  features: FeatureAvailability;
  serviceType: ServiceType | null;
  serviceName: string;
  isFeatureEnabled: (feature: keyof FeatureAvailability) => boolean;
  getEnabledFeatures: () => (keyof FeatureAvailability)[];
  getDisabledFeatures: () => (keyof FeatureAvailability)[];
}

const DEFAULT_FEATURES: FeatureAvailability = {
  reservations: false,
  virtualQueue: false,
  tableManagement: false,
  menuPersonalization: false,
  geolocationTracking: false,
  dishBuilder: false,
  callWaiter: false,
  splitPayment: false,
  guestInvitations: false,
  aiPairing: false,
  loyalty: false,
  // Pub & Bar
  digitalTab: false,
  happyHour: false,
  repeatRound: false,
  tabSplit: false,
  // Club & Balada
  ticketPurchase: false,
  vipTables: false,
  guestList: false,
  occupancyTracking: false,
  lineup: false,
  birthdayEntry: false,
};

export const useServiceTypeFeatures = (): ServiceTypeFeatureHook => {
  const { currentServiceType, config, isFeatureEnabled } = useServiceType();

  const features = useMemo<FeatureAvailability>(() => {
    if (!config) return DEFAULT_FEATURES;
    return config.features;
  }, [config]);

  const serviceName = useMemo(() => {
    return config?.name ?? 'Desconhecido';
  }, [config]);

  const getEnabledFeatures = (): (keyof FeatureAvailability)[] => {
    return (Object.keys(features) as (keyof FeatureAvailability)[]).filter(
      (key) => features[key]
    );
  };

  const getDisabledFeatures = (): (keyof FeatureAvailability)[] => {
    return (Object.keys(features) as (keyof FeatureAvailability)[]).filter(
      (key) => !features[key]
    );
  };

  return {
    features,
    serviceType: currentServiceType,
    serviceName,
    isFeatureEnabled,
    getEnabledFeatures,
    getDisabledFeatures,
  };
};

// Hook to conditionally render based on service type
export const useConditionalFeature = (feature: keyof FeatureAvailability): boolean => {
  const { isFeatureEnabled } = useServiceType();
  return isFeatureEnabled(feature);
};

// Hook to get service-type specific UI configurations
export const useServiceTypeUI = () => {
  const { currentServiceType, config } = useServiceType();

  const getOrderFlowType = (): 'table' | 'counter' | 'queue' | 'pickup' => {
    switch (currentServiceType) {
      case 'full-service':
      case 'chefs-table':
      case 'buffet':
        return 'table';
      case 'quick-service':
      case 'cafe-bakery':
        return 'counter';
      case 'fast-casual':
        return 'queue';
      case 'drive-thru':
      case 'food-truck':
        return 'pickup';
      default:
        return 'counter';
    }
  };

  const getPaymentTiming = (): 'pre-order' | 'post-meal' | 'immediate' => {
    switch (currentServiceType) {
      case 'full-service':
      case 'chefs-table':
      case 'buffet':
        return 'post-meal';
      case 'quick-service':
      case 'fast-casual':
      case 'drive-thru':
      case 'food-truck':
        return 'pre-order';
      case 'cafe-bakery':
        return 'immediate';
      default:
        return 'immediate';
    }
  };

  const shouldShowTableSelection = (): boolean => {
    return ['full-service', 'chefs-table', 'buffet'].includes(currentServiceType ?? '');
  };

  const shouldShowQueuePosition = (): boolean => {
    return ['quick-service', 'fast-casual', 'drive-thru', 'food-truck'].includes(currentServiceType ?? '');
  };

  const getMenuStyle = (): 'traditional' | 'builder' | 'buffet' | 'simple' => {
    switch (currentServiceType) {
      case 'fast-casual':
        return 'builder';
      case 'buffet':
        return 'buffet';
      case 'quick-service':
      case 'drive-thru':
      case 'food-truck':
        return 'simple';
      default:
        return 'traditional';
    }
  };

  return {
    serviceType: currentServiceType,
    serviceName: config?.name ?? '',
    serviceIcon: config?.icon ?? 'restaurant',
    orderFlowType: getOrderFlowType(),
    paymentTiming: getPaymentTiming(),
    shouldShowTableSelection: shouldShowTableSelection(),
    shouldShowQueuePosition: shouldShowQueuePosition(),
    menuStyle: getMenuStyle(),
  };
};
