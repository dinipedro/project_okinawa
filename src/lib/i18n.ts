import { createContext, useContext } from 'react';

export type Lang = 'pt' | 'en' | 'es';

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  'nav.platform': { pt: 'Plataforma', en: 'Platform', es: 'Plataforma' },
  'nav.demo': { pt: 'Demo', en: 'Demo', es: 'Demo' },
  'nav.about': { pt: 'Sobre', en: 'About', es: 'Sobre' },
  'nav.contact': { pt: 'Contato', en: 'Contact', es: 'Contacto' },
  'nav.request_demo': { pt: 'Solicitar Demo', en: 'Request Demo', es: 'Solicitar Demo' },

  // Hero
  'hero.overline': { pt: 'APRESENTANDO NOOWE', en: 'INTRODUCING NOOWE', es: 'PRESENTAMOS NOOWE' },
  'hero.h1_1': { pt: 'Um sistema.', en: 'One system.', es: 'Un sistema.' },
  'hero.h1_2': { pt: 'Todo restaurante.', en: 'Every restaurant.', es: 'Cada restaurante.' },
  'hero.sub': {
    pt: 'O sistema operacional que substitui toda a sua stack por uma única plataforma inteligente.',
    en: 'The operating system that replaces your entire tech stack with one intelligent platform.',
    es: 'El sistema operativo que reemplaza toda tu stack tecnológica con una sola plataforma inteligente.',
  },
  'hero.cta1': { pt: 'Solicitar Demo', en: 'Request Demo', es: 'Solicitar Demo' },
  'hero.cta2': { pt: 'Explorar Plataforma', en: 'Explore Platform', es: 'Explorar Plataforma' },

  // Social proof
  'social.title': {
    pt: 'A confiança de restaurantes que não aceitam o comum.',
    en: 'Trusted by restaurants that refuse to compromise.',
    es: 'La confianza de restaurantes que no aceptan lo común.',
  },

  // Problem
  'problem.p1.overline': { pt: 'O PROBLEMA', en: 'THE PROBLEM', es: 'EL PROBLEMA' },
  'problem.p1.title': { pt: '12 ferramentas. Zero integração.', en: '12 tools. Zero integration.', es: '12 herramientas. Cero integración.' },
  'problem.p1.body': {
    pt: 'O restaurante médio usa 12 sistemas diferentes que não se comunicam. Pedidos se perdem. Dados ficam presos. Equipes desperdiçam horas no que deveria levar segundos.',
    en: 'The average restaurant uses 12 different systems that don\'t talk to each other. Orders get lost. Data stays trapped. Teams waste hours on what should take seconds.',
    es: 'El restaurante promedio usa 12 sistemas que no se comunican entre sí. Los pedidos se pierden. Los datos quedan atrapados.',
  },
  'problem.p2.overline': { pt: 'O CUSTO', en: 'THE COST', es: 'EL COSTO' },
  'problem.p2.title': { pt: 'Complexidade custa caro.', en: 'Complexity is expensive.', es: 'La complejidad es cara.' },
  'problem.p2.body': {
    pt: 'Cada sistema desconectado é um vazamento — de tempo, de dinheiro, de experiência. Sua equipe merece mais. Seus clientes merecem mais.',
    en: 'Every disconnected system is a leak — in time, in money, in experience. Your team deserves better. Your customers deserve better.',
    es: 'Cada sistema desconectado es una fuga — de tiempo, de dinero, de experiencia. Tu equipo merece más.',
  },
  'problem.p3.overline': { pt: 'A MUDANÇA', en: 'THE SHIFT', es: 'EL CAMBIO' },
  'problem.p3.title': { pt: 'E se tudo simplesmente funcionasse?', en: 'What if everything just worked?', es: '¿Y si todo simplemente funcionara?' },
  'problem.p3.body': {
    pt: 'Uma plataforma. Uma fonte da verdade. Um sistema que pensa à frente para que sua equipe foque no que importa — a experiência.',
    en: 'One platform. One source of truth. One system that thinks ahead so your team can focus on what matters — the experience.',
    es: 'Una plataforma. Una fuente de verdad. Un sistema que piensa adelante para que tu equipo se enfoque en lo que importa.',
  },

  // Features
  'features.card1.overline': { pt: 'OPERAÇÕES UNIFICADAS', en: 'UNIFIED OPERATIONS', es: 'OPERACIONES UNIFICADAS' },
  'features.card1.title': {
    pt: 'Tudo que seu restaurante precisa. Nada do que não precisa.',
    en: 'Everything your restaurant needs. Nothing it doesn\'t.',
    es: 'Todo lo que tu restaurante necesita. Nada de lo que no.',
  },
  'features.card1.body': {
    pt: 'Da gestão de pedidos à cozinha, do estoque à análise — um sistema, um login, uma verdade.',
    en: 'From order management to kitchen display, from inventory to analytics — one system, one login, one truth.',
    es: 'De la gestión de pedidos a la cocina, del inventario al análisis — un sistema, un login, una verdad.',
  },
  'features.card2.overline': { pt: 'INTELIGÊNCIA DA COZINHA', en: 'KITCHEN INTELLIGENCE', es: 'INTELIGENCIA DE COCINA' },
  'features.card2.title': { pt: 'A cozinha que pensa.', en: 'The kitchen that thinks.', es: 'La cocina que piensa.' },
  'features.card3.overline': { pt: 'EXPERIÊNCIA DO CLIENTE', en: 'GUEST EXPERIENCE', es: 'EXPERIENCIA DEL CLIENTE' },
  'features.card3.title': { pt: 'Cada mesa, perfeitamente servida.', en: 'Every table, perfectly served.', es: 'Cada mesa, perfectamente servida.' },
  'features.card4.overline': { pt: 'BUSINESS INTELLIGENCE', en: 'BUSINESS INTELLIGENCE', es: 'BUSINESS INTELLIGENCE' },
  'features.card4.title': { pt: 'Números que dizem a verdade.', en: 'Numbers that tell the truth.', es: 'Números que dicen la verdad.' },

  // Service types
  'services.title': { pt: '11 experiências. Uma plataforma.', en: '11 experiences. One platform.', es: '11 experiencias. Una plataforma.' },
  'services.sub': {
    pt: 'Do fine dining ao food truck, NOOWE se adapta a como você opera.',
    en: 'From fine dining to food trucks, NOOWE adapts to how you operate.',
    es: 'Desde fine dining hasta food trucks, NOOWE se adapta a cómo operas.',
  },
  'services.cta': {
    pt: 'Explorar as 11 experiências →',
    en: 'Explore all 11 experiences →',
    es: 'Explorar las 11 experiencias →',
  },

  // Specs
  'specs.types': { pt: 'Tipos de Serviço', en: 'Service Types', es: 'Tipos de Servicio' },
  'specs.screens': { pt: 'Telas', en: 'Screens', es: 'Pantallas' },
  'specs.roles': { pt: 'Funções', en: 'Staff Roles', es: 'Roles' },
  'specs.langs': { pt: 'Idiomas', en: 'Languages', es: 'Idiomas' },

  // Text reveal
  'reveal.text': {
    pt: 'Nós não construímos mais uma ferramenta para restaurantes. Nós reconstruímos a forma como restaurantes operam. Do primeiro pedido ao último relatório, NOOWE conecta cada momento em um fluxo contínuo que simplesmente funciona.',
    en: 'We didn\'t build another tool for restaurants. We rebuilt the way restaurants operate. From the first order to the last report, NOOWE connects every moment into one seamless flow that just works.',
    es: 'No construimos otra herramienta para restaurantes. Reconstruimos la forma en que los restaurantes operan. Desde el primer pedido hasta el último informe, NOOWE conecta cada momento en un flujo continuo que simplemente funciona.',
  },

  // Demo preview
  'demo.overline': { pt: 'VEJA EM AÇÃO', en: 'SEE IT IN ACTION', es: 'VÉALO EN ACCIÓN' },
  'demo.title': { pt: 'Feito para ser experimentado.', en: 'Built to be experienced.', es: 'Hecho para ser experimentado.' },
  'demo.body': {
    pt: 'Palavras só vão até certo ponto. Solicite acesso e veja NOOWE em ação.',
    en: 'Words only go so far. Request access and see NOOWE in action.',
    es: 'Las palabras solo llegan hasta cierto punto. Solicita acceso y ve NOOWE en acción.',
  },
  'demo.cta': { pt: 'Solicitar Demo →', en: 'Request Demo →', es: 'Solicitar Demo →' },

  // CTA Final
  'cta.title': {
    pt: 'O futuro dos restaurantes já chegou.',
    en: 'The future of restaurants is already here.',
    es: 'El futuro de los restaurantes ya llegó.',
  },
  'cta.sub': {
    pt: 'Junte-se aos restaurantes que estão escolhendo operar diferente.',
    en: 'Join the restaurants that are choosing to operate differently.',
    es: 'Únete a los restaurantes que están eligiendo operar diferente.',
  },
  'cta.note': {
    pt: 'Acesso antecipado é gratuito. Sem cartão de crédito.',
    en: 'Early access is free. No credit card required.',
    es: 'Acceso anticipado es gratuito. Sin tarjeta de crédito.',
  },

  // Footer
  'footer.platform': { pt: 'Plataforma', en: 'Platform', es: 'Plataforma' },
  'footer.company': { pt: 'Empresa', en: 'Company', es: 'Empresa' },
  'footer.resources': { pt: 'Recursos', en: 'Resources', es: 'Recursos' },
  'footer.legal': { pt: 'Legal', en: 'Legal', es: 'Legal' },
  'footer.rights': { pt: 'Todos os direitos reservados.', en: 'All rights reserved.', es: 'Todos los derechos reservados.' },
  'footer.overview': { pt: 'Visão Geral', en: 'Overview', es: 'Visión General' },
  'footer.service_types': { pt: 'Tipos de Serviço', en: 'Service Types', es: 'Tipos de Servicio' },
  'footer.roles': { pt: 'Funções', en: 'Roles', es: 'Roles' },
  'footer.features': { pt: 'Funcionalidades', en: 'Features', es: 'Funcionalidades' },
  'footer.about': { pt: 'Sobre', en: 'About', es: 'About' },
  'footer.careers': { pt: 'Carreiras', en: 'Careers', es: 'Carreras' },
  'footer.press': { pt: 'Imprensa', en: 'Press', es: 'Prensa' },
  'footer.blog': { pt: 'Blog', en: 'Blog', es: 'Blog' },
  'footer.docs': { pt: 'Documentação', en: 'Documentation', es: 'Documentación' },
  'footer.help': { pt: 'Ajuda', en: 'Help Center', es: 'Centro de Ayuda' },
  'footer.privacy': { pt: 'Privacidade', en: 'Privacy', es: 'Privacidad' },
  'footer.terms': { pt: 'Termos', en: 'Terms', es: 'Términos' },

  // Request Demo page
  'rdemo.overline': { pt: 'SOLICITAR ACESSO', en: 'REQUEST ACCESS', es: 'SOLICITAR ACCESO' },
  'rdemo.title': { pt: 'Entre no NOOWE.', en: 'Get inside NOOWE.', es: 'Entra en NOOWE.' },
  'rdemo.sub': {
    pt: 'Enviaremos um código de acesso exclusivo para você experimentar a plataforma completa. Leva menos de 10 segundos.',
    en: 'We\'ll send you an exclusive access code to experience the full platform. It takes less than 10 seconds.',
    es: 'Te enviaremos un código de acceso exclusivo para experimentar la plataforma completa. Toma menos de 10 segundos.',
  },
  'rdemo.name': { pt: 'Nome', en: 'Name', es: 'Nombre' },
  'rdemo.restaurant': { pt: 'Nome do Restaurante', en: 'Restaurant Name', es: 'Nombre del Restaurante' },
  'rdemo.email': { pt: 'Email', en: 'Email', es: 'Email' },
  'rdemo.phone': { pt: 'Telefone (opcional)', en: 'Phone (optional)', es: 'Teléfono (opcional)' },
  'rdemo.submit': { pt: 'Solicitar Acesso', en: 'Request Access', es: 'Solicitar Acceso' },
  'rdemo.success_title': { pt: '✓ Verifique seu email.', en: '✓ Check your email.', es: '✓ Revisa tu correo.' },
  'rdemo.success_body': {
    pt: 'Seu código de acesso está a caminho. Procure um email da NOOWE.',
    en: 'Your access code is on its way. Look for an email from NOOWE.',
    es: 'Tu código de acceso está en camino. Busca un email de NOOWE.',
  },
  'rdemo.resend': { pt: 'Não recebeu? → Reenviar código.', en: 'Didn\'t receive it? → Resend code.', es: '¿No lo recibiste? → Reenviar código.' },

  // Access page
  'access.title': { pt: 'Insira seu código.', en: 'Enter your code.', es: 'Ingresa tu código.' },
  'access.sub': {
    pt: 'Enviamos um código de acesso de 6 dígitos para seu email.',
    en: 'We sent a 6-digit access code to your email.',
    es: 'Enviamos un código de acceso de 6 dígitos a tu correo.',
  },
  'access.request_new': { pt: 'Solicitar novo código →', en: 'Request a new code →', es: 'Solicitar nuevo código →' },

  // Demo hub
  'hub.title': { pt: 'Bem-vindo ao NOOWE.', en: 'Welcome to NOOWE.', es: 'Bienvenido a NOOWE.' },
  'hub.sub': { pt: 'Escolha sua experiência.', en: 'Choose your experience.', es: 'Elige tu experiencia.' },
  'hub.client_title': { pt: 'Demo Cliente', en: 'Client Demo', es: 'Demo Cliente' },
  'hub.client_desc': {
    pt: 'Experimente o NOOWE como cliente. 11 tipos de serviço. 148+ telas interativas.',
    en: 'Experience NOOWE as a customer. 11 service types. 148+ interactive screens.',
    es: 'Experimenta NOOWE como cliente. 11 tipos de servicio. 148+ pantallas interactivas.',
  },
  'hub.restaurant_title': { pt: 'Demo Restaurante', en: 'Restaurant Demo', es: 'Demo Restaurante' },
  'hub.restaurant_desc': {
    pt: 'Experimente o NOOWE como equipe. 7 funções. 22 telas de gestão.',
    en: 'Experience NOOWE as the team. 7 staff roles. 22 management screens.',
    es: 'Experimenta NOOWE como equipo. 7 roles. 22 pantallas de gestión.',
  },
  'hub.launch': { pt: 'Iniciar →', en: 'Launch →', es: 'Iniciar →' },

  // Platform page
  'platform.overline': { pt: 'PLATAFORMA NOOWE', en: 'NOOWE PLATFORM', es: 'PLATAFORMA NOOWE' },
  'platform.title': { pt: 'Projetado para cada tipo de restaurante.', en: 'Designed for every kind of restaurant.', es: 'Diseñado para cada tipo de restaurante.' },
  'platform.sub': {
    pt: 'Um sistema. 11 tipos de serviço. 7 perspectivas de equipe. Zero compromisso.',
    en: 'One system. 11 service types. 7 staff perspectives. Zero compromise.',
    es: 'Un sistema. 11 tipos de servicio. 7 perspectivas de equipo. Cero compromiso.',
  },
  'platform.client_title': { pt: 'A EXPERIÊNCIA DO CLIENTE', en: 'THE CLIENT EXPERIENCE', es: 'LA EXPERIENCIA DEL CLIENTE' },
  'platform.ops_title': { pt: 'O LADO DA GESTÃO', en: 'THE MANAGEMENT SIDE', es: 'EL LADO DE LA GESTIÓN' },
  'platform.ops_sub': {
    pt: '7 funções. 22 telas. Toda perspectiva coberta. Cada membro da equipe vê exatamente o que precisa.',
    en: '7 roles. 22 screens. Every perspective covered. Each team member sees exactly what they need.',
    es: '7 roles. 22 pantallas. Toda perspectiva cubierta. Cada miembro del equipo ve lo que necesita.',
  },
  'platform.cross_title': { pt: 'FUNCIONALIDADES TRANSVERSAIS', en: 'CROSS-CUTTING FEATURES', es: 'FUNCIONALIDADES TRANSVERSALES' },
  'platform.cta_title': { pt: 'Pronto para ver?', en: 'Ready to see it?', es: '¿Listo para verlo?' },
  'platform.cta_body': {
    pt: 'Isso não é um slide deck. É uma plataforma funcionando. Solicite acesso e experimente cada tela, cada função, cada tipo de serviço — ao vivo.',
    en: 'This isn\'t a slide deck. It\'s a working platform. Request access and experience every screen, every role, every service type — live.',
    es: 'Esto no es un slide deck. Es una plataforma funcionando. Solicita acceso y experimenta cada pantalla, cada rol — en vivo.',
  },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('noowe-lang') as Lang;
  if (stored && ['pt', 'en', 'es'].includes(stored)) return stored;
  const browser = navigator.language.slice(0, 2);
  if (browser === 'pt') return 'pt';
  if (browser === 'es') return 'es';
  return 'en';
}

export function setLang(lang: Lang) {
  localStorage.setItem('noowe-lang', lang);
}

export interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function useLang() {
  return useContext(LangContext);
}
