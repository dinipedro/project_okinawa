import type { LegalSection } from '@/components/legal/LegalPageLayout';

export const termsSections: LegalSection[] = [
  {
    id: 'disposicoes-preliminares',
    title: { pt: 'Disposições Preliminares e Aceitação', en: 'Preliminary Provisions and Acceptance', es: 'Disposiciones Preliminares y Aceptación' },
    keyPoint: {
      pt: 'Ao usar a NOOWE, você concorda com estes Termos. Se não concordar, não utilize a plataforma.',
      en: 'By using NOOWE, you agree to these Terms. If you do not agree, do not use the platform.',
      es: 'Al usar NOOWE, aceptas estos Términos. Si no estás de acuerdo, no utilices la plataforma.',
    },
    content: {
      pt: `<p><strong>1.1. Partes e Objeto</strong></p>
<p>O presente instrumento ("Termos de Uso", "Termos" ou "Contrato") estabelece as condições gerais de uso da plataforma NOOWE e constitui contrato de adesão firmado entre:</p>
<p><strong>FORNECEDORA DO SERVIÇO:</strong> DINI & CIA. TECNOLOGIA LTDA, sociedade limitada, inscrita no CNPJ/MF sob o nº 64.159.447/0001-90, com sede na Avenida José Ribeiro Junqueira, nº 220, Bairro Jardim Colonial, São Paulo/SP, CEP 04821-020.</p>
<p><strong>USUÁRIO:</strong> toda pessoa natural ou jurídica que acessa, navega, se cadastra ou utiliza qualquer funcionalidade da plataforma NOOWE.</p>
<p><strong>1.2. Aceitação e Concordância</strong></p>
<p>1.2.1. Ao acessar, navegar, se cadastrar ou utilizar qualquer funcionalidade da plataforma NOOWE — incluindo o aplicativo móvel, o aplicativo de gestão, o site institucional, o ambiente de demonstração interativa e quaisquer APIs — o Usuário manifesta sua livre, expressa, informada e inequívoca concordância com todas as disposições deste Termo e da Política de Privacidade vinculada.</p>
<p>1.2.2. A utilização dos serviços NOOWE por menores de 18 anos é condicionada à autorização expressa de seus representantes legais, em conformidade com o Art. 14 da LGPD e com o ECA (Lei nº 8.069/1990).</p>
<p>1.2.3. O Usuário declara que leu integralmente este documento, compreendeu seu conteúdo e concorda em cumprir todas as suas disposições.</p>
<p>1.2.4. Caso o Usuário não concorde com qualquer disposição, deverá cessar imediatamente a utilização de todos os serviços.</p>
<p><strong>1.2.5. Validade jurídica da aceitação eletrônica.</strong> A aceitação destes Termos por meio eletrônico (click-wrap, scroll-wrap ou aceite in-app) constitui manifestação de vontade válida e vinculante nos termos do Art. 107 do Código Civil, da MP nº 2.200-2/2001 e da Lei nº 14.063/2020.</p>
<p><strong>1.3. Aplicabilidade</strong></p>
<p>Estes Termos aplicam-se a: <strong>Usuários Consumidores</strong> (app cliente), <strong>Usuários Estabelecimentos</strong> (app de gestão), <strong>Visitantes</strong> (site e demo) e <strong>Equipe de Estabelecimentos</strong> (6 papéis RBAC).</p>`,
      en: `<p><strong>1.1. Parties and Purpose</strong></p>
<p>This instrument ("Terms of Use", "Terms" or "Agreement") establishes the general conditions for using the NOOWE platform and constitutes an adhesion contract between:</p>
<p><strong>SERVICE PROVIDER:</strong> DINI & CIA. TECNOLOGIA LTDA, a limited liability company registered under CNPJ/MF No. 64.159.447/0001-90, headquartered in São Paulo/SP, Brazil.</p>
<p><strong>USER:</strong> any natural or legal person who accesses, browses, registers, or uses any feature of the NOOWE platform.</p>
<p><strong>1.2. Acceptance and Agreement</strong></p>
<p>1.2.1. By accessing, browsing, registering, or using any feature of the NOOWE platform — including the mobile app, management app, institutional website, interactive demo, and any APIs — the User expressly agrees to all provisions of these Terms and the linked Privacy Policy.</p>
<p>1.2.2. Use of NOOWE services by minors under 18 years of age requires express authorization from their legal representatives, in accordance with Article 14 of the LGPD (Brazilian General Data Protection Law).</p>
<p>1.2.5. Electronic acceptance (click-wrap, scroll-wrap, or in-app consent) constitutes a valid and binding expression of will under Brazilian law.</p>
<p><strong>1.3. Applicability</strong></p>
<p>These Terms apply to: <strong>Consumer Users</strong> (client app), <strong>Establishment Users</strong> (management app), <strong>Visitors</strong> (website and demo), and <strong>Establishment Staff</strong> (6 RBAC roles).</p>`,
      es: `<p><strong>1.1. Partes y Objeto</strong></p>
<p>El presente instrumento ("Términos de Uso", "Términos" o "Contrato") establece las condiciones generales de uso de la plataforma NOOWE y constituye un contrato de adhesión entre:</p>
<p><strong>PROVEEDOR DEL SERVICIO:</strong> DINI & CIA. TECNOLOGIA LTDA, sociedad limitada registrada bajo CNPJ/MF nº 64.159.447/0001-90, con sede en São Paulo/SP, Brasil.</p>
<p><strong>USUARIO:</strong> toda persona natural o jurídica que accede, navega, se registra o utiliza cualquier funcionalidad de la plataforma NOOWE.</p>
<p><strong>1.2. Aceptación y Conformidad</strong></p>
<p>1.2.1. Al acceder, navegar, registrarse o utilizar cualquier funcionalidad de la plataforma NOOWE, el Usuario manifiesta su conformidad con todas las disposiciones de estos Términos y la Política de Privacidad vinculada.</p>
<p><strong>1.3. Aplicabilidad</strong></p>
<p>Estos Términos se aplican a: <strong>Usuarios Consumidores</strong>, <strong>Usuarios Establecimientos</strong>, <strong>Visitantes</strong> y <strong>Personal de Establecimientos</strong> (6 roles RBAC).</p>`,
    },
  },
  {
    id: 'definicoes',
    title: { pt: 'Definições', en: 'Definitions', es: 'Definiciones' },
    keyPoint: {
      pt: 'Termos técnicos e jurídicos usados neste documento, como Plataforma, KDS, Carteira Digital, RBAC e LGPD.',
      en: 'Technical and legal terms used in this document, such as Platform, KDS, Digital Wallet, RBAC, and LGPD.',
      es: 'Términos técnicos y jurídicos utilizados en este documento, como Plataforma, KDS, Billetera Digital, RBAC y LGPD.',
    },
    content: {
      pt: `<ul>
<li><strong>Plataforma NOOWE:</strong> Ecossistema tecnológico integrado composto pelo Aplicativo Cliente, Aplicativo de Gestão, API Backend, Site Institucional e Sistema de Demonstração Interativa.</li>
<li><strong>Aplicativo Cliente:</strong> Aplicação móvel para consumidores com funcionalidades de descoberta, pedidos, reservas, pagamentos e fidelidade.</li>
<li><strong>Aplicativo de Gestão:</strong> Aplicação para equipe de estabelecimentos com dashboard adaptativo por função (6 papéis RBAC).</li>
<li><strong>KDS (Kitchen Display System):</strong> Sistema de exibição digital para gerenciamento visual de pedidos na cozinha e bar.</li>
<li><strong>Carteira Digital (Wallet):</strong> Funcionalidade para armazenar saldo e realizar pagamentos dentro do ecossistema NOOWE.</li>
<li><strong>Split Payment:</strong> Sistema de divisão de conta em 4 modalidades: Individual, Igualitária, Seletiva por Item e Valor Fixo.</li>
<li><strong>Programa de Fidelidade:</strong> Sistema de pontuação com níveis progressivos e recompensas.</li>
<li><strong>RBAC:</strong> Role-Based Access Control — controle de acesso baseado em 6 papéis hierárquicos.</li>
<li><strong>Dados Pessoais:</strong> Informação relacionada a pessoa natural identificada ou identificável (Art. 5º, I, LGPD).</li>
<li><strong>LGPD:</strong> Lei Geral de Proteção de Dados Pessoais — Lei nº 13.709/2018.</li>
<li><strong>ANPD:</strong> Autoridade Nacional de Proteção de Dados.</li>
</ul>`,
      en: `<ul>
<li><strong>NOOWE Platform:</strong> Integrated technology ecosystem comprising the Client App, Management App, Backend API, Institutional Website, and Interactive Demo System.</li>
<li><strong>Client App:</strong> Mobile application for consumers with discovery, ordering, reservation, payment, and loyalty features.</li>
<li><strong>Management App:</strong> Application for establishment staff with adaptive dashboard by role (6 RBAC roles).</li>
<li><strong>KDS (Kitchen Display System):</strong> Digital display system for visual order management in kitchen and bar.</li>
<li><strong>Digital Wallet:</strong> Feature for storing balance and making payments within the NOOWE ecosystem.</li>
<li><strong>Split Payment:</strong> Bill splitting system with 4 modes: Individual, Equal, Item-Based, and Fixed Amount.</li>
<li><strong>RBAC:</strong> Role-Based Access Control — 6 hierarchical roles with granular permissions.</li>
<li><strong>Personal Data:</strong> Information related to an identified or identifiable natural person (LGPD Art. 5, I).</li>
<li><strong>LGPD:</strong> Brazilian General Data Protection Law — Law No. 13,709/2018.</li>
</ul>`,
      es: `<ul>
<li><strong>Plataforma NOOWE:</strong> Ecosistema tecnológico integrado compuesto por la App Cliente, App de Gestión, API Backend, Sitio Institucional y Sistema de Demo Interactiva.</li>
<li><strong>App Cliente:</strong> Aplicación móvil para consumidores con funcionalidades de descubrimiento, pedidos, reservas, pagos y fidelidad.</li>
<li><strong>KDS (Kitchen Display System):</strong> Sistema de exhibición digital para gestión visual de pedidos en cocina y bar.</li>
<li><strong>Billetera Digital:</strong> Funcionalidad para almacenar saldo y realizar pagos dentro del ecosistema NOOWE.</li>
<li><strong>RBAC:</strong> Control de Acceso Basado en Roles — 6 roles jerárquicos con permisos granulares.</li>
<li><strong>LGPD:</strong> Ley General de Protección de Datos de Brasil — Ley nº 13.709/2018.</li>
</ul>`,
    },
  },
  {
    id: 'arcabouco-legal',
    title: { pt: 'Arcabouço Legal e Normativo', en: 'Legal and Regulatory Framework', es: 'Marco Legal y Normativo' },
    content: {
      pt: `<table><thead><tr><th>Normativo</th><th>Aplicação</th></tr></thead><tbody>
<tr><td>Constituição Federal de 1988</td><td>Art. 5º — direitos fundamentais de privacidade, sigilo e propriedade intelectual.</td></tr>
<tr><td>Lei nº 13.709/2018 — LGPD</td><td>Disciplina o tratamento de dados pessoais em meios digitais.</td></tr>
<tr><td>Lei nº 12.965/2014 — Marco Civil da Internet</td><td>Princípios, garantias e direitos para uso da Internet no Brasil.</td></tr>
<tr><td>Lei nº 8.078/1990 — CDC</td><td>Código de Defesa do Consumidor.</td></tr>
<tr><td>Lei nº 10.406/2002 — Código Civil</td><td>Contratos de adesão, responsabilidade civil.</td></tr>
<tr><td>Lei nº 9.610/1998 — Direitos Autorais</td><td>Proteção de obras intelectuais e software.</td></tr>
<tr><td>Lei nº 9.609/1998 — Lei de Software</td><td>Proteção da propriedade intelectual de programa de computador.</td></tr>
<tr><td>Lei nº 13.146/2015 — LBI</td><td>Estatuto da Pessoa com Deficiência — acessibilidade digital.</td></tr>
<tr><td>MP nº 2.200-2/2001 — ICP-Brasil</td><td>Validade jurídica de documentos eletrônicos.</td></tr>
<tr><td>Lei nº 14.063/2020</td><td>Assinaturas eletrônicas. Valida aceitação por clique (click-wrap).</td></tr>
</tbody></table>`,
      en: `<table><thead><tr><th>Regulation</th><th>Application</th></tr></thead><tbody>
<tr><td>Federal Constitution of 1988</td><td>Art. 5 — fundamental rights of privacy and intellectual property.</td></tr>
<tr><td>Law No. 13,709/2018 — LGPD</td><td>Regulates the processing of personal data in digital media.</td></tr>
<tr><td>Law No. 12,965/2014 — Marco Civil da Internet</td><td>Principles and rights for Internet use in Brazil.</td></tr>
<tr><td>Law No. 8,078/1990 — CDC</td><td>Consumer Protection Code.</td></tr>
<tr><td>Law No. 10,406/2002 — Civil Code</td><td>Adhesion contracts and civil liability.</td></tr>
<tr><td>Law No. 13,146/2015 — LBI</td><td>Brazilian Inclusion Law — digital accessibility.</td></tr>
</tbody></table>`,
      es: `<table><thead><tr><th>Normativa</th><th>Aplicación</th></tr></thead><tbody>
<tr><td>Constitución Federal de 1988</td><td>Art. 5 — derechos fundamentales de privacidad y propiedad intelectual.</td></tr>
<tr><td>Ley nº 13.709/2018 — LGPD</td><td>Regula el tratamiento de datos personales en medios digitales.</td></tr>
<tr><td>Ley nº 12.965/2014 — Marco Civil da Internet</td><td>Principios y derechos para el uso de Internet en Brasil.</td></tr>
<tr><td>Ley nº 8.078/1990 — CDC</td><td>Código de Defensa del Consumidor.</td></tr>
</tbody></table>`,
    },
  },
  {
    id: 'descricao-servicos',
    title: { pt: 'Descrição Detalhada dos Serviços', en: 'Detailed Service Description', es: 'Descripción Detallada de los Servicios' },
    keyPoint: {
      pt: 'A NOOWE é uma plataforma de experiências presenciais — não é delivery. Conecta consumidores a restaurantes com pedidos, pagamentos, reservas e gestão operacional.',
      en: 'NOOWE is a dine-in experience platform — not delivery. It connects consumers to restaurants with orders, payments, reservations, and operational management.',
      es: 'NOOWE es una plataforma de experiencias presenciales — no es delivery. Conecta consumidores a restaurantes con pedidos, pagos, reservas y gestión operacional.',
    },
    content: {
      pt: `<p><strong>4.1. Natureza da Plataforma</strong></p>
<p>A NOOWE é uma plataforma tecnológica de experiências presenciais. A plataforma NÃO é um serviço de delivery ou marketplace de alimentos — seu foco exclusivo são experiências de consumo presencial.</p>
<p><strong>4.2. Aplicativo Cliente — 37+ Telas</strong></p>
<p>Descoberta com geolocalização, check-in via QR code, cardápio digital interativo, 6 métodos de pagamento (Apple Pay, Google Pay, PIX, Cartão, TAP to Pay NFC, Carteira Digital), Split Payment em 4 modos, reservas avançadas, programa de fidelidade com níveis progressivos.</p>
<p><strong>4.3. Aplicativo de Gestão — 25+ Telas</strong></p>
<p>Dashboard adaptativo por papel (Proprietário, Gerente, Garçom, Chef, Barman, Maître), KDS com gestos, planta interativa com drag-and-drop, finanças e gestão de equipe.</p>
<p><strong>4.5. 11 Tipos de Serviço:</strong> Fine Dining, Quick Service, Fast Casual, Café & Padaria, Buffet, Drive-Thru, Food Truck, Chef's Table, Casual Dining, Pub & Bar, Club & Balada.</p>
<p><strong>4.6. Inteligência Artificial</strong></p>
<p>Recomendações, harmonização, detecção de fraude, priorização no KDS e análise de sentimento. <em>Recomendações de IA são orientativas e NÃO constituem aconselhamento profissional.</em></p>`,
      en: `<p><strong>4.1. Platform Nature</strong></p>
<p>NOOWE is a technology platform for dine-in experiences. It is NOT a delivery service or food marketplace — its exclusive focus is in-person dining.</p>
<p><strong>4.2. Client App — 37+ Screens</strong></p>
<p>Discovery with geolocation, QR code check-in, interactive digital menu, 6 payment methods (Apple Pay, Google Pay, PIX, Card, TAP to Pay NFC, Digital Wallet), Split Payment in 4 modes, advanced reservations, loyalty program with progressive tiers.</p>
<p><strong>4.3. Management App — 25+ Screens</strong></p>
<p>Adaptive dashboard by role (Owner, Manager, Waiter, Chef, Bartender, Maître), KDS with gestures, interactive floor plan with drag-and-drop, finances, and team management.</p>
<p><strong>4.5. 11 Service Types:</strong> Fine Dining, Quick Service, Fast Casual, Café & Bakery, Buffet, Drive-Thru, Food Truck, Chef's Table, Casual Dining, Pub & Bar, Club & Nightclub.</p>
<p><strong>4.6. AI Features</strong></p>
<p>Recommendations, food pairing, fraud detection, KDS prioritization, and sentiment analysis. <em>AI recommendations are advisory and do NOT constitute professional advice.</em></p>`,
      es: `<p><strong>4.1. Naturaleza de la Plataforma</strong></p>
<p>NOOWE es una plataforma tecnológica para experiencias presenciales. NO es un servicio de delivery o marketplace de alimentos.</p>
<p><strong>4.2. App Cliente — 37+ Pantallas</strong></p>
<p>Descubrimiento con geolocalización, check-in por QR, menú digital interactivo, 6 métodos de pago, Split Payment en 4 modos, reservas avanzadas, programa de fidelidad con niveles progresivos.</p>
<p><strong>4.3. App de Gestión — 25+ Pantallas</strong></p>
<p>Dashboard adaptativo por rol, KDS con gestos, planta interactiva con drag-and-drop, finanzas y gestión de equipo.</p>
<p><strong>4.6. Inteligencia Artificial</strong></p>
<p>Recomendaciones, maridaje, detección de fraude, priorización en KDS y análisis de sentimiento. <em>Las recomendaciones de IA son orientativas.</em></p>`,
    },
  },
  {
    id: 'cadastro-conta',
    title: { pt: 'Cadastro, Conta e Autenticação', en: 'Registration, Account and Authentication', es: 'Registro, Cuenta y Autenticación' },
    keyPoint: {
      pt: 'Você é responsável por manter suas credenciais seguras. Contas podem ser encerradas a qualquer momento.',
      en: 'You are responsible for keeping your credentials secure. Accounts can be closed at any time.',
      es: 'Usted es responsable de mantener sus credenciales seguras. Las cuentas se pueden cerrar en cualquier momento.',
    },
    content: {
      pt: `<p>5.1. Para funcionalidades completas, o Usuário deverá criar conta via OTP por telefone, login social (Google/Apple) ou e-mail/senha.</p>
<p>5.2. A NOOWE reserva-se o direito de recusar cadastros ou suspender contas com informações falsas ou fraudulentas.</p>
<p>5.3. O Usuário é responsável pelo sigilo de suas credenciais. Senhas devem conter: mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial. MFA (TOTP) é recomendado.</p>
<p>5.4. Encerramento de conta: via configurações do app ou DPO (privacy@noowebr.com), processado em 15 dias corridos. Dados com retenção legal obrigatória serão mantidos (registros de acesso: 6 meses; transações financeiras: 7 anos; logs de auditoria: 5 anos).</p>`,
      en: `<p>5.1. For full functionality, the User must create an account via phone OTP, social login (Google/Apple), or email/password.</p>
<p>5.2. NOOWE reserves the right to refuse registrations or suspend accounts with false or fraudulent information.</p>
<p>5.3. The User is responsible for credential secrecy. Passwords must contain: minimum 8 characters, uppercase, lowercase, number, and special character. MFA (TOTP) is recommended.</p>
<p>5.4. Account closure: via app settings or DPO (privacy@noowebr.com), processed within 15 business days. Data with mandatory legal retention will be maintained.</p>`,
      es: `<p>5.1. Para funcionalidades completas, el Usuario debe crear una cuenta vía OTP por teléfono, login social (Google/Apple) o correo/contraseña.</p>
<p>5.3. El Usuario es responsable del sigilo de sus credenciales. Las contraseñas deben contener: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial.</p>
<p>5.4. Cierre de cuenta: vía configuraciones de la app o DPO (privacy@noowebr.com), procesado en 15 días hábiles.</p>`,
    },
  },
  {
    id: 'direitos-usuario',
    title: { pt: 'Direitos do Usuário', en: 'User Rights', es: 'Derechos del Usuario' },
    keyPoint: {
      pt: 'Você pode acessar, corrigir, portar e excluir seus dados a qualquer momento, conforme a LGPD.',
      en: 'You can access, correct, port, and delete your data at any time, under LGPD.',
      es: 'Puede acceder, corregir, portar y eliminar sus datos en cualquier momento, según la LGPD.',
    },
    content: {
      pt: `<p>6.1. O Usuário tem direito à adequada prestação dos serviços.</p>
<p>6.2. Em relação aos dados pessoais (Art. 18, LGPD):</p>
<ul>
<li><strong>a)</strong> Confirmação e acesso aos seus dados pessoais</li>
<li><strong>b)</strong> Retificação de dados incompletos ou inexatos</li>
<li><strong>c)</strong> Anonimização, bloqueio ou eliminação de dados desnecessários</li>
<li><strong>d)</strong> Portabilidade dos dados em formato JSON ou CSV</li>
<li><strong>e)</strong> Eliminação dos dados tratados com base no consentimento</li>
<li><strong>f)</strong> Informação sobre compartilhamento com entidades públicas e privadas</li>
<li><strong>g)</strong> Revogação do consentimento a qualquer momento</li>
<li><strong>h)</strong> Revisão de decisões automatizadas (Art. 20)</li>
<li><strong>i)</strong> Petição à ANPD</li>
</ul>
<p>6.3. Canais: configurações do app, e-mail privacy@noowebr.com ou contato com o DPO. Prazo: 15 dias (simplificado) ou 30 dias (fundamentado).</p>`,
      en: `<p>6.1. The User has the right to adequate service provision.</p>
<p>6.2. Regarding personal data (LGPD Art. 18):</p>
<ul>
<li>Confirmation and access to personal data</li>
<li>Rectification of incomplete or inaccurate data</li>
<li>Anonymization, blocking, or deletion of unnecessary data</li>
<li>Data portability in JSON or CSV format</li>
<li>Deletion of consent-based data</li>
<li>Information about data sharing</li>
<li>Consent revocation at any time</li>
<li>Review of automated decisions (Art. 20)</li>
<li>Petition to ANPD</li>
</ul>
<p>6.3. Channels: app settings, privacy@noowebr.com, or DPO contact. Response: 15 days (simplified) or 30 days (detailed).</p>`,
      es: `<p>6.2. Respecto a datos personales (Art. 18, LGPD):</p>
<ul>
<li>Confirmación y acceso a datos personales</li>
<li>Rectificación de datos incompletos o inexactos</li>
<li>Anonimización, bloqueo o eliminación de datos innecesarios</li>
<li>Portabilidad en formato JSON o CSV</li>
<li>Eliminación de datos basados en consentimiento</li>
<li>Revocación del consentimiento en cualquier momento</li>
<li>Revisión de decisiones automatizadas</li>
</ul>`,
    },
  },
  {
    id: 'obrigacoes-usuario',
    title: { pt: 'Obrigações e Responsabilidades do Usuário', en: 'User Obligations and Responsibilities', es: 'Obligaciones y Responsabilidades del Usuario' },
    content: {
      pt: `<p>7.1. O Usuário compromete-se a: fornecer informações verdadeiras; manter credenciais em sigilo; utilizar a plataforma conforme sua finalidade e legislação; respeitar direitos de propriedade intelectual; notificar imediatamente uso não autorizado.</p>
<p>7.2. É expressamente vedado: engenharia reversa; uso de robôs, spiders ou scrapers; transmitir malware; burlar mecanismos de segurança; criar contas falsas; publicar conteúdo ilícito; realizar phishing ou fraude.</p>
<p>7.3. O Usuário é responsável pela reparação de todos os danos causados à NOOWE, outros Usuários ou terceiros.</p>`,
      en: `<p>7.1. The User agrees to: provide truthful information; keep credentials confidential; use the platform according to its purpose and legislation; respect intellectual property rights; immediately notify unauthorized use.</p>
<p>7.2. Expressly prohibited: reverse engineering; use of bots, spiders, or scrapers; transmitting malware; bypassing security mechanisms; creating fake accounts; publishing illicit content; phishing or fraud.</p>
<p>7.3. The User is responsible for repairing all damages caused to NOOWE, other Users, or third parties.</p>`,
      es: `<p>7.1. El Usuario se compromete a: proporcionar información veraz; mantener credenciales en secreto; usar la plataforma según su finalidad y legislación.</p>
<p>7.2. Está expresamente prohibido: ingeniería inversa; uso de bots o scrapers; transmitir malware; crear cuentas falsas; publicar contenido ilícito.</p>`,
    },
  },
  {
    id: 'obrigacoes-noowe',
    title: { pt: 'Obrigações da NOOWE e Limitação de Responsabilidade', en: 'NOOWE Obligations and Liability Limitation', es: 'Obligaciones de NOOWE y Limitación de Responsabilidad' },
    keyPoint: {
      pt: 'A NOOWE se compromete com segurança de nível empresarial (7 camadas), mas não é responsável por equipamentos do usuário ou qualidade dos produtos dos estabelecimentos.',
      en: 'NOOWE commits to enterprise-level security (7 layers), but is not responsible for user equipment or establishment product quality.',
      es: 'NOOWE se compromete con seguridad de nivel empresarial (7 capas), pero no es responsable por equipos del usuario o calidad de productos de establecimientos.',
    },
    content: {
      pt: `<p>8.1. A NOOWE compromete-se a: cumprir LGPD, Marco Civil, CDC; implementar segurança de nível empresarial (7 camadas de defesa); comunicar incidentes conforme Art. 48 LGPD; manter DPO designado e acessível.</p>
<p>8.2. A NOOWE NÃO será responsável por: equipamentos do Usuário; proteção do dispositivo; atos de terceiros por falha do Usuário; conteúdo publicado por Usuários; qualidade dos produtos dos estabelecimentos parceiros.</p>
<p>8.3. Responsabilidade total limitada ao montante pago nos 12 meses anteriores.</p>
<p><strong>8-A. ISENÇÃO DE GARANTIAS</strong></p>
<p>A plataforma é fornecida "NO ESTADO EM QUE SE ENCONTRA" (AS IS), sem garantias de operação ininterrupta ou livre de erros. As limitações aplicam-se na máxima extensão da lei, não excluindo garantias inafastáveis do CDC.</p>
<p><strong>8-B. POLÍTICA ANTIFRUDE</strong></p>
<p>Tolerância zero contra práticas fraudulentas. Sanções graduais: advertência → suspensão → encerramento → comunicação às autoridades. Direito de defesa: 5 dias úteis via help@noowebr.com.</p>`,
      en: `<p>8.1. NOOWE commits to: comply with LGPD, Marco Civil, CDC; implement enterprise-level security (7-layer defense); report incidents per LGPD Art. 48; maintain an accessible DPO.</p>
<p>8.2. NOOWE is NOT responsible for: User equipment; device protection; third-party acts due to User failure; User-published content; establishment product quality.</p>
<p>8.3. Total liability limited to amounts paid in the previous 12 months.</p>
<p><strong>8-A. DISCLAIMER OF WARRANTIES</strong></p>
<p>The platform is provided "AS IS" and "AS AVAILABLE," without warranties of uninterrupted or error-free operation. These limitations apply to the maximum extent permitted by law.</p>
<p><strong>8-B. ANTI-FRAUD POLICY</strong></p>
<p>Zero tolerance for fraudulent practices. Graduated sanctions: warning → suspension → termination → authority notification. Right of defense: 5 business days via help@noowebr.com.</p>`,
      es: `<p>8.1. NOOWE se compromete a: cumplir con LGPD, Marco Civil, CDC; implementar seguridad de nivel empresarial (7 capas); comunicar incidentes según la LGPD.</p>
<p>8.2. NOOWE NO será responsable por: equipos del Usuario; protección del dispositivo; contenido publicado por Usuarios; calidad de productos de establecimientos.</p>
<p><strong>8-B. POLÍTICA ANTIFRAUDE</strong></p>
<p>Tolerancia cero contra prácticas fraudulentas. Sanciones graduales: advertencia → suspensión → cierre → comunicación a autoridades.</p>`,
    },
  },
  {
    id: 'pagamentos',
    title: { pt: 'Pagamentos, Carteira Digital e Aspectos Financeiros', en: 'Payments, Digital Wallet and Financial Aspects', es: 'Pagos, Billetera Digital y Aspectos Financieros' },
    keyPoint: {
      pt: 'A NOOWE NUNCA armazena dados brutos de cartão. Todos os pagamentos são tokenizados via gateways certificados PCI DSS.',
      en: 'NOOWE NEVER stores raw card data. All payments are tokenized via PCI DSS certified gateways.',
      es: 'NOOWE NUNCA almacena datos brutos de tarjeta. Todos los pagos son tokenizados vía gateways certificados PCI DSS.',
    },
    content: {
      pt: `<p>9.1. 6 métodos de pagamento: Apple Pay, Google Pay, PIX, Cartão Crédito/Débito, TAP to Pay e Carteira Digital. A NOOWE NÃO armazena dados brutos de cartão — todos tokenizados via gateways PCI DSS.</p>
<p>9.2. Carteira Digital permite manter saldo em moeda corrente. Split Payment em 4 modalidades. Gorjetas são opcionais.</p>
<p>9.3. Taxas de serviço ao Consumidor serão sempre informadas previamente à confirmação da transação.</p>
<p><strong>9.5. Compliance financeiro:</strong> Operações em conformidade com a Lei nº 9.613/1998 e normativos do BACEN. A NOOWE pode: solicitar documentação adicional; reter transações suspeitas; comunicar ao COAF operações com indícios de lavagem de dinheiro.</p>`,
      en: `<p>9.1. 6 payment methods: Apple Pay, Google Pay, PIX, Credit/Debit Card, TAP to Pay, and Digital Wallet. NOOWE NEVER stores raw card data — all tokenized via PCI DSS gateways.</p>
<p>9.2. Digital Wallet allows maintaining balance in local currency. Split Payment in 4 modes. Tips are optional.</p>
<p>9.3. Service fees to Consumer will always be disclosed before transaction confirmation.</p>
<p><strong>9.5. Financial compliance:</strong> Operations in compliance with Brazilian anti-money laundering laws and Central Bank regulations.</p>`,
      es: `<p>9.1. 6 métodos de pago: Apple Pay, Google Pay, PIX, Tarjeta, TAP to Pay y Billetera Digital. NOOWE NUNCA almacena datos brutos de tarjeta.</p>
<p>9.2. La Billetera Digital permite mantener saldo en moneda local. Split Payment en 4 modalidades.</p>`,
    },
  },
  {
    id: 'propriedade-intelectual',
    title: { pt: 'Propriedade Intelectual', en: 'Intellectual Property', es: 'Propiedad Intelectual' },
    content: {
      pt: `<p>10.1. A plataforma NOOWE é propriedade intelectual exclusiva da DINI & CIA. TECNOLOGIA LTDA, protegida pelas Leis nº 9.610/1998 e 9.609/1998. Copyright © 2026. Todos os direitos reservados.</p>
<p>10.2. Licença de uso limitada, não exclusiva, intransferível e revogável. Proibida reprodução, engenharia reversa ou distribuição não autorizada.</p>
<p>10.3. Conteúdo do Usuário (avaliações, fotos) permanece de sua titularidade. Ao publicá-lo, concede licença não exclusiva, gratuita e mundial à NOOWE para uso na plataforma.</p>`,
      en: `<p>10.1. The NOOWE platform is exclusive intellectual property of DINI & CIA. TECNOLOGIA LTDA, protected by Brazilian copyright and software laws. Copyright © 2026. All rights reserved.</p>
<p>10.2. Limited, non-exclusive, non-transferable, and revocable use license. Reproduction, reverse engineering, or unauthorized distribution is prohibited.</p>
<p>10.3. User Content (reviews, photos) remains the User's property. By publishing, the User grants NOOWE a non-exclusive, free, worldwide license for platform use.</p>`,
      es: `<p>10.1. La plataforma NOOWE es propiedad intelectual exclusiva de DINI & CIA. TECNOLOGIA LTDA. Copyright © 2026.</p>
<p>10.2. Licencia de uso limitada, no exclusiva, intransferible y revocable.</p>
<p>10.3. El Contenido del Usuario permanece de su titularidad. Al publicarlo, otorga licencia no exclusiva y gratuita a NOOWE.</p>`,
    },
  },
  {
    id: 'privacidade-protecao',
    title: { pt: 'Política de Privacidade e Proteção de Dados', en: 'Privacy Policy and Data Protection', es: 'Política de Privacidad y Protección de Datos' },
    content: {
      pt: `<p>11.1. A Política de Privacidade é parte integrante e indissociável destes Termos, disponível em <a href="/privacy" class="text-primary hover:underline">noowe.com.br/privacidade</a>.</p>
<p>11.2. Ao aceitar estes Termos, o Usuário declara ter lido e compreendido a Política de Privacidade.</p>
<p><strong>11.3. Co-controlador:</strong> Ao realizar pedido ou reserva, determinados dados serão compartilhados com o estabelecimento parceiro, que se torna co-controlador para fins de prestação do serviço presencial, nos termos do Art. 26 da LGPD.</p>`,
      en: `<p>11.1. The Privacy Policy is an integral part of these Terms, available at <a href="/privacy" class="text-primary hover:underline">noowe.com.br/privacy</a>.</p>
<p>11.2. By accepting these Terms, the User declares having read and understood the Privacy Policy.</p>
<p><strong>11.3. Co-controller:</strong> When placing an order or reservation, certain data will be shared with the partner establishment, which becomes a co-controller under LGPD Art. 26.</p>`,
      es: `<p>11.1. La Política de Privacidad es parte integral de estos Términos, disponible en <a href="/privacy" class="text-primary hover:underline">noowe.com.br/privacidad</a>.</p>
<p><strong>11.3. Co-controlador:</strong> Al realizar un pedido o reserva, ciertos datos serán compartidos con el establecimiento socio.</p>`,
    },
  },
  {
    id: 'conteudo-usuario',
    title: { pt: 'Conteúdo Gerado pelo Usuário', en: 'User-Generated Content', es: 'Contenido Generado por el Usuario' },
    content: {
      pt: `<p>12.1. O Usuário é responsável pelo conteúdo que publica. É proibido conteúdo ilegal, difamatório, obsceno, discriminatório, falso ou spam.</p>
<p>12.2. A NOOWE reserva-se o direito de remover conteúdo que viole estes Termos. Avaliações legítimas não são manipuladas.</p>`,
      en: `<p>12.1. The User is responsible for published content. Illegal, defamatory, obscene, discriminatory, false content, or spam is prohibited.</p>
<p>12.2. NOOWE reserves the right to remove content that violates these Terms. Legitimate reviews are not manipulated.</p>`,
      es: `<p>12.1. El Usuario es responsable del contenido que publica. Está prohibido el contenido ilegal, difamatorio, obsceno, discriminatorio o spam.</p>
<p>12.2. NOOWE se reserva el derecho de eliminar contenido que viole estos Términos.</p>`,
    },
  },
  {
    id: 'disponibilidade',
    title: { pt: 'Disponibilidade e Manutenção', en: 'Availability and Maintenance', es: 'Disponibilidad y Mantenimiento' },
    content: {
      pt: `<p>13.1. A NOOWE envidará esforços para manter disponibilidade 24/7, sujeita a manutenções programadas (24h de antecedência), atualizações, correções e força maior.</p>
<p>13.2. A NOOWE não garante operação livre de erros mas trabalhará para corrigi-los. O Usuário deve manter aplicativos atualizados.</p>
<p><strong>13.3. Funcionalidades Beta</strong> podem conter erros e ser descontinuadas sem aviso prévio.</p>`,
      en: `<p>13.1. NOOWE will endeavor to maintain 24/7 availability, subject to scheduled maintenance (24h advance notice), updates, fixes, and force majeure.</p>
<p>13.2. NOOWE does not guarantee error-free operation. The User should keep applications updated.</p>
<p><strong>13.3. Beta Features</strong> may contain errors and can be discontinued without notice.</p>`,
      es: `<p>13.1. NOOWE hará esfuerzos para mantener disponibilidad 24/7, sujeta a mantenimientos programados y fuerza mayor.</p>
<p><strong>13.3. Funcionalidades Beta</strong> pueden contener errores y ser descontinuadas sin aviso previo.</p>`,
    },
  },
  {
    id: 'terceiros',
    title: { pt: 'Serviços e Integrações de Terceiros', en: 'Third-Party Services and Integrations', es: 'Servicios e Integraciones de Terceros' },
    content: {
      pt: `<p>14.1. A plataforma integra-se com: Google e Apple (autenticação OAuth), gateways de pagamento, Firebase Cloud Messaging, serviços de geolocalização, Twilio (SMS/OTP). A NOOWE não é responsável pelas políticas destes terceiros, mas exige padrões adequados de segurança.</p>`,
      en: `<p>14.1. The platform integrates with: Google and Apple (OAuth authentication), payment gateways, Firebase Cloud Messaging, geolocation services, Twilio (SMS/OTP). NOOWE is not responsible for these third parties' policies but requires adequate security standards.</p>`,
      es: `<p>14.1. La plataforma se integra con: Google y Apple (autenticación OAuth), gateways de pago, Firebase Cloud Messaging, servicios de geolocalización, Twilio (SMS/OTP).</p>`,
    },
  },
  {
    id: 'contato',
    title: { pt: 'Informações para Contato', en: 'Contact Information', es: 'Información de Contacto' },
    content: {
      pt: `<table><tbody>
<tr><td><strong>Razão Social</strong></td><td>DINI & CIA. TECNOLOGIA LTDA</td></tr>
<tr><td><strong>CNPJ</strong></td><td>64.159.447/0001-90</td></tr>
<tr><td><strong>Endereço</strong></td><td>Av. José Ribeiro Junqueira, 220, Jardim Colonial, São Paulo/SP, CEP 04821-020</td></tr>
<tr><td><strong>E-mail Geral</strong></td><td>contact@noowebr.com</td></tr>
<tr><td><strong>E-mail Suporte</strong></td><td>help@noowebr.com</td></tr>
<tr><td><strong>Encarregado (DPO)</strong></td><td>Carolina Dini Silva de Paula — privacy@noowebr.com</td></tr>
<tr><td><strong>Segurança</strong></td><td>security@noowebr.com</td></tr>
</tbody></table>`,
      en: `<table><tbody>
<tr><td><strong>Company</strong></td><td>DINI & CIA. TECNOLOGIA LTDA</td></tr>
<tr><td><strong>CNPJ</strong></td><td>64.159.447/0001-90</td></tr>
<tr><td><strong>Address</strong></td><td>Av. José Ribeiro Junqueira, 220, Jardim Colonial, São Paulo/SP, Brazil, 04821-020</td></tr>
<tr><td><strong>General Email</strong></td><td>contact@noowebr.com</td></tr>
<tr><td><strong>Support</strong></td><td>help@noowebr.com</td></tr>
<tr><td><strong>DPO</strong></td><td>Carolina Dini Silva de Paula — privacy@noowebr.com</td></tr>
<tr><td><strong>Security</strong></td><td>security@noowebr.com</td></tr>
</tbody></table>`,
      es: `<table><tbody>
<tr><td><strong>Razón Social</strong></td><td>DINI & CIA. TECNOLOGIA LTDA</td></tr>
<tr><td><strong>CNPJ</strong></td><td>64.159.447/0001-90</td></tr>
<tr><td><strong>Correo General</strong></td><td>contact@noowebr.com</td></tr>
<tr><td><strong>Soporte</strong></td><td>help@noowebr.com</td></tr>
<tr><td><strong>DPO</strong></td><td>Carolina Dini Silva de Paula — privacy@noowebr.com</td></tr>
</tbody></table>`,
    },
  },
  {
    id: 'alteracoes',
    title: { pt: 'Alterações nos Termos de Uso', en: 'Changes to Terms of Use', es: 'Cambios en los Términos de Uso' },
    content: {
      pt: `<p>16.1. A NOOWE pode modificar estes Termos a qualquer momento, para adaptação tecnológica, cumprimento legal ou adequação a orientações da ANPD.</p>
<p>16.2. Alterações substanciais serão comunicadas com 15 dias de antecedência via notificação push, e-mail ou aviso no site. Uso continuado constitui aceitação.</p>`,
      en: `<p>16.1. NOOWE may modify these Terms at any time for technological adaptation, legal compliance, or adequacy to ANPD guidelines.</p>
<p>16.2. Substantial changes will be communicated 15 days in advance via push notification, email, or website notice. Continued use constitutes acceptance.</p>`,
      es: `<p>16.1. NOOWE puede modificar estos Términos en cualquier momento para adaptación tecnológica o cumplimiento legal.</p>
<p>16.2. Cambios sustanciales serán comunicados con 15 días de antelación.</p>`,
    },
  },
  {
    id: 'foro',
    title: { pt: 'Foro Competente e Resolução de Conflitos', en: 'Jurisdiction and Dispute Resolution', es: 'Foro Competente y Resolución de Conflictos' },
    content: {
      pt: `<p>17.1. Este Termo é regido pela legislação brasileira.</p>
<p>17.2. As partes tentarão resolução amigável (30 dias) antes da via judicial, podendo utilizar mediação ou arbitragem (Lei nº 9.307/1996).</p>
<p>17.3. Foro: Comarca de São Paulo/SP.</p>
<p>17.4. O Usuário pode peticionar à ANPD, utilizar meios do CDC e acessar PROCONs para mediação.</p>
<p><strong>17.5.</strong> Prazo para ações judiciais: 2 anos contados do conhecimento do fato gerador.</p>`,
      en: `<p>17.1. These Terms are governed by Brazilian law.</p>
<p>17.2. Parties will attempt amicable resolution (30 days) before judicial proceedings, and may use mediation or arbitration.</p>
<p>17.3. Jurisdiction: São Paulo/SP, Brazil.</p>
<p>17.4. The User may petition ANPD, use consumer protection agencies, or access PROCONs for mediation.</p>`,
      es: `<p>17.1. Estos Términos se rigen por la legislación brasileña.</p>
<p>17.2. Las partes intentarán resolución amigable (30 días) antes de la vía judicial.</p>
<p>17.3. Foro: Comarca de São Paulo/SP, Brasil.</p>`,
    },
  },
  {
    id: 'disposicoes-finais',
    title: { pt: 'Disposições Gerais e Finais', en: 'General and Final Provisions', es: 'Disposiciones Generales y Finales' },
    content: {
      pt: `<p>18.1. Tolerância quanto a descumprimento não constitui renúncia ou novação.</p>
<p>18.2. Nulidade de disposição não afeta as demais.</p>
<p>18.3. Estes Termos constituem o acordo integral sobre uso da plataforma.</p>
<p><strong>18.3-A. Sobrevivência.</strong> As disposições sobre Definições, Vedações, Limitação de Responsabilidade, Antifrude, Obrigações Financeiras, Propriedade Intelectual, Privacidade e Foro sobreviverão ao término.</p>
<p>18.4. A NOOWE pode ceder direitos/obrigações a terceiros (fusão, aquisição, cisão), com comunicação prévia.</p>
<p><strong>18.7. Acessibilidade digital.</strong> Em conformidade com a Lei nº 13.146/2015 e WCAG 2.1, a NOOWE compromete-se a tornar a plataforma acessível. Relatos: accessibility@noowebr.com.</p>
<p class="mt-6 text-center text-sm text-muted-foreground"><strong>DINI & CIA. TECNOLOGIA LTDA</strong><br/>CNPJ: 64.159.447/0001-90<br/>São Paulo, 22 de março de 2026.<br/><em>Versão 1.0 — Última atualização: 22/03/2026</em></p>`,
      en: `<p>18.1. Tolerance regarding non-compliance does not constitute waiver.</p>
<p>18.2. Nullity of any provision does not affect the others.</p>
<p>18.3. These Terms constitute the entire agreement regarding platform use.</p>
<p><strong>18.3-A. Survival.</strong> Provisions regarding Definitions, Prohibitions, Liability Limitation, Anti-Fraud, Financial Obligations, Intellectual Property, Privacy, and Jurisdiction survive termination.</p>
<p><strong>18.7. Digital accessibility.</strong> In compliance with Brazilian Inclusion Law and WCAG 2.1, NOOWE commits to making the platform accessible. Reports: accessibility@noowebr.com.</p>
<p class="mt-6 text-center text-sm text-muted-foreground"><strong>DINI & CIA. TECNOLOGIA LTDA</strong><br/>CNPJ: 64.159.447/0001-90<br/>São Paulo, March 22, 2026.<br/><em>Version 1.0 — Last updated: 03/22/2026</em></p>`,
      es: `<p>18.1. La tolerancia no constituye renuncia.</p>
<p>18.2. La nulidad de una disposición no afecta las demás.</p>
<p>18.3. Estos Términos constituyen el acuerdo integral sobre el uso de la plataforma.</p>
<p><strong>18.7. Accesibilidad digital.</strong> En conformidad con la ley brasileña de inclusión y WCAG 2.1. Reportes: accessibility@noowebr.com.</p>
<p class="mt-6 text-center text-sm text-muted-foreground"><strong>DINI & CIA. TECNOLOGIA LTDA</strong><br/>CNPJ: 64.159.447/0001-90<br/>São Paulo, 22 de marzo de 2026.<br/><em>Versión 1.0 — Última actualización: 22/03/2026</em></p>`,
    },
  },
];
