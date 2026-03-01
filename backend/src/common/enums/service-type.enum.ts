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

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.FINE_DINING]: 'Fine Dining',
  [ServiceType.QUICK_SERVICE]: 'Serviço Rápido',
  [ServiceType.FAST_CASUAL]: 'Fast Casual',
  [ServiceType.COFFEE_SHOP]: 'Café/Padaria',
  [ServiceType.BUFFET]: 'Buffet/Self-Service',
  [ServiceType.DRIVE_THRU]: 'Drive-Thru',
  [ServiceType.FOOD_TRUCK]: 'Food Truck',
  [ServiceType.CHEFS_TABLE]: "Chef's Table",
  [ServiceType.CASUAL_DINING]: 'Casual Dining',
  [ServiceType.PUB_BAR]: 'Pub & Bar',
  [ServiceType.CLUB]: 'Club & Balada',
};

export const SERVICE_TYPE_DESCRIPTIONS: Record<ServiceType, string> = {
  [ServiceType.FINE_DINING]:
    'Experiência gastronômica premium com serviço personalizado e atendimento à mesa',
  [ServiceType.QUICK_SERVICE]:
    'Atendimento ágil, menu padronizado, foco em conveniência e velocidade',
  [ServiceType.FAST_CASUAL]:
    'Qualidade superior ao fast food, customização, ambiente agradável',
  [ServiceType.COFFEE_SHOP]:
    'Espaço versátil para consumo rápido ou permanência prolongada',
  [ServiceType.BUFFET]:
    'Cliente se serve, pagamento por peso ou fixo, alta rotatividade',
  [ServiceType.DRIVE_THRU]: 'Serviço sem sair do carro com identificação veicular',
  [ServiceType.FOOD_TRUCK]: 'Operação móvel em eventos e locais variados',
  [ServiceType.CHEFS_TABLE]: 'Experiência exclusiva com menu degustação e chef presente',
  [ServiceType.CASUAL_DINING]:
    'Restaurante tradicional com serviço de mesa, ambiente familiar e reserva opcional',
  [ServiceType.PUB_BAR]:
    'Estabelecimento focado em bebidas com ambiente social para conversas e encontros prolongados',
  [ServiceType.CLUB]:
    'Entretenimento noturno com música, dança, camarotes e experiência social',
};

export const SERVICE_TYPE_FEATURES: Record<ServiceType, string[]> = {
  [ServiceType.FINE_DINING]: [
    'Reservas antecipadas',
    'Sommelier disponível',
    'Menu degustação',
    'Atendimento personalizado',
    'Mapa de mesas digital',
  ],
  [ServiceType.QUICK_SERVICE]: [
    'Pedido antecipado',
    'Skip the Line',
    'Retirada rápida',
    'Pagamento pelo app',
    'Status em tempo real',
  ],
  [ServiceType.FAST_CASUAL]: [
    'Monte seu prato',
    'Ingredientes frescos',
    'Customização total',
    'Informações nutricionais',
    'Pedido híbrido',
  ],
  [ServiceType.COFFEE_SHOP]: [
    'Wi-Fi grátis',
    'Espaço para trabalho',
    'Personalização de bebidas',
    'Pedido na mesa por QR',
    'Programa de fidelidade',
  ],
  [ServiceType.BUFFET]: [
    'Variedade ilimitada',
    'Pagamento por peso',
    'Balança inteligente',
    'Self-service',
    'Sem filas no caixa',
  ],
  [ServiceType.DRIVE_THRU]: [
    'Sem sair do carro',
    'Detecção por GPS',
    'Pedido no caminho',
    'Múltiplas janelas',
    'Reconhecimento de placa',
  ],
  [ServiceType.FOOD_TRUCK]: [
    'Localização em tempo real',
    'Fila virtual',
    'Modo offline',
    'Notificações de localização',
    'Menu sazonal',
  ],
  [ServiceType.CHEFS_TABLE]: [
    'Experiência exclusiva',
    'Chef presente',
    'Menu degustação',
    'Lugares limitados',
    'História dos pratos',
  ],
  [ServiceType.CASUAL_DINING]: [
    'Reserva opcional',
    'Lista de espera inteligente',
    'Serviço de mesa',
    'Chamar garçom',
    'Pedido parcial pelo app',
    'Suporte a grupos',
  ],
  [ServiceType.PUB_BAR]: [
    'Tab digital individual/grupo',
    'Happy Hour automático',
    'Pedir rodada',
    'Split por consumo',
    'Pré-autorização de cartão',
    'Crédito de entrada',
    'Chamar garçom',
  ],
  [ServiceType.CLUB]: [
    'Entrada antecipada',
    'Lista de convidados',
    'Reserva de camarote',
    'Lineup de atrações',
    'Fila virtual com prioridade',
    'Tracker de consumação mínima',
    'Bottle service',
    'Check-in/out digital',
  ],
};
