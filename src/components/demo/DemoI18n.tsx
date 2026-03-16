import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type DemoLang = 'pt' | 'en' | 'es';

type TranslationSection = keyof typeof DEMO_TRANSLATIONS;

type ReplacementRule = [RegExp, string];

const LANG_META: Record<DemoLang, { label: string }> = {
  pt: { label: 'PT' },
  en: { label: 'EN' },
  es: { label: 'ES' },
};

export const DEMO_TRANSLATIONS = {
  shared: {
    backToDemo: { pt: 'Voltar à demo', en: 'Back to demo', es: 'Volver a la demo' },
    viewClientDemo: { pt: 'Ver Demo Cliente →', en: 'View Client Demo →', es: 'Ver Demo Cliente →' },
    viewRestaurantDemo: { pt: 'Ver Demo Restaurante →', en: 'View Restaurant Demo →', es: 'Ver Demo Restaurante →' },
    demoClient: { pt: 'Demo Cliente', en: 'Client Demo', es: 'Demo Cliente' },
    demoRestaurant: { pt: 'Demo Restaurante', en: 'Restaurant Demo', es: 'Demo Restaurante' },
    followSteps: { pt: 'Siga os passos ou explore livremente', en: 'Follow the steps or explore freely', es: 'Sigue los pasos o explora libremente' },
    stepsInJourney: { pt: 'etapas na jornada', en: 'steps in the journey', es: 'etapas en el recorrido' },
    wantThis: { pt: 'Quer isso no seu restaurante?', en: 'Want this for your restaurant?', es: '¿Quieres esto en tu restaurante?' },
    ctaDesc: { pt: 'Leve a experiência NOOWE para sua operação.', en: 'Bring the NOOWE experience to your operation.', es: 'Lleva la experiencia NOOWE a tu operación.' },
    ctaDescClient: { pt: 'Leve a experiência NOOWE para seus clientes.', en: 'Bring the NOOWE experience to your customers.', es: 'Lleva la experiencia NOOWE a tus clientes.' },
    talkToTeam: { pt: 'Falar com a equipe', en: 'Talk to our team', es: 'Hablar con el equipo' },
    otherProfiles: { pt: 'Outros perfis', en: 'Other profiles', es: 'Otros perfiles' },
  },
  client: {
    title: { pt: 'Demo Cliente | NOOWE — Experiência Interativa', en: 'Client Demo | NOOWE — Interactive Experience', es: 'Demo Cliente | NOOWE — Experiencia Interactiva' },
    metaDesc: { pt: 'Experimente o app NOOWE como um cliente real. 11 tipos de serviço, jornadas completas e interativas.', en: 'Experience the NOOWE app as a real customer. 11 service types, full interactive journeys.', es: 'Experimenta la app NOOWE como un cliente real. 11 tipos de servicio, recorridos completos e interactivos.' },
    chooseExperience: { pt: 'Escolha a experiência', en: 'Choose the experience', es: 'Elige la experiencia' },
    clientJourney: { pt: 'Jornada do Cliente', en: 'Client Journey', es: 'Recorrido del Cliente' },
  },
  restaurant: {
    title: { pt: 'Demo Restaurante | NOOWE — Experiência Interativa', en: 'Restaurant Demo | NOOWE — Interactive Experience', es: 'Demo Restaurante | NOOWE — Experiencia Interactiva' },
    metaDesc: { pt: 'Experimente o app restaurante da NOOWE com 7 perfis operacionais, 22 telas especializadas e jornadas guiadas interativas.', en: 'Experience the NOOWE restaurant app with 7 operational profiles, 22 specialized screens, and interactive guided journeys.', es: 'Experimenta la app de restaurante NOOWE con 7 perfiles operativos, 22 pantallas especializadas y recorridos guiados interactivos.' },
    chooseProfile: { pt: 'Escolha o perfil', en: 'Choose the profile', es: 'Elige el perfil' },
    journeyOf: { pt: 'Jornada do', en: 'Journey of the', es: 'Recorrido del' },
  },
  serviceTypes: {
    'fine-dining': { pt: 'Fine Dining', en: 'Fine Dining', es: 'Fine Dining' },
    'quick-service': { pt: 'Quick Service', en: 'Quick Service', es: 'Servicio Rápido' },
    'fast-casual': { pt: 'Fast Casual', en: 'Fast Casual', es: 'Fast Casual' },
    'cafe-bakery': { pt: 'Café & Padaria', en: 'Café & Bakery', es: 'Café y Panadería' },
    buffet: { pt: 'Buffet', en: 'Buffet', es: 'Buffet' },
    'drive-thru': { pt: 'Drive-Thru', en: 'Drive-Thru', es: 'Drive-Thru' },
    'food-truck': { pt: 'Food Truck', en: 'Food Truck', es: 'Food Truck' },
    'chefs-table': { pt: "Chef's Table", en: "Chef's Table", es: 'Mesa del Chef' },
    'casual-dining': { pt: 'Casual Dining', en: 'Casual Dining', es: 'Casual Dining' },
    'pub-bar': { pt: 'Pub & Bar', en: 'Pub & Bar', es: 'Pub y Bar' },
    club: { pt: 'Club & Balada', en: 'Club & Nightlife', es: 'Club y Discoteca' },
  },
  serviceTypeTaglines: {
    'fine-dining': { pt: 'Experiência gastronômica premium', en: 'Premium dining experience', es: 'Experiencia gastronómica premium' },
    'quick-service': { pt: 'Velocidade e conveniência', en: 'Speed and convenience', es: 'Velocidad y conveniencia' },
    'fast-casual': { pt: 'Monte seu prato ideal', en: 'Build your perfect meal', es: 'Arma tu plato ideal' },
    'cafe-bakery': { pt: 'Seu espaço, seu ritmo', en: 'Your space, your pace', es: 'Tu espacio, tu ritmo' },
    buffet: { pt: 'Sirva-se à vontade', en: 'Serve yourself freely', es: 'Sírvete a tu gusto' },
    'drive-thru': { pt: 'Sem sair do carro', en: 'Without leaving your car', es: 'Sin bajar del auto' },
    'food-truck': { pt: 'Comida de rua premium', en: 'Premium street food', es: 'Comida callejera premium' },
    'chefs-table': { pt: 'Exclusividade absoluta', en: 'Absolute exclusivity', es: 'Exclusividad absoluta' },
    'casual-dining': { pt: 'Sabor em família', en: 'Family flavor', es: 'Sabor en familia' },
    'pub-bar': { pt: 'Drinks e boa companhia', en: 'Drinks and great company', es: 'Tragos y buena compañía' },
    club: { pt: 'Noite sem limites', en: 'Night without limits', es: 'Noche sin límites' },
  },
  roles: {
    owner: { pt: 'Dono', en: 'Owner', es: 'Dueño' },
    manager: { pt: 'Gerente', en: 'Manager', es: 'Gerente' },
    maitre: { pt: 'Maitre', en: 'Maître', es: 'Maître' },
    chef: { pt: 'Chef', en: 'Chef', es: 'Chef' },
    barman: { pt: 'Barman', en: 'Bartender', es: 'Barman' },
    cook: { pt: 'Cozinheiro', en: 'Cook', es: 'Cocinero' },
    waiter: { pt: 'Garçom', en: 'Waiter', es: 'Mesero' },
  },
  roleDescs: {
    owner: { pt: 'Visão executiva completa', en: 'Full executive overview', es: 'Visión ejecutiva completa' },
    manager: { pt: 'Operação e aprovações', en: 'Operations & approvals', es: 'Operaciones y aprobaciones' },
    maitre: { pt: 'Reservas e fluxo do salão', en: 'Reservations & floor flow', es: 'Reservas y flujo del salón' },
    chef: { pt: 'KDS e gestão de cardápio', en: 'KDS & menu management', es: 'KDS y gestión del menú' },
    barman: { pt: 'Bar, drinks e estoque', en: 'Bar, drinks & stock', es: 'Bar, tragos e inventario' },
    cook: { pt: 'Estação de preparo', en: 'Prep station', es: 'Estación de preparación' },
    waiter: { pt: 'Mesas, pedidos e gorjetas', en: 'Tables, orders & tips', es: 'Mesas, pedidos y propinas' },
  },
  journeySteps: {
    dashboard: { pt: 'Dashboard', en: 'Dashboard', es: 'Dashboard' },
    'table-map': { pt: 'Mapa de Mesas', en: 'Table Map', es: 'Mapa de Mesas' },
    orders: { pt: 'Pedidos', en: 'Orders', es: 'Pedidos' },
    'kds-kitchen': { pt: 'KDS Cozinha', en: 'Kitchen KDS', es: 'KDS Cocina' },
    'kds-bar': { pt: 'KDS Bar', en: 'Bar KDS', es: 'KDS Bar' },
    analytics: { pt: 'Analytics', en: 'Analytics', es: 'Analytics' },
    team: { pt: 'Equipe', en: 'Team', es: 'Equipo' },
    'menu-editor': { pt: 'Cardápio', en: 'Menu', es: 'Menú' },
    setup: { pt: 'Configuração', en: 'Settings', es: 'Configuración' },
    'manager-ops': { pt: 'Painel Operacional', en: 'Operations Panel', es: 'Panel Operativo' },
    approvals: { pt: 'Aprovações', en: 'Approvals', es: 'Aprobaciones' },
    'daily-report': { pt: 'Relatório do Dia', en: 'Daily Report', es: 'Informe del Día' },
    stock: { pt: 'Estoque', en: 'Stock', es: 'Inventario' },
    maitre: { pt: 'Reservas', en: 'Reservations', es: 'Reservas' },
    'floor-flow': { pt: 'Fluxo do Salão', en: 'Floor Flow', es: 'Flujo del Salón' },
    'barman-station': { pt: 'Minha Estação', en: 'My Station', es: 'Mi Estación' },
    'drink-recipes': { pt: 'Receitas', en: 'Recipes', es: 'Recetas' },
    'cook-station': { pt: 'Minha Estação', en: 'My Station', es: 'Mi Estación' },
    waiter: { pt: 'Minhas Mesas', en: 'My Tables', es: 'Mis Mesas' },
    'waiter-calls': { pt: 'Chamados', en: 'Calls', es: 'Llamados' },
    'waiter-tips': { pt: 'Gorjetas', en: 'Tips', es: 'Propinas' },
  },
  screenTitles: {
    welcome: { pt: 'Bem-vindo ao NOOWE', en: 'Welcome to NOOWE', es: 'Bienvenido a NOOWE' },
    setup: { pt: 'Configuração', en: 'Settings', es: 'Configuración' },
    dashboard: { pt: 'Dashboard Executivo', en: 'Executive Dashboard', es: 'Dashboard Ejecutivo' },
    'table-map': { pt: 'Mapa de Mesas', en: 'Table Map', es: 'Mapa de Mesas' },
    orders: { pt: 'Gestão de Pedidos', en: 'Order Management', es: 'Gestión de Pedidos' },
    'kds-kitchen': { pt: 'KDS — Cozinha', en: 'KDS — Kitchen', es: 'KDS — Cocina' },
    'kds-bar': { pt: 'KDS — Bar', en: 'KDS — Bar', es: 'KDS — Bar' },
    maitre: { pt: 'Painel do Maitre', en: 'Maître Panel', es: 'Panel del Maître' },
    waiter: { pt: 'Visão do Garçom', en: 'Waiter View', es: 'Vista del Mesero' },
    'menu-editor': { pt: 'Editor de Cardápio', en: 'Menu Editor', es: 'Editor de Menú' },
    team: { pt: 'Gestão de Equipe', en: 'Team Management', es: 'Gestión de Equipo' },
    analytics: { pt: 'Analytics & Relatórios', en: 'Analytics & Reports', es: 'Analytics e Informes' },
    'manager-ops': { pt: 'Painel Operacional', en: 'Operations Panel', es: 'Panel Operativo' },
    approvals: { pt: 'Aprovações Pendentes', en: 'Pending Approvals', es: 'Aprobaciones Pendientes' },
    'barman-station': { pt: 'Estação do Barman', en: 'Bartender Station', es: 'Estación del Barman' },
    'drink-recipes': { pt: 'Receitas de Drinks', en: 'Drink Recipes', es: 'Recetas de Tragos' },
    'cook-station': { pt: 'Estação de Preparo', en: 'Prep Station', es: 'Estación de Preparación' },
    stock: { pt: 'Controle de Estoque', en: 'Stock Control', es: 'Control de Inventario' },
    'waiter-calls': { pt: 'Chamados de Clientes', en: 'Customer Calls', es: 'Llamados de Clientes' },
    'waiter-tips': { pt: 'Minhas Gorjetas', en: 'My Tips', es: 'Mis Propinas' },
    'floor-flow': { pt: 'Fluxo do Salão', en: 'Floor Flow', es: 'Flujo del Salón' },
    'daily-report': { pt: 'Relatório do Dia', en: 'Daily Report', es: 'Informe del Día' },
  },
  screenDescs: {
    welcome: { pt: 'Escolha um perfil para explorar o painel', en: 'Choose a profile to explore the panel', es: 'Elige un perfil para explorar el panel' },
    setup: { pt: 'Perfil, tipo de serviço e funcionalidades', en: 'Profile, service type and features', es: 'Perfil, tipo de servicio y funcionalidades' },
    dashboard: { pt: 'Visão completa com KPIs, receita e operação em tempo real', en: 'Complete view with KPIs, revenue and real-time operations', es: 'Vista completa con KPIs, ingresos y operaciones en tiempo real' },
    'table-map': { pt: 'Planta interativa com status de cada mesa', en: 'Interactive floor plan with table status', es: 'Plano interactivo con estado de cada mesa' },
    orders: { pt: 'Pedidos ativos, confirmações e acompanhamento', en: 'Active orders, confirmations and tracking', es: 'Pedidos activos, confirmaciones y seguimiento' },
    'kds-kitchen': { pt: 'Display de tickets com timers e prioridades', en: 'Ticket display with timers and priorities', es: 'Display de tickets con temporizadores y prioridades' },
    'kds-bar': { pt: 'Fila de bebidas e cocktails', en: 'Beverage and cocktail queue', es: 'Cola de bebidas y cócteles' },
    maitre: { pt: 'Reservas, fila virtual e check-in', en: 'Reservations, virtual queue and check-in', es: 'Reservas, cola virtual y check-in' },
    waiter: { pt: 'Mesas, pedidos, chamados e gorjetas', en: 'Tables, orders, calls and tips', es: 'Mesas, pedidos, llamados y propinas' },
    'menu-editor': { pt: 'Categorias, itens, preços e fichas técnicas', en: 'Categories, items, prices and tech sheets', es: 'Categorías, items, precios y fichas técnicas' },
    team: { pt: 'Colaboradores, escalas e desempenho', en: 'Staff, schedules and performance', es: 'Colaboradores, horarios y rendimiento' },
    analytics: { pt: 'Receita, tendências e insights operacionais', en: 'Revenue, trends and operational insights', es: 'Ingresos, tendencias e insights operativos' },
    'manager-ops': { pt: 'Visão gerencial com alertas e status em tempo real', en: 'Management view with alerts and real-time status', es: 'Vista gerencial con alertas y estado en tiempo real' },
    approvals: { pt: 'Cancelamentos, cortesias, estornos e ajustes', en: 'Cancellations, courtesies, refunds and adjustments', es: 'Cancelaciones, cortesías, reembolsos y ajustes' },
    'barman-station': { pt: 'Drinks na fila, preparo e expedição', en: 'Queued drinks, prep and dispatch', es: 'Tragos en cola, preparación y despacho' },
    'drink-recipes': { pt: 'Fichas técnicas, ingredientes e porções', en: 'Tech sheets, ingredients and portions', es: 'Fichas técnicas, ingredientes y porciones' },
    'cook-station': { pt: 'Tickets da sua estação com timers', en: 'Station tickets with timers', es: 'Tickets de tu estación con temporizadores' },
    stock: { pt: 'Insumos, alertas de nível baixo e reposição', en: 'Supplies, low-level alerts and restocking', es: 'Insumos, alertas de nivel bajo y reposición' },
    'waiter-calls': { pt: 'Chamados pendentes das suas mesas', en: 'Pending calls from your tables', es: 'Llamados pendientes de tus mesas' },
    'waiter-tips': { pt: 'Gorjetas recebidas hoje e histórico', en: 'Tips received today and history', es: 'Propinas recibidas hoy e historial' },
    'floor-flow': { pt: 'Fila virtual, tempos de espera e rotação', en: 'Virtual queue, wait times and rotation', es: 'Cola virtual, tiempos de espera y rotación' },
    'daily-report': { pt: 'Fechamento, métricas e comparativos', en: 'Closing, metrics and comparisons', es: 'Cierre, métricas y comparativos' },
  },
} as const;

const EXACT_TEXT_TRANSLATIONS: Record<Exclude<DemoLang, 'pt'>, Record<string, string>> = {
  en: {
    'Modo mobile': 'Mobile mode',
    'Perfil ativo': 'Active profile',
    'DEMO INTERATIVA': 'INTERACTIVE DEMO',
    'Escolha o papel e veja a operação sob a ótica de cada equipe.': 'Choose a role and view the operation from each team’s perspective.',
    'Configuração resumida': 'Configuration summary',
    'Ir para dashboard': 'Go to dashboard',
    'Resumo executivo otimizado para leitura rápida no celular.': 'Executive summary optimized for quick mobile reading.',
    'Ações rápidas': 'Quick actions',
    'Atalhos para o que importa agora': 'Shortcuts to what matters right now',
    'Pedidos recentes': 'Recent orders',
    'Alertas': 'Alerts',
    'No mobile, o mapa vira uma grade operacional rápida para seleção e ação.': 'On mobile, the table map becomes a quick operational grid for selection and action.',
    'Sem cliente no momento': 'No guest at the moment',
    'Nenhum chamado agora.': 'No calls right now.',
    'Reservas confirmadas': 'Confirmed reservations',
    'Minhas mesas': 'My tables',
    'Fluxo atual': 'Current flow',
    'Fechamento operacional': 'Operational closing',
    'Caixa conciliado': 'Cash register reconciled',
    'Equipe encerrada': 'Team closed out',
    'Estoque revisado': 'Stock reviewed',
    'Pendências zeradas': 'No pending issues',
    'Central de aprovações': 'Approval center',
    'Cancelamentos, cortesias e estornos': 'Cancellations, courtesies and refunds',
    'Processado': 'Processed',
    'Escolha o perfil para explorar o painel': 'Choose the profile to explore the panel',
    'Fine Dining, reservas online, QR nas mesas, split de pagamento e operação full-service.': 'Fine Dining, online reservations, QR at tables, split payments and full-service operation.',
    'Bom dia': 'Good morning',
    'Boa tarde': 'Good afternoon',
    'Boa noite': 'Good evening',
    'Olá': 'Hello',
    'Com fome?': 'Hungry?',
    'No caminho?': 'On the road?',
    'Experiências': 'Experiences',
    'Chef\'s Table': "Chef's Table",
    'Ver Mapa ao Vivo': 'View Live Map',
    'Mapa interativo': 'Interactive map',
    'Buffets por perto': 'Nearby buffets',
    'Buffet Self-Service': 'Self-Service Buffet',
    'Drive-Thru Inteligente': 'Smart Drive-Thru',
    'Como funciona?': 'How does it work?',
    'Monte seu prato ideal': 'Build your perfect meal',
    'Bowls populares': 'Popular bowls',
    'Começar': 'Start',
    'Encontrar um café': 'Find a café',
    'Mais opções': 'More options',
    'Seu espaço para trabalhar e saborear': 'Your space to work and enjoy',
    'Food Trucks ao vivo': 'Live Food Trucks',
    'Perto de você': 'Near you',
    'Mais por perto': 'More nearby',
    'Jantar em família': 'Family dinner',
    'Descubra experiências': 'Discover experiences',
    'Buscar restaurantes, pratos...': 'Search restaurants, dishes...',
    'Buscar restaurantes rápidos...': 'Search quick-service restaurants...',
    'Buscar por ingrediente ou bowl...': 'Search by ingredient or bowl...',
    'Buscar restaurantes...': 'Search restaurants...',
    'Buscar eventos, clubs...': 'Search events, clubs...',
    'Pedido rápido': 'Fast order',
    'Encontrar o café perfeito para trabalhar ou relaxar': 'Find the perfect café to work or relax',
    'Encontre o café perfeito para trabalhar ou relaxar': 'Find the perfect café to work or relax',
    'Encontre opções saudáveis e customizáveis por perto.': 'Find healthy, customizable options nearby.',
    'Peça pelo app, pague antecipado, retire sem esperar': 'Order in the app, pay ahead and pick up without waiting',
    'Skip the Line — Peça antes de chegar!': 'Skip the line — order before you arrive!',
    'Café Noowe': 'Café Noowe',
    'Bistrô Noowe': 'Bistrô Noowe',
  },
  es: {
    'Modo mobile': 'Modo móvil',
    'Perfil ativo': 'Perfil activo',
    'DEMO INTERATIVA': 'DEMO INTERACTIVA',
    'Escolha o papel e veja a operação sob a ótica de cada equipe.': 'Elige un rol y mira la operación desde la perspectiva de cada equipo.',
    'Configuração resumida': 'Configuración resumida',
    'Ir para dashboard': 'Ir al dashboard',
    'Resumo executivo otimizado para leitura rápida no celular.': 'Resumen ejecutivo optimizado para lectura rápida en el móvil.',
    'Ações rápidas': 'Acciones rápidas',
    'Atalhos para o que importa agora': 'Atajos para lo que importa ahora',
    'Pedidos recentes': 'Pedidos recientes',
    'Alertas': 'Alertas',
    'No mobile, o mapa vira uma grade operacional rápida para seleção e ação.': 'En móvil, el mapa se convierte en una cuadrícula operativa rápida para seleccionar y actuar.',
    'Sem cliente no momento': 'Sin cliente en este momento',
    'Nenhum chamado agora.': 'Ningún llamado ahora.',
    'Reservas confirmadas': 'Reservas confirmadas',
    'Minhas mesas': 'Mis mesas',
    'Fluxo atual': 'Flujo actual',
    'Fechamento operacional': 'Cierre operativo',
    'Caixa conciliado': 'Caja conciliada',
    'Equipe encerrada': 'Equipo finalizado',
    'Estoque revisado': 'Inventario revisado',
    'Pendências zeradas': 'Sin pendientes',
    'Central de aprovações': 'Centro de aprobaciones',
    'Cancelamentos, cortesias e estornos': 'Cancelaciones, cortesías y reembolsos',
    'Processado': 'Procesado',
    'Escolha o perfil para explorar o painel': 'Elige el perfil para explorar el panel',
    'Fine Dining, reservas online, QR nas mesas, split de pagamento e operação full-service.': 'Fine Dining, reservas online, QR en las mesas, pago dividido y operación full-service.',
    'Bom dia': 'Buenos días',
    'Boa tarde': 'Buenas tardes',
    'Boa noite': 'Buenas noches',
    'Olá': 'Hola',
    'Com fome?': '¿Tienes hambre?',
    'No caminho?': '¿En camino?',
    'Experiências': 'Experiencias',
    'Chef\'s Table': 'Mesa del Chef',
    'Ver Mapa ao Vivo': 'Ver mapa en vivo',
    'Mapa interativo': 'Mapa interactivo',
    'Buffets por perto': 'Buffets cercanos',
    'Buffet Self-Service': 'Buffet autoservicio',
    'Drive-Thru Inteligente': 'Drive-Thru inteligente',
    'Como funciona?': '¿Cómo funciona?',
    'Monte seu prato ideal': 'Arma tu plato ideal',
    'Bowls populares': 'Bowls populares',
    'Começar': 'Empezar',
    'Encontrar um café': 'Encontrar un café',
    'Mais opções': 'Más opciones',
    'Seu espaço para trabalhar e saborear': 'Tu espacio para trabajar y disfrutar',
    'Food Trucks ao vivo': 'Food Trucks en vivo',
    'Perto de você': 'Cerca de ti',
    'Mais por perto': 'Más cerca',
    'Jantar em família': 'Cena en familia',
    'Descubra experiências': 'Descubre experiencias',
    'Buscar restaurantes, pratos...': 'Buscar restaurantes, platos...',
    'Buscar restaurantes rápidos...': 'Buscar restaurantes rápidos...',
    'Buscar por ingrediente ou bowl...': 'Buscar por ingrediente o bowl...',
    'Buscar restaurantes...': 'Buscar restaurantes...',
    'Buscar eventos, clubs...': 'Buscar eventos, clubs...',
    'Pedido rápido': 'Pedido rápido',
    'Encontrar o café perfeito para trabalhar ou relaxar': 'Encuentra el café perfecto para trabajar o relajarte',
    'Encontre o café perfeito para trabalhar ou relaxar': 'Encuentra el café perfecto para trabajar o relajarte',
    'Encontre opções saudáveis e customizáveis por perto.': 'Encuentra opciones saludables y personalizables cerca.',
    'Peça pelo app, pague antecipado, retire sem esperar': 'Pide en la app, paga por adelantado y retira sin esperar',
    'Skip the Line — Peça antes de chegar!': 'Skip the line — pide antes de llegar',
    'Café Noowe': 'Café Noowe',
    'Bistrô Noowe': 'Bistrô Noowe',
  },
};

const EN_REPLACEMENTS: ReplacementRule[] = [
  [/\bHoje\b/g, 'Today'],
  [/\bHoje\./g, 'Today.'],
  [/\bReceita do dia\b/g, 'Today\'s revenue'],
  [/\bReceita Hoje\b/g, 'Revenue Today'],
  [/\bReceita dia\b/g, 'Day revenue'],
  [/\bReceita\b/g, 'Revenue'],
  [/\bPedidos Ativos\b/g, 'Active Orders'],
  [/\bPedidos ativos\b/g, 'Active orders'],
  [/\bPedidos\b/g, 'Orders'],
  [/\bPedido\b/g, 'Order'],
  [/\bOcupação\b/g, 'Occupancy'],
  [/\bTicket Médio\b/g, 'Average Ticket'],
  [/\bMesas Livres\b/g, 'Free Tables'],
  [/\bMesas livres\b/g, 'Free tables'],
  [/\bMesas\b/g, 'Tables'],
  [/\bMesa\b/g, 'Table'],
  [/\bLivre\b/g, 'Available'],
  [/\bOcupada\b/g, 'Occupied'],
  [/\bReserva\b/g, 'Reserved'],
  [/\bConta\b/g, 'Bill'],
  [/\blugares\b/g, 'seats'],
  [/\bLugares\b/g, 'Seats'],
  [/\bChamados\b/g, 'Calls'],
  [/\bGorjetas\b/g, 'Tips'],
  [/\bGorjeta\b/g, 'Tip'],
  [/\bReservas Hoje\b/g, 'Today\'s Reservations'],
  [/\bReservas\b/g, 'Reservations'],
  [/\bReserva\b/g, 'Reservation'],
  [/\bReservado\b/g, 'Reserved'],
  [/\bItens\b/g, 'Items'],
  [/\bitens\b/g, 'items'],
  [/\bem andamento\b/g, 'in progress'],
  [/\bocupadas\b/g, 'occupied'],
  [/\bprontos\b/g, 'ready'],
  [/\bConfirmar\b/g, 'Confirm'],
  [/\bPreparar\b/g, 'Prepare'],
  [/\bMarcar pronto\b/g, 'Mark ready'],
  [/\bEntregar\b/g, 'Deliver'],
  [/\bRecebido\b/g, 'Received'],
  [/\bConfirmado\b/g, 'Confirmed'],
  [/\bPreparando\b/g, 'Preparing'],
  [/\bPronto\b/g, 'Ready'],
  [/\bEntregue\b/g, 'Delivered'],
  [/\bPago\b/g, 'Paid'],
  [/\bPendente\b/g, 'Pending'],
  [/\bAprovar\b/g, 'Approve'],
  [/\bRecusar\b/g, 'Decline'],
  [/\bAtivo\b/g, 'Active'],
  [/\bFolga\b/g, 'Off'],
  [/\bRecebido hoje\b/g, 'Received today'],
  [/\bFila estimada\b/g, 'Estimated queue'],
  [/\bFila virtual\b/g, 'Virtual queue'],
  [/\bFila Virtual\b/g, 'Virtual Queue'],
  [/\bMenu\b/g, 'Menu'],
  [/\bCardápio\b/g, 'Menu'],
  [/\bCarrinho\b/g, 'Cart'],
  [/\bPagamento\b/g, 'Payment'],
  [/\bAvaliação\b/g, 'Rating'],
  [/\bAvaliar\b/g, 'Rate'],
  [/\bDetalhes\b/g, 'Details'],
  [/\bDetalhe\b/g, 'Detail'],
  [/\bDescoberta\b/g, 'Discovery'],
  [/\bRetirada\b/g, 'Pickup'],
  [/\bConcluído\b/g, 'Completed'],
  [/\bPreparo ao Vivo\b/g, 'Live Preparation'],
  [/\bBem-vindo\b/g, 'Welcome'],
  [/\bEscolha\b/g, 'Choose'],
  [/\bPerfil\b/g, 'Profile'],
  [/\bServiço\b/g, 'Service'],
  [/\bRecursos\b/g, 'Features'],
  [/\bPagamentos\b/g, 'Payments'],
  [/\bEtapa\b/g, 'Step'],
  [/\bPróximo\b/g, 'Next'],
  [/\bAberto\b/g, 'Open'],
  [/\bFechado\b/g, 'Closed'],
  [/\bTempo médio\b/g, 'Average time'],
  [/\bocupação\b/g, 'occupancy'],
  [/\bTomadas\b/g, 'Outlets'],
  [/\bRuído\b/g, 'Noise'],
  [/\bModerado\b/g, 'Moderate'],
  [/\bTranquilo\b/g, 'Quiet'],
  [/\bWi-Fi Rápido\b/g, 'Fast Wi-Fi'],
  [/\bSilencioso\b/g, 'Quiet'],
  [/\bPet Friendly\b/g, 'Pet Friendly'],
  [/\bAo Ar Livre\b/g, 'Outdoor'],
  [/\bTodos\b/g, 'All'],
  [/\bMais opções\b/g, 'More options'],
  [/\bMais por perto\b/g, 'More nearby'],
  [/\bPerto de você\b/g, 'Near you'],
  [/\bComanda\b/g, 'Tab'],
  [/\bFechar conta\b/g, 'Close bill'],
  [/\bLiberar mesa\b/g, 'Clear table'],
  [/\bCheck-in\b/g, 'Check-in'],
  [/\bSentar cliente\b/g, 'Seat guest'],
  [/\bMinha Estação\b/g, 'My Station'],
  [/\bTop vendidos\b/g, 'Top sellers'],
  [/\bAnalytics & Relatórios\b/g, 'Analytics & Reports'],
  [/\bPainel Operacional\b/g, 'Operations Panel'],
  [/\bAprovações Pendentes\b/g, 'Pending Approvals'],
  [/\bControle de Estoque\b/g, 'Stock Control'],
  [/\bRelatório do Dia\b/g, 'Daily Report'],
  [/\bMapa de Mesas\b/g, 'Table Map'],
  [/\bGestão de Pedidos\b/g, 'Order Management'],
  [/\bGestão de Equipe\b/g, 'Team Management'],
  [/\bChamados de Clientes\b/g, 'Customer Calls'],
  [/\bMinhas Gorjetas\b/g, 'My Tips'],
  [/\bFluxo do Salão\b/g, 'Floor Flow'],
  [/\bPreparando\b/g, 'Preparing'],
  [/\bPronto!\b/g, 'Ready!'],
  [/\bContagem regressiva\b/g, 'Countdown'],
  [/\bBoas-vindas\b/g, 'Welcome'],
  [/\bSobremesa\b/g, 'Dessert'],
  [/\bFoto & encerramento\b/g, 'Photo & finale'],
  [/\bLista de espera\b/g, 'Waitlist'],
  [/\bDividir conta\b/g, 'Split bill'],
  [/\bConsumação\b/g, 'Consumption'],
  [/\bRodada\b/g, 'Round'],
  [/\bChamar Garçom\b/g, 'Call Waiter'],
];

const ES_REPLACEMENTS: ReplacementRule[] = [
  [/\bHoje\b/g, 'Hoy'],
  [/\bReceita do dia\b/g, 'Ingresos del día'],
  [/\bReceita Hoje\b/g, 'Ingresos de hoy'],
  [/\bReceita dia\b/g, 'Ingresos del día'],
  [/\bReceita\b/g, 'Ingresos'],
  [/\bPedidos Ativos\b/g, 'Pedidos activos'],
  [/\bPedidos ativos\b/g, 'Pedidos activos'],
  [/\bPedidos\b/g, 'Pedidos'],
  [/\bPedido\b/g, 'Pedido'],
  [/\bOcupação\b/g, 'Ocupación'],
  [/\bTicket Médio\b/g, 'Ticket medio'],
  [/\bMesas Livres\b/g, 'Mesas libres'],
  [/\bMesas livres\b/g, 'Mesas libres'],
  [/\bMesas\b/g, 'Mesas'],
  [/\bMesa\b/g, 'Mesa'],
  [/\bLivre\b/g, 'Libre'],
  [/\bOcupada\b/g, 'Ocupada'],
  [/\bReserva\b/g, 'Reserva'],
  [/\bConta\b/g, 'Cuenta'],
  [/\blugares\b/g, 'lugares'],
  [/\bLugares\b/g, 'Lugares'],
  [/\bChamados\b/g, 'Llamados'],
  [/\bGorjetas\b/g, 'Propinas'],
  [/\bGorjeta\b/g, 'Propina'],
  [/\bReservas Hoje\b/g, 'Reservas de hoy'],
  [/\bReservas\b/g, 'Reservas'],
  [/\bReserva\b/g, 'Reserva'],
  [/\bReservado\b/g, 'Reservado'],
  [/\bItens\b/g, 'Items'],
  [/\bitens\b/g, 'items'],
  [/\bem andamento\b/g, 'en curso'],
  [/\bocupadas\b/g, 'ocupadas'],
  [/\bprontos\b/g, 'listos'],
  [/\bConfirmar\b/g, 'Confirmar'],
  [/\bPreparar\b/g, 'Preparar'],
  [/\bMarcar pronto\b/g, 'Marcar listo'],
  [/\bEntregar\b/g, 'Entregar'],
  [/\bRecebido\b/g, 'Recibido'],
  [/\bConfirmado\b/g, 'Confirmado'],
  [/\bPreparando\b/g, 'Preparando'],
  [/\bPronto\b/g, 'Listo'],
  [/\bEntregue\b/g, 'Entregado'],
  [/\bPago\b/g, 'Pagado'],
  [/\bPendente\b/g, 'Pendiente'],
  [/\bAprovar\b/g, 'Aprobar'],
  [/\bRecusar\b/g, 'Rechazar'],
  [/\bAtivo\b/g, 'Activo'],
  [/\bFolga\b/g, 'Libre'],
  [/\bRecebido hoje\b/g, 'Recibido hoy'],
  [/\bFila estimada\b/g, 'Fila estimada'],
  [/\bFila virtual\b/g, 'Fila virtual'],
  [/\bFila Virtual\b/g, 'Fila virtual'],
  [/\bMenu\b/g, 'Menú'],
  [/\bCardápio\b/g, 'Menú'],
  [/\bCarrinho\b/g, 'Carrito'],
  [/\bPagamento\b/g, 'Pago'],
  [/\bAvaliação\b/g, 'Evaluación'],
  [/\bAvaliar\b/g, 'Evaluar'],
  [/\bDetalhes\b/g, 'Detalles'],
  [/\bDetalhe\b/g, 'Detalle'],
  [/\bDescoberta\b/g, 'Descubrimiento'],
  [/\bRetirada\b/g, 'Retiro'],
  [/\bConcluído\b/g, 'Completado'],
  [/\bPreparo ao Vivo\b/g, 'Preparación en vivo'],
  [/\bBem-vindo\b/g, 'Bienvenido'],
  [/\bEscolha\b/g, 'Elige'],
  [/\bPerfil\b/g, 'Perfil'],
  [/\bServiço\b/g, 'Servicio'],
  [/\bRecursos\b/g, 'Recursos'],
  [/\bPagamentos\b/g, 'Pagos'],
  [/\bEtapa\b/g, 'Etapa'],
  [/\bPróximo\b/g, 'Siguiente'],
  [/\bAberto\b/g, 'Abierto'],
  [/\bFechado\b/g, 'Cerrado'],
  [/\bTempo médio\b/g, 'Tiempo medio'],
  [/\bocupação\b/g, 'ocupación'],
  [/\bTomadas\b/g, 'Enchufes'],
  [/\bRuído\b/g, 'Ruido'],
  [/\bModerado\b/g, 'Moderado'],
  [/\bTranquilo\b/g, 'Tranquilo'],
  [/\bWi-Fi Rápido\b/g, 'Wi-Fi rápido'],
  [/\bSilencioso\b/g, 'Silencioso'],
  [/\bPet Friendly\b/g, 'Pet Friendly'],
  [/\bAo Ar Livre\b/g, 'Al aire libre'],
  [/\bTodos\b/g, 'Todos'],
  [/\bMais opções\b/g, 'Más opciones'],
  [/\bMais por perto\b/g, 'Más cerca'],
  [/\bPerto de você\b/g, 'Cerca de ti'],
  [/\bComanda\b/g, 'Comanda'],
  [/\bFechar conta\b/g, 'Cerrar cuenta'],
  [/\bLiberar mesa\b/g, 'Liberar mesa'],
  [/\bCheck-in\b/g, 'Check-in'],
  [/\bSentar cliente\b/g, 'Sentar cliente'],
  [/\bMinha Estação\b/g, 'Mi estación'],
  [/\bTop vendidos\b/g, 'Más vendidos'],
  [/\bAnalytics & Relatórios\b/g, 'Analytics e informes'],
  [/\bPainel Operacional\b/g, 'Panel operativo'],
  [/\bAprovações Pendentes\b/g, 'Aprobaciones pendientes'],
  [/\bControle de Estoque\b/g, 'Control de inventario'],
  [/\bRelatório do Dia\b/g, 'Informe del día'],
  [/\bMapa de Mesas\b/g, 'Mapa de mesas'],
  [/\bGestão de Pedidos\b/g, 'Gestión de pedidos'],
  [/\bGestão de Equipe\b/g, 'Gestión de equipo'],
  [/\bChamados de Clientes\b/g, 'Llamados de clientes'],
  [/\bMinhas Gorjetas\b/g, 'Mis propinas'],
  [/\bFluxo do Salão\b/g, 'Flujo del salón'],
  [/\bPronto!\b/g, '¡Listo!'],
  [/\bContagem regressiva\b/g, 'Cuenta regresiva'],
  [/\bBoas-vindas\b/g, 'Bienvenida'],
  [/\bSobremesa\b/g, 'Postre'],
  [/\bFoto & encerramento\b/g, 'Foto y cierre'],
  [/\bLista de espera\b/g, 'Lista de espera'],
  [/\bDividir conta\b/g, 'Dividir cuenta'],
  [/\bConsumação\b/g, 'Consumo'],
  [/\bRodada\b/g, 'Ronda'],
  [/\bChamar Garçom\b/g, 'Llamar mesero'],
];

function applyReplacements(text: string, replacements: ReplacementRule[]) {
  return replacements.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

export function translateDemoText(text: string, lang: DemoLang): string {
  if (!text || lang === 'pt') return text;

  const exact = EXACT_TEXT_TRANSLATIONS[lang as Exclude<DemoLang, 'pt'>]?.[text];
  if (exact) return exact;

  const replacements = lang === 'en' ? EN_REPLACEMENTS : ES_REPLACEMENTS;
  return applyReplacements(text, replacements);
}

interface DemoI18nContextType {
  lang: DemoLang;
  setLang: (lang: DemoLang) => void;
  t: (section: TranslationSection, key: string) => string;
  translateText: (text: string) => string;
}

const DemoI18nContext = createContext<DemoI18nContextType>({
  lang: 'pt',
  setLang: () => {},
  t: () => '',
  translateText: (text) => text,
});

export function DemoI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<DemoLang>('pt');

  const t = useCallback((section: TranslationSection, key: string): string => {
    const dict = DEMO_TRANSLATIONS[section] as Record<string, Record<DemoLang, string>>;
    return dict?.[key]?.[lang] ?? dict?.[key]?.pt ?? key;
  }, [lang]);

  const translateText = useCallback((text: string) => translateDemoText(text, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, translateText }), [lang, t, translateText]);

  return <DemoI18nContext.Provider value={value}>{children}</DemoI18nContext.Provider>;
}

export function useDemoI18n() {
  return useContext(DemoI18nContext);
}

const TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const;

export function DemoAutoTranslate({ children }: { children: ReactNode }) {
  const { lang } = useDemoI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const textMapRef = useRef(new WeakMap<Text, string>());
  const attrMapRef = useRef(new WeakMap<HTMLElement, Record<string, string>>());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const translateElement = (element: HTMLElement) => {
      const existing = attrMapRef.current.get(element) ?? {};
      const originals = { ...existing };

      for (const attr of TRANSLATABLE_ATTRS) {
        const current = element.getAttribute(attr);
        if (!current || !current.trim()) continue;
        if (!(attr in originals)) originals[attr] = current;
        element.setAttribute(attr, translateDemoText(originals[attr], lang));
      }

      attrMapRef.current.set(element, originals);
    };

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const currentText = textNode.nodeValue ?? '';
        if (!currentText.trim()) return;
        if (!textMapRef.current.has(textNode)) textMapRef.current.set(textNode, currentText);
        const original = textMapRef.current.get(textNode) ?? currentText;
        textNode.nodeValue = translateDemoText(original, lang);
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const element = node as HTMLElement;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)) return;
      translateElement(element);
      Array.from(element.childNodes).forEach(walk);
    };

    walk(root);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          walk(mutation.target);
        }

        mutation.addedNodes.forEach(walk);

        if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          translateElement(mutation.target);
        }
      });
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRS],
    });

    return () => observer.disconnect();
  }, [lang]);

  return <div ref={rootRef} className="contents">{children}</div>;
}

export function DemoLangSelector() {
  const { lang, setLang } = useDemoI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
      {(Object.keys(LANG_META) as DemoLang[]).map((l) => {
        const isActive = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            title={LANG_META[l].label}
          >
            <span>{LANG_META[l].label}</span>
          </button>
        );
      })}
    </div>
  );
}
