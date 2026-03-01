import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export enum ServiceType {
  FINE_DINING = 'fine_dining',
  QUICK_SERVICE = 'quick_service',
  FAST_CASUAL = 'fast_casual',
  COFFEE_SHOP = 'coffee_shop',
  BUFFET = 'buffet',
  DRIVE_THRU = 'drive_thru',
  FOOD_TRUCK = 'food_truck',
  CHEFS_TABLE = 'chefs_table',
  CASUAL_DINING = 'casual_dining',
  PUB_BAR = 'pub_bar',
  CLUB = 'club',
}

export const SERVICE_TYPE_CONFIG: Record<ServiceType, {
  label: string;
  description: string;
  icon: string;
  features: string[];
  hasTableService: boolean;
  hasReservations: boolean;
  hasQueue: boolean;
  hasDeliveryToTable: boolean;
  hasDishBuilder: boolean;
  hasGeolocation: boolean;
  hasSommelier: boolean;
  hasBuffetScale: boolean;
  // Casual Dining specific flags
  hasWaitlistAdvanceDrinks?: boolean;
  hasCallWaiter?: boolean;
  hasPartialOrdering?: boolean;
  hasGroupSupport?: boolean;
}> = {
  [ServiceType.FINE_DINING]: {
    label: 'Fine Dining',
    description: 'Experiência gastronômica premium com serviço personalizado',
    icon: '🍷',
    features: ['Reservas', 'Sommelier', 'Menu Degustação', 'Mapa de Mesas'],
    hasTableService: true,
    hasReservations: true,
    hasQueue: false,
    hasDeliveryToTable: true,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: true,
    hasBuffetScale: false,
  },
  [ServiceType.QUICK_SERVICE]: {
    label: 'Serviço Rápido',
    description: 'Atendimento ágil com foco em conveniência',
    icon: '⚡',
    features: ['Pedido Antecipado', 'Skip the Line', 'Retirada Rápida'],
    hasTableService: false,
    hasReservations: false,
    hasQueue: true,
    hasDeliveryToTable: false,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: false,
  },
  [ServiceType.FAST_CASUAL]: {
    label: 'Fast Casual',
    description: 'Qualidade superior com customização total',
    icon: '🥗',
    features: ['Monte seu Prato', 'Ingredientes Frescos', 'Info Nutricional'],
    hasTableService: false,
    hasReservations: false,
    hasQueue: true,
    hasDeliveryToTable: true,
    hasDishBuilder: true,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: false,
  },
  [ServiceType.COFFEE_SHOP]: {
    label: 'Café/Padaria',
    description: 'Espaço versátil para consumo rápido ou trabalho',
    icon: '☕',
    features: ['Wi-Fi Grátis', 'Pedido na Mesa', 'Personalização de Bebidas'],
    hasTableService: true,
    hasReservations: false,
    hasQueue: true,
    hasDeliveryToTable: true,
    hasDishBuilder: true,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: false,
  },
  [ServiceType.BUFFET]: {
    label: 'Buffet/Self-Service',
    description: 'Cliente se serve, pagamento por peso ou fixo',
    icon: '🍽️',
    features: ['Balança Inteligente', 'Variedade Ilimitada', 'Self-Service'],
    hasTableService: false,
    hasReservations: false,
    hasQueue: false,
    hasDeliveryToTable: false,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: true,
  },
  [ServiceType.DRIVE_THRU]: {
    label: 'Drive-Thru',
    description: 'Serviço sem sair do carro',
    icon: '🚗',
    features: ['Detecção GPS', 'Pedido no Caminho', 'Reconhecimento de Placa'],
    hasTableService: false,
    hasReservations: false,
    hasQueue: true,
    hasDeliveryToTable: false,
    hasDishBuilder: false,
    hasGeolocation: true,
    hasSommelier: false,
    hasBuffetScale: false,
  },
  [ServiceType.FOOD_TRUCK]: {
    label: 'Food Truck',
    description: 'Operação móvel em eventos e locais variados',
    icon: '🚚',
    features: ['Localização em Tempo Real', 'Fila Virtual', 'Menu Sazonal'],
    hasTableService: false,
    hasReservations: false,
    hasQueue: true,
    hasDeliveryToTable: false,
    hasDishBuilder: false,
    hasGeolocation: true,
    hasSommelier: false,
    hasBuffetScale: false,
  },
  [ServiceType.CHEFS_TABLE]: {
    label: "Chef's Table",
    description: 'Experiência exclusiva com menu degustação',
    icon: '👨‍🍳',
    features: ['Chef Presente', 'Lugares Limitados', 'História dos Pratos'],
    hasTableService: true,
    hasReservations: true,
    hasQueue: false,
    hasDeliveryToTable: true,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: true,
    hasBuffetScale: false,
  },
  [ServiceType.CASUAL_DINING]: {
    label: 'Casual Dining',
    description: 'Restaurante tradicional com serviço de mesa e reserva opcional',
    icon: '🍽️',
    features: [
      'Reserva Opcional',
      'Lista de Espera Inteligente',
      'Chamar Garçom',
      'Pedido Parcial',
      'Suporte a Grupos',
    ],
    hasTableService: true,
    hasReservations: true,
    hasQueue: true,
    hasDeliveryToTable: true,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: false,
    hasWaitlistAdvanceDrinks: true,
    hasCallWaiter: true,
    hasPartialOrdering: true,
    hasGroupSupport: true,
  },
  [ServiceType.PUB_BAR]: {
    label: 'Pub & Bar',
    description: 'Ambiente social focado em bebidas com tab digital e happy hour',
    icon: '🍺',
    features: [
      'Tab Digital',
      'Tab Compartilhado',
      'Happy Hour Automático',
      'Repetir Rodada',
      'Split por Consumo',
    ],
    hasTableService: true,
    hasReservations: false,
    hasQueue: false,
    hasDeliveryToTable: true,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: false,
    hasWaitlistAdvanceDrinks: false,
    hasCallWaiter: true,
    hasPartialOrdering: false,
    hasGroupSupport: true,
  },
  [ServiceType.CLUB]: {
    label: 'Club & Balada',
    description: 'Entretenimento noturno com entrada, camarotes e fila virtual',
    icon: '🎵',
    features: [
      'Entrada Antecipada',
      'Reserva de Camarote',
      'Fila Virtual',
      'Tracker de Consumação',
      'Lotação em Tempo Real',
    ],
    hasTableService: true,
    hasReservations: true,
    hasQueue: true,
    hasDeliveryToTable: true,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: false,
    hasWaitlistAdvanceDrinks: false,
    hasCallWaiter: true,
    hasPartialOrdering: false,
    hasGroupSupport: true,
  },
};

interface NavigationState {
  currentScreen: string;
  previousScreens: string[];
  params: Record<string, any>;
}

interface MobilePreviewContextType {
  // Service Type
  serviceType: ServiceType;
  setServiceType: (type: ServiceType) => void;
  serviceConfig: typeof SERVICE_TYPE_CONFIG[ServiceType];
  
  // Navigation
  currentScreen: string;
  navigate: (screen: string, params?: Record<string, any>) => void;
  goBack: () => void;
  canGoBack: boolean;
  params: Record<string, any>;
  
  // App State
  isInSession: boolean;
  setIsInSession: (value: boolean) => void;
  currentTable: string | null;
  setCurrentTable: (table: string | null) => void;
  currentRestaurant: any | null;
  setCurrentRestaurant: (restaurant: any) => void;
  
  // Order State
  cartItems: any[];
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  
  // Guest/Shared Order State
  guests: any[];
  setGuests: (guests: any[]) => void;
  isSharedOrder: boolean;
  setIsSharedOrder: (value: boolean) => void;
}

const MobilePreviewContext = createContext<MobilePreviewContextType | undefined>(undefined);

export function MobilePreviewProvider({ children, initialScreen = 'home' }: { children: ReactNode; initialScreen?: string }) {
  // Service Type
  const [serviceType, setServiceTypeState] = useState<ServiceType>(ServiceType.FINE_DINING);
  
  // Navigation
  const [navigation, setNavigation] = useState<NavigationState>({
    currentScreen: initialScreen,
    previousScreens: [],
    params: {},
  });
  
  // App State
  const [isInSession, setIsInSession] = useState(false);
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [currentRestaurant, setCurrentRestaurant] = useState<any | null>(null);
  
  // Order State
  const [cartItems, setCartItems] = useState<any[]>([]);
  
  // Guest State
  const [guests, setGuests] = useState<any[]>([]);
  const [isSharedOrder, setIsSharedOrder] = useState(false);

  const setServiceType = useCallback((type: ServiceType) => {
    setServiceTypeState(type);
  }, []);

  const navigate = useCallback((screen: string, params: Record<string, any> = {}) => {
    setNavigation(prev => ({
      currentScreen: screen,
      previousScreens: [...prev.previousScreens, prev.currentScreen],
      params,
    }));
  }, []);

  const goBack = useCallback(() => {
    setNavigation(prev => {
      if (prev.previousScreens.length === 0) return prev;
      const newPrevious = [...prev.previousScreens];
      const lastScreen = newPrevious.pop()!;
      return {
        currentScreen: lastScreen,
        previousScreens: newPrevious,
        params: {},
      };
    });
  }, []);

  const addToCart = useCallback((item: any) => {
    setCartItems(prev => [...prev, { ...item, cartId: Date.now().toString() }]);
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value: MobilePreviewContextType = {
    serviceType,
    setServiceType,
    serviceConfig: SERVICE_TYPE_CONFIG[serviceType],
    currentScreen: navigation.currentScreen,
    navigate,
    goBack,
    canGoBack: navigation.previousScreens.length > 0,
    params: navigation.params,
    isInSession,
    setIsInSession,
    currentTable,
    setCurrentTable,
    currentRestaurant,
    setCurrentRestaurant,
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    guests,
    setGuests,
    isSharedOrder,
    setIsSharedOrder,
  };

  return (
    <MobilePreviewContext.Provider value={value}>
      {children}
    </MobilePreviewContext.Provider>
  );
}

export function useMobilePreview() {
  const context = useContext(MobilePreviewContext);
  if (context === undefined) {
    throw new Error('useMobilePreview must be used within a MobilePreviewProvider');
  }
  return context;
}
