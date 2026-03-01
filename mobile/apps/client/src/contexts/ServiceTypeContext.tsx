import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ServiceType = 
  | 'full-service'
  | 'quick-service'
  | 'fast-casual'
  | 'cafe-bakery'
  | 'buffet'
  | 'drive-thru'
  | 'food-truck'
  | 'chefs-table'
  | 'casual-dining'
  | 'pub-bar'
  | 'club';

interface ServiceTypeFeatures {
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
  groupTab: boolean;
  happyHour: boolean;
  repeatRound: boolean;
  tabSplit: boolean;
  // Club features
  ticketPurchase: boolean;
  vipTables: boolean;
  guestList: boolean;
  occupancyTracking: boolean;
  lineup: boolean;
  birthdayEntry: boolean;
  promoterSystem: boolean;
}

interface ServiceTypeConfig {
  type: ServiceType;
  name: string;
  description: string;
  icon: string;
  features: ServiceTypeFeatures;
}

const DEFAULT_FEATURES: ServiceTypeFeatures = {
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
  digitalTab: false,
  groupTab: false,
  happyHour: false,
  repeatRound: false,
  tabSplit: false,
  ticketPurchase: false,
  vipTables: false,
  guestList: false,
  occupancyTracking: false,
  lineup: false,
  birthdayEntry: false,
  promoterSystem: false,
};

const SERVICE_TYPE_CONFIGS: Record<ServiceType, ServiceTypeConfig> = {
  'full-service': {
    type: 'full-service',
    name: 'Full-Service',
    description: 'Restaurante tradicional com serviço completo de mesa',
    icon: 'utensils',
    features: { ...DEFAULT_FEATURES, reservations: true, virtualQueue: true, tableManagement: true, menuPersonalization: true, callWaiter: true, splitPayment: true, guestInvitations: true, aiPairing: true, loyalty: true },
  },
  'quick-service': {
    type: 'quick-service',
    name: 'Quick Service',
    description: 'Serviço rápido no balcão',
    icon: 'zap',
    features: { ...DEFAULT_FEATURES, virtualQueue: true, splitPayment: true, loyalty: true },
  },
  'fast-casual': {
    type: 'fast-casual',
    name: 'Fast Casual',
    description: 'Monte seu prato com ingredientes frescos',
    icon: 'chef-hat',
    features: { ...DEFAULT_FEATURES, virtualQueue: true, menuPersonalization: true, dishBuilder: true, splitPayment: true, aiPairing: true, loyalty: true },
  },
  'cafe-bakery': {
    type: 'cafe-bakery',
    name: 'Café & Padaria',
    description: 'Cafeteria e padaria com ambiente acolhedor',
    icon: 'coffee',
    features: { ...DEFAULT_FEATURES, callWaiter: true, splitPayment: true, aiPairing: true, loyalty: true },
  },
  'buffet': {
    type: 'buffet',
    name: 'Buffet',
    description: 'Buffet self-service por peso ou preço fixo',
    icon: 'layout-grid',
    features: { ...DEFAULT_FEATURES, reservations: true, virtualQueue: true, tableManagement: true, callWaiter: true, splitPayment: true, guestInvitations: true, loyalty: true },
  },
  'drive-thru': {
    type: 'drive-thru',
    name: 'Drive-Thru',
    description: 'Pedido e retirada sem sair do carro',
    icon: 'car',
    features: { ...DEFAULT_FEATURES, virtualQueue: true, geolocationTracking: true, loyalty: true },
  },
  'food-truck': {
    type: 'food-truck',
    name: 'Food Truck',
    description: 'Comida de rua com localização móvel',
    icon: 'truck',
    features: { ...DEFAULT_FEATURES, virtualQueue: true, geolocationTracking: true, loyalty: true },
  },
  'chefs-table': {
    type: 'chefs-table',
    name: "Chef's Table",
    description: 'Experiência gastronômica exclusiva',
    icon: 'crown',
    features: { ...DEFAULT_FEATURES, reservations: true, tableManagement: true, menuPersonalization: true, callWaiter: true, splitPayment: true, guestInvitations: true, aiPairing: true, loyalty: true },
  },
  'casual-dining': {
    type: 'casual-dining',
    name: 'Casual Dining',
    description: 'Restaurante casual com reserva opcional e lista de espera',
    icon: 'utensils',
    features: { ...DEFAULT_FEATURES, reservations: true, virtualQueue: true, tableManagement: true, callWaiter: true, splitPayment: true, guestInvitations: true, loyalty: true },
  },
  'pub-bar': {
    type: 'pub-bar',
    name: 'Pub & Bar',
    description: 'Ambiente social focado em bebidas com tabs digitais',
    icon: 'beer',
    features: { ...DEFAULT_FEATURES, tableManagement: true, callWaiter: true, splitPayment: true, loyalty: true, digitalTab: true, groupTab: true, happyHour: true, repeatRound: true, tabSplit: true },
  },
  'club': {
    type: 'club',
    name: 'Club & Balada',
    description: 'Entretenimento noturno com entrada, camarotes e fila virtual',
    icon: 'music',
    features: { ...DEFAULT_FEATURES, virtualQueue: true, tableManagement: true, callWaiter: true, guestInvitations: true, loyalty: true, ticketPurchase: true, vipTables: true, guestList: true, occupancyTracking: true, lineup: true, birthdayEntry: true, promoterSystem: true },
  },
};

interface ServiceTypeContextValue {
  currentServiceType: ServiceType | null;
  config: ServiceTypeConfig | null;
  setServiceType: (type: ServiceType) => void;
  isFeatureEnabled: (feature: keyof ServiceTypeFeatures) => boolean;
  getAllConfigs: () => ServiceTypeConfig[];
}

const ServiceTypeContext = createContext<ServiceTypeContextValue | undefined>(undefined);

interface ServiceTypeProviderProps {
  children: ReactNode;
  initialType?: ServiceType;
}

export const ServiceTypeProvider: React.FC<ServiceTypeProviderProps> = ({ 
  children, 
  initialType = 'full-service' 
}) => {
  const [currentServiceType, setCurrentServiceType] = useState<ServiceType | null>(initialType);

  const config = currentServiceType ? SERVICE_TYPE_CONFIGS[currentServiceType] : null;

  const setServiceType = (type: ServiceType) => {
    setCurrentServiceType(type);
  };

  const isFeatureEnabled = (feature: keyof ServiceTypeFeatures): boolean => {
    if (!config) return false;
    return config.features[feature];
  };

  const getAllConfigs = (): ServiceTypeConfig[] => {
    return Object.values(SERVICE_TYPE_CONFIGS);
  };

  return (
    <ServiceTypeContext.Provider
      value={{
        currentServiceType,
        config,
        setServiceType,
        isFeatureEnabled,
        getAllConfigs,
      }}
    >
      {children}
    </ServiceTypeContext.Provider>
  );
};

export const useServiceType = (): ServiceTypeContextValue => {
  const context = useContext(ServiceTypeContext);
  if (!context) {
    throw new Error('useServiceType must be used within a ServiceTypeProvider');
  }
  return context;
};

export { SERVICE_TYPE_CONFIGS };
