import { useState, useEffect, useCallback } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Users, 
  TrendingUp, 
  Heart,
  Sparkles,
  Target,
  Zap,
  Shield,
  Award,
  Clock,
  MapPin,
  CreditCard,
  Bell,
  Star,
  BarChart3,
  Smartphone,
  Globe,
  Layers,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  QrCode,
  ChefHat,
  Wallet,
  Calendar,
  MessageSquare,
  Brain,
  Split,
  Gift,
  Eye,
  Lock,
  Lightbulb,
  Play,
  Store,
  Handshake,
  DollarSign,
  PieChart,
  Percent,
  Timer,
  AlertTriangle,
  TrendingDown,
  Headphones,
  Rocket,
  Crown,
  Building2,
  UserCheck,
  ClipboardList,
  Settings,
  Wifi,
  FileText,
  Phone,
  Mail,
  Check
} from "lucide-react";

// ========================================
// SLIDE DATA - Restaurant Focus
// ========================================

interface Slide {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
}

const slides: Slide[] = [
  { id: 'cover', type: 'cover', title: 'Okinawa', subtitle: 'A Tecnologia que Seu Restaurante Merece' },
  { id: 'pain-points', type: 'pain-points', title: 'Suas Dores', subtitle: 'Entendemos seus desafios' },
  { id: 'market-problem', type: 'market-problem', title: 'O Problema do Mercado', subtitle: 'Marketplaces vs. Seu Negócio' },
  { id: 'solution', type: 'solution', title: 'Nossa Solução', subtitle: 'Parceria, não intermediação' },
  { id: 'ecosystem', type: 'ecosystem', title: 'Ecossistema Completo', subtitle: 'Dois apps, uma experiência' },
  { id: 'app-overview', type: 'app-overview', title: 'App Okinawa Restaurant', subtitle: 'Visão geral do sistema' },
  { id: 'dashboard', type: 'dashboard', title: 'Dashboard', subtitle: 'Comando central em tempo real' },
  { id: 'kds', type: 'kds', title: 'KDS Cozinha & Bar', subtitle: 'Produção otimizada' },
  { id: 'floor-plan', type: 'floor-plan', title: 'Gestão de Salão', subtitle: 'Mapa interativo de mesas' },
  { id: 'reservations', type: 'reservations', title: 'Reservas & Fila', subtitle: 'Ocupação maximizada' },
  { id: 'team-management', type: 'team-management', title: 'Gestão de Equipe', subtitle: 'RH, escalas e gorjetas' },
  { id: 'analytics', type: 'analytics', title: 'Analytics & BI', subtitle: 'Decisões baseadas em dados' },
  { id: 'loyalty', type: 'loyalty', title: 'Fidelização', subtitle: 'Seu programa, sua marca' },
  { id: 'service-types', type: 'service-types', title: '8 Tipos de Serviço', subtitle: 'Adaptado à sua operação' },
  { id: 'support', type: 'support', title: 'Como Apoiamos Você', subtitle: 'Sucesso do cliente é nosso sucesso' },
  { id: 'pricing', type: 'pricing', title: 'Planos & Preços', subtitle: 'Investimento que se paga' },
  { id: 'roi', type: 'roi', title: 'Retorno do Investimento', subtitle: 'Números que fazem sentido' },
  { id: 'cta', type: 'cta', title: 'Vamos Crescer Juntos', subtitle: 'Próximos passos' },
];

// ========================================
// SLIDE COMPONENTS
// ========================================

const CoverSlide = () => (
  <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-secondary animate-pulse" style={{ animationDuration: '3s' }} />
      <div className="absolute top-1/3 right-20 w-40 h-40 rounded-full bg-teal-500 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-48 h-48 rounded-full bg-primary animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
    </div>
    
    {/* Logo */}
    <div className="relative z-10 mb-6">
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-secondary via-teal-500 to-teal-600 flex items-center justify-center shadow-2xl" style={{ boxShadow: '0 25px 60px -12px hsl(var(--secondary) / 0.4)' }}>
        <Store className="w-14 h-14 md:w-18 md:h-18 text-secondary-foreground" />
      </div>
    </div>
    
    {/* Title */}
    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-secondary via-teal-500 to-secondary bg-clip-text text-transparent mb-3 relative z-10">
      Okinawa
    </h1>
    
    <p className="text-xl md:text-2xl text-muted-foreground mb-4 relative z-10 font-light">
      Para Restaurantes
    </p>
    
    <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mb-10 relative z-10 leading-relaxed px-4">
      A plataforma completa que <span className="text-secondary font-semibold">transforma sua operação</span>, 
      <span className="text-primary font-semibold"> fideliza seus clientes</span> e 
      <span className="text-teal-500 font-semibold"> aumenta seu faturamento</span>
    </p>
    
    {/* Value Props */}
    <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
      {[
        { icon: Zap, text: 'Operação Eficiente' },
        { icon: Heart, text: 'Clientes Fiéis' },
        { icon: TrendingUp, text: 'Mais Receita' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
          <item.icon className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-foreground">{item.text}</span>
        </div>
      ))}
    </div>
    
    {/* Scroll hint */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
      <span className="text-sm">Deslize para conhecer</span>
      <ChevronRight className="w-5 h-5 rotate-90" />
    </div>
  </div>
);

const PainPointsSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
      Conhecemos Suas Dores
    </h2>
    <p className="text-lg text-muted-foreground mb-8">
      Os desafios que você enfrenta diariamente na gestão do seu restaurante
    </p>
    
    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
      {[
        { 
          icon: TrendingDown, 
          title: 'Margens Apertadas',
          desc: 'Marketplaces cobram até 30% de comissão, comprimindo sua rentabilidade',
          color: 'red-500'
        },
        { 
          icon: Users, 
          title: 'Fidelização Difícil',
          desc: 'Clientes são do marketplace, não seus. Você perde o relacionamento',
          color: 'orange-500'
        },
        { 
          icon: BarChart3, 
          title: 'Falta de Dados',
          desc: 'Sem informações sobre preferências e comportamento dos clientes',
          color: 'amber-500'
        },
        { 
          icon: Clock, 
          title: 'Operação Manual',
          desc: 'Processos ineficientes que geram erros e lentidão no atendimento',
          color: 'yellow-600'
        },
        { 
          icon: Wallet, 
          title: 'Pagamentos Complexos',
          desc: 'Divisão de conta, diferentes formas de pagamento, conferência manual',
          color: 'lime-600'
        },
        { 
          icon: MessageSquare, 
          title: 'Comunicação Falha',
          desc: 'Pedidos errados entre salão e cozinha, retrabalho constante',
          color: 'green-500'
        },
        { 
          icon: Calendar, 
          title: 'Gestão de Reservas',
          desc: 'No-shows frequentes, overbooking, mesas vazias em horários nobres',
          color: 'teal-500'
        },
        { 
          icon: AlertTriangle, 
          title: 'Dependência de Terceiros',
          desc: 'Seu negócio nas mãos de plataformas que mudam regras a qualquer momento',
          color: 'cyan-500'
        },
      ].map((item, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border hover:border-red-500/20 transition-colors">
          <div className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center flex-shrink-0`}>
            <item.icon className={`w-6 h-6 text-${item.color}`} />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
    
    <p className="text-center mt-8 text-lg text-primary font-semibold">
      Se você se identificou com pelo menos 3 dessas dores, Okinawa é para você.
    </p>
  </div>
);

const MarketProblemSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
      O Modelo Atual Não Funciona Para Você
    </h2>
    
    <div className="grid md:grid-cols-2 gap-8 mb-8">
      {/* Current Model */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Marketplaces Tradicionais</h3>
        </div>
        <div className="space-y-4">
          {[
            'Comissões de 15% a 30% por pedido',
            'Cliente é deles, não seu',
            'Sem dados de comportamento',
            'Foco em delivery, não experiência',
            'Você vira commodity entre milhares',
            'Dependência total da plataforma',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <X className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-foreground/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Okinawa Model */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Modelo Okinawa</h3>
        </div>
        <div className="space-y-4">
          {[
            'Assinatura fixa previsível + taxa mínima',
            'Cliente é 100% seu, relacionamento direto',
            'Analytics completo de preferências',
            'Foco em experiência presencial',
            'Destaque pela qualidade, não preço',
            'Você controla seu negócio',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
              <span className="text-foreground/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Comparison */}
    <div className="p-6 rounded-2xl bg-gradient-to-r from-red-500/5 via-transparent to-secondary/5 border border-border">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-3xl font-bold text-red-500 mb-1">-25%</p>
          <p className="text-sm text-muted-foreground">Margem perdida<br />em marketplaces</p>
        </div>
        <div className="text-4xl text-muted-foreground">→</div>
        <div className="text-center flex-1">
          <p className="text-3xl font-bold text-secondary mb-1">+18%</p>
          <p className="text-sm text-muted-foreground">Aumento médio<br />com Okinawa</p>
        </div>
      </div>
    </div>
  </div>
);

const SolutionSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent">
        Parceria, Não Intermediação
      </h2>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
        Okinawa é uma ferramenta para <strong>seu</strong> sucesso, não um intermediário que lucra às suas custas
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        {
          icon: Heart,
          title: 'Seu Cliente, Seu Relacionamento',
          desc: 'Você mantém contato direto com cada cliente. Dados, preferências e histórico são seus.',
          color: 'primary'
        },
        {
          icon: Building2,
          title: 'Sua Marca em Destaque',
          desc: 'Programa de fidelidade com sua identidade visual. Clientes associam benefícios a você.',
          color: 'secondary'
        },
        {
          icon: Brain,
          title: 'Inteligência para Crescer',
          desc: 'Analytics acionáveis que mostram o que funciona e onde melhorar. Decisões baseadas em dados.',
          color: 'teal-500'
        },
      ].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 transition-all text-center">
          <div className={`w-14 h-14 rounded-2xl bg-${item.color}/10 flex items-center justify-center mx-auto mb-4`}>
            <item.icon className={`w-7 h-7 text-${item.color}`} />
          </div>
          <h3 className="text-lg font-bold mb-2 text-foreground">{item.title}</h3>
          <p className="text-muted-foreground text-sm">{item.desc}</p>
        </div>
      ))}
    </div>
    
    {/* Mission Statement */}
    <div className="p-8 rounded-3xl bg-gradient-to-r from-secondary/10 via-teal-500/10 to-primary/10 border border-secondary/20 text-center">
      <Lightbulb className="w-10 h-10 text-secondary mx-auto mb-4" />
      <p className="text-xl font-semibold text-foreground mb-2">
        "Nosso sucesso é medido pelo seu sucesso"
      </p>
      <p className="text-muted-foreground">
        Quando você cresce, crescemos juntos. Não ganhamos em cima da sua operação — ganhamos ajudando você a operar melhor.
      </p>
    </div>
  </div>
);

const EcosystemSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Ecossistema Completo
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Dois aplicativos que trabalham em sincronia perfeita para criar experiências únicas
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
      {/* Client App */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">App do Cliente</h3>
            <p className="text-sm text-muted-foreground">Seus clientes usam</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            'Descoberta e reservas',
            'Cardápio digital interativo',
            'Pedidos na mesa via QR',
            'Pagamento integrado e divisão',
            'Programa de fidelidade',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-foreground/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Restaurant App */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-teal-600 flex items-center justify-center">
            <Store className="w-7 h-7 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">App do Restaurante</h3>
            <p className="text-sm text-muted-foreground">Você e sua equipe usam</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            'Dashboard em tempo real',
            'KDS para cozinha e bar',
            'Gestão de salão e mesas',
            'Reservas e fila virtual',
            'Analytics e relatórios',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
              <span className="text-foreground/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Connection */}
    <div className="flex items-center justify-center gap-4">
      <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-primary/30" />
      <div className="px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Sincronização em Tempo Real</span>
        </div>
      </div>
      <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-secondary/30" />
    </div>
  </div>
);

const AppOverviewSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
        <Store className="w-4 h-4" />
        App do Restaurante
      </div>
      <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
        Tudo que Você Precisa em 
        <span className="bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent"> Um Só Lugar</span>
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        20+ telas especializadas para cada função da sua operação
      </p>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { icon: BarChart3, name: 'Dashboard', desc: 'Métricas ao vivo' },
        { icon: ChefHat, name: 'KDS Cozinha', desc: 'Gestão de pedidos' },
        { icon: Utensils, name: 'KDS Bar', desc: 'Bebidas sincronizadas' },
        { icon: MapPin, name: 'Planta Salão', desc: 'Mapa interativo' },
        { icon: Calendar, name: 'Reservas', desc: 'Calendário completo' },
        { icon: Clock, name: 'Fila Virtual', desc: 'Gestão de espera' },
        { icon: Users, name: 'Staff', desc: 'Gestão de equipe' },
        { icon: CreditCard, name: 'Gorjetas', desc: 'Distribuição justa' },
        { icon: TrendingUp, name: 'Analytics', desc: 'Insights de BI' },
        { icon: MessageSquare, name: 'Avaliações', desc: 'Feedback direto' },
        { icon: Award, name: 'Loyalty', desc: 'Programa próprio' },
        { icon: Layers, name: 'Cardápio', desc: 'Gestão completa' },
        { icon: Bell, name: 'Alertas', desc: 'Notificações smart' },
        { icon: Wallet, name: 'Financeiro', desc: 'Relatórios detalhados' },
        { icon: Settings, name: 'Configurações', desc: 'Personalização total' },
        { icon: Shield, name: 'Permissões', desc: 'Controle de acesso' },
      ].map((item, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border hover:border-secondary/30 transition-all text-center group">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-secondary/20 transition-colors">
            <item.icon className="w-5 h-5 text-secondary" />
          </div>
          <p className="font-semibold text-sm text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const DashboardSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Mockup */}
      <div className="flex-shrink-0">
        <div className="relative">
          <div className="w-80 h-[440px] rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 p-2 shadow-2xl">
            <div className="w-full h-full rounded-2xl bg-background border border-border overflow-hidden">
              {/* Header */}
              <div className="h-12 bg-secondary/10 border-b border-border flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  <span className="font-semibold text-sm text-foreground">Dashboard</span>
                </div>
                <div className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs">Ao Vivo</div>
              </div>
              {/* Content */}
              <div className="p-3 space-y-3">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Mesas', value: '18/24', color: 'secondary' },
                    { label: 'Pedidos', value: '47', color: 'primary' },
                    { label: 'Fatura', value: 'R$ 8.4k', color: 'green-500' },
                    { label: 'Espera', value: '12min', color: 'amber-500' },
                  ].map((stat, i) => (
                    <div key={i} className="p-2 rounded-lg bg-card border border-border text-center">
                      <p className={`text-base font-bold text-${stat.color}`}>{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="h-24 rounded-xl bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20 p-3">
                  <p className="text-xs text-muted-foreground mb-2">Vendas Hoje</p>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 65, 45, 80, 60, 90, 75, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-secondary/40 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                {/* Active Orders */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Pedidos Ativos</p>
                  {[
                    { table: '12', items: 3, status: 'Preparando', color: 'amber-500' },
                    { table: '07', items: 5, status: 'Pronto', color: 'green-500' },
                    { table: '19', items: 2, status: 'Novo', color: 'primary' },
                  ].map((order, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">Mesa {order.table}</span>
                        <span className="text-xs text-muted-foreground">{order.items} itens</span>
                      </div>
                      <span className={`text-xs font-medium text-${order.color}`}>{order.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-4 bg-secondary/10 rounded-[3rem] blur-2xl -z-10" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-4">
          <BarChart3 className="w-3 h-3" />
          Tela Principal
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Dashboard em
          <span className="bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent"> Tempo Real</span>
        </h2>
        <p className="text-muted-foreground mb-6">
          Visão completa da sua operação em um único lugar. Métricas ao vivo, pedidos ativos e alertas importantes.
        </p>
        
        <div className="space-y-3">
          {[
            { icon: Eye, title: 'Visão 360°', desc: 'Ocupação, vendas, tempo de espera, tudo ao vivo' },
            { icon: Bell, title: 'Alertas Inteligentes', desc: 'Notificações de gargalos e oportunidades' },
            { icon: Target, title: 'Metas Diárias', desc: 'Acompanhe progresso vs. objetivos' },
            { icon: Zap, title: 'Ações Rápidas', desc: 'Um toque para resolver situações críticas' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <item.icon className="w-5 h-5 text-secondary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const KDSSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent">
        KDS - Kitchen Display System
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Sistema de display para cozinha e bar que elimina comandas de papel e erros de comunicação
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Kitchen KDS */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">KDS Cozinha</h3>
            <p className="text-sm text-muted-foreground">Para chefs e cozinheiros</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            'Pedidos organizados por prioridade',
            'Timer automático por prato',
            'Alerta de atraso com cores',
            'Marcação de itens prontos',
            'Histórico de produção',
            'Integração com estoque',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-foreground/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bar KDS */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">KDS Bar</h3>
            <p className="text-sm text-muted-foreground">Para barmen e atendentes</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            'Bebidas separadas de comida',
            'Priorização automática',
            'Sincronização com cozinha',
            'Cancelamento com confirmação',
            'Receitas de drinks integradas',
            'Controle de estoque de bebidas',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
              <span className="text-foreground/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Benefits */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { value: '-80%', label: 'Erros de pedido' },
        { value: '-25%', label: 'Tempo de preparo' },
        { value: '+40%', label: 'Produtividade' },
        { value: '0', label: 'Comandas de papel' },
      ].map((stat, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border text-center">
          <p className="text-2xl font-bold text-secondary">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const FloorPlanSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="flex flex-col md:flex-row-reverse items-center gap-8">
      {/* Mockup */}
      <div className="flex-shrink-0">
        <div className="relative">
          <div className="w-80 h-[360px] rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 p-2 shadow-2xl">
            <div className="w-full h-full rounded-2xl bg-background border border-border overflow-hidden">
              {/* Header */}
              <div className="h-10 bg-secondary/10 border-b border-border flex items-center justify-between px-4">
                <span className="font-semibold text-sm text-foreground">Planta do Salão</span>
                <span className="text-xs text-muted-foreground">18/24 ocupadas</span>
              </div>
              {/* Floor Map */}
              <div className="p-4 h-full relative">
                {/* Tables */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { num: '01', status: 'occupied', color: 'secondary' },
                    { num: '02', status: 'available', color: 'muted' },
                    { num: '03', status: 'reserved', color: 'amber-500' },
                    { num: '04', status: 'occupied', color: 'secondary' },
                    { num: '05', status: 'occupied', color: 'secondary' },
                    { num: '06', status: 'bill', color: 'primary' },
                    { num: '07', status: 'occupied', color: 'secondary' },
                    { num: '08', status: 'available', color: 'muted' },
                    { num: '09', status: 'occupied', color: 'secondary' },
                    { num: '10', status: 'occupied', color: 'secondary' },
                    { num: '11', status: 'available', color: 'muted' },
                    { num: '12', status: 'occupied', color: 'secondary' },
                  ].map((table, i) => (
                    <div key={i} className={`aspect-square rounded-lg bg-${table.color}/20 border border-${table.color}/40 flex items-center justify-center`}>
                      <span className={`text-xs font-bold text-${table.color}`}>{table.num}</span>
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                  {[
                    { color: 'secondary', label: 'Ocupada' },
                    { color: 'muted', label: 'Livre' },
                    { color: 'amber-500', label: 'Reservada' },
                    { color: 'primary', label: 'Conta' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full bg-${item.color}`} />
                      <span className="text-[9px] text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-4 bg-secondary/10 rounded-[3rem] blur-2xl -z-10" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-4">
          <MapPin className="w-3 h-3" />
          Gestão de Salão
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Mapa Interativo de
          <span className="bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent"> Mesas</span>
        </h2>
        <p className="text-muted-foreground mb-6">
          Visualize seu salão em tempo real. Arraste mesas, veja status e otimize a ocupação com inteligência.
        </p>
        
        <div className="space-y-3">
          {[
            { icon: MapPin, title: 'Drag & Drop', desc: 'Reorganize mesas arrastando no mapa' },
            { icon: Eye, title: 'Status Visual', desc: 'Cores indicam ocupação, reserva ou pedindo conta' },
            { icon: Users, title: 'Alocação Smart', desc: 'Sugestão automática de melhor mesa por grupo' },
            { icon: Clock, title: 'Tempo na Mesa', desc: 'Monitore duração de cada atendimento' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <item.icon className="w-5 h-5 text-secondary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ReservationsSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent">
        Reservas & Fila Virtual
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Maximize sua ocupação e elimine no-shows com gestão inteligente
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Reservations */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Sistema de Reservas</h3>
        </div>
        <div className="space-y-3">
          {[
            { icon: Calendar, text: 'Calendário visual com disponibilidade' },
            { icon: Users, text: 'Gestão de grupos e ocasiões especiais' },
            { icon: Bell, text: 'Confirmação automática por WhatsApp' },
            { icon: Clock, text: 'Lembretes anti no-show' },
            { icon: MessageSquare, text: 'Notas e preferências do cliente' },
            { icon: BarChart3, text: 'Analytics de reservas e padrões' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-secondary flex-shrink-0" />
              <span className="text-sm text-foreground/80">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Virtual Queue */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Fila Virtual</h3>
        </div>
        <div className="space-y-3">
          {[
            { icon: QrCode, text: 'Cliente entra na fila por QR ou app' },
            { icon: MapPin, text: 'Pode esperar onde quiser' },
            { icon: Timer, text: 'Estimativa de tempo atualizada' },
            { icon: Bell, text: 'Notificação quando mesa liberar' },
            { icon: Users, text: 'Priorização por tamanho do grupo' },
            { icon: Heart, text: 'VIP pode ter prioridade automática' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground/80">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {[
        { value: '-70%', label: 'No-shows', color: 'secondary' },
        { value: '+25%', label: 'Ocupação', color: 'primary' },
        { value: '4.8★', label: 'Satisfação espera', color: 'amber-500' },
      ].map((stat, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border text-center">
          <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const TeamManagementSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent">
        Gestão Completa de Equipe
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        RH, escalas, gorjetas e performance — tudo integrado
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-6">
      {[
        {
          icon: Users,
          title: 'Cadastro de Staff',
          features: ['Perfis completos', 'Documentos digitais', 'Roles e permissões', 'Contatos de emergência'],
          color: 'secondary'
        },
        {
          icon: Calendar,
          title: 'Escalas de Trabalho',
          features: ['Calendário visual', 'Troca de turnos', 'Aprovação de folgas', 'Alertas de conflito'],
          color: 'primary'
        },
        {
          icon: CreditCard,
          title: 'Gorjetas',
          features: ['Distribuição automática', 'Regras customizáveis', 'Split por função', 'Histórico transparente'],
          color: 'teal-500'
        },
        {
          icon: BarChart3,
          title: 'Performance',
          features: ['Métricas por garçom', 'Avaliações de clientes', 'Ranking interno', 'Bonificações'],
          color: 'amber-500'
        },
        {
          icon: Shield,
          title: 'Controle de Acesso',
          features: ['Login biométrico', 'Permissões granulares', 'Logs de ações', 'Bloqueio remoto'],
          color: 'green-500'
        },
        {
          icon: MessageSquare,
          title: 'Comunicação',
          features: ['Chat interno', 'Avisos em massa', 'Tarefas atribuídas', 'Confirmação de leitura'],
          color: 'cyan-500'
        },
      ].map((item, i) => (
        <div key={i} className="p-5 rounded-2xl bg-card border border-border hover:border-secondary/30 transition-all">
          <div className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center mb-4`}>
            <item.icon className={`w-6 h-6 text-${item.color}`} />
          </div>
          <h3 className="font-bold text-foreground mb-3">{item.title}</h3>
          <div className="space-y-2">
            {item.features.map((feature, j) => (
              <div key={j} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`w-3 h-3 text-${item.color} flex-shrink-0`} />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent">
        Analytics & Business Intelligence
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Dados que viram insights, insights que viram ações, ações que viram resultado
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* Reports */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-secondary" />
          Relatórios Disponíveis
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            'Vendas por período',
            'Ticket médio',
            'Pratos mais vendidos',
            'Horários de pico',
            'Rentabilidade por item',
            'Custo de operação',
            'Performance de staff',
            'Padrões de cliente',
            'Taxa de retorno',
            'Tempo médio na mesa',
            'Reservas vs. walk-in',
            'Comparativo semanal',
          ].map((report, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-3 h-3 text-secondary flex-shrink-0" />
              <span className="text-foreground/80">{report}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Features */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Inteligência Aplicada
        </h3>
        <div className="space-y-4">
          {[
            { icon: TrendingUp, title: 'Previsões', desc: 'Estimativa de demanda por dia/horário' },
            { icon: AlertTriangle, title: 'Alertas Proativos', desc: 'Aviso antes de problemas acontecerem' },
            { icon: Target, title: 'Recomendações', desc: 'Sugestões de ações baseadas em dados' },
            { icon: PieChart, title: 'Benchmarking', desc: 'Compare com médias do mercado' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 text-center">
      <p className="text-foreground font-medium">
        📊 Exporte relatórios em PDF, Excel ou integre via API com seu ERP
      </p>
    </div>
  </div>
);

const LoyaltySlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Seu Programa de Fidelidade
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Sua marca, suas regras. Crie relacionamentos duradouros com seus clientes
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8">
      {/* Features */}
      <div className="space-y-4">
        {[
          { 
            icon: Award, 
            title: 'Tiers Personalizados',
            desc: 'Bronze, Prata, Ouro... você define níveis e benefícios'
          },
          { 
            icon: Star, 
            title: 'Sistema de Pontos',
            desc: 'Ganhe pontos por visita, gasto ou ações específicas'
          },
          { 
            icon: Gift, 
            title: 'Recompensas Flexíveis',
            desc: 'Descontos, brindes, experiências exclusivas'
          },
          { 
            icon: Bell, 
            title: 'Campanhas Automáticas',
            desc: 'Aniversário, cliente sumido, conquistas'
          },
          { 
            icon: Building2, 
            title: 'Sua Identidade',
            desc: 'Cores, logo e nome do programa são seus'
          },
          { 
            icon: BarChart3, 
            title: 'Métricas de Fidelização',
            desc: 'Acompanhe taxa de retorno e LTV'
          },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Example Card */}
      <div className="flex items-center justify-center">
        <div className="w-72 p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-500/80">Membro</p>
                  <p className="font-bold text-amber-400">GOLD</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">2,450</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Próximo nível</span>
                <span className="text-amber-500 font-medium">Platinum (3000)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-amber-500" />
                <span>Sobremesa grátis no aniversário</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-amber-500" />
                <span>10% off toda terça-feira</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ServiceTypesSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary via-teal-500 to-primary bg-clip-text text-transparent">
        Adaptado à Sua Operação
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        8 tipos de serviço com fluxos e interfaces específicas para cada modelo
      </p>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { name: 'Full-Service', desc: 'Restaurante tradicional', features: 'Reservas, garçom, split payment' },
        { name: 'Quick Service', desc: 'Fast-food', features: 'Fila rápida, auto-atendimento' },
        { name: 'Fast Casual', desc: 'Híbrido', features: 'Qualidade + velocidade' },
        { name: 'Café & Bakery', desc: 'Cafeterias', features: 'Pedidos rápidos, fidelidade' },
        { name: 'Buffet', desc: 'Self-service', features: 'Pesagem ou por pessoa' },
        { name: 'Drive-Thru', desc: 'No carro', features: 'GPS tracking, notificações' },
        { name: 'Food Truck', desc: 'Móvel', features: 'Localização dinâmica' },
        { name: "Chef's Table", desc: 'Exclusivo', features: 'Experiências premium' },
      ].map((type, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border hover:border-secondary/30 transition-all">
          <h3 className="font-bold text-foreground mb-1">{type.name}</h3>
          <p className="text-xs text-secondary mb-2">{type.desc}</p>
          <p className="text-xs text-muted-foreground">{type.features}</p>
        </div>
      ))}
    </div>
    
    <p className="text-center mt-6 text-muted-foreground text-sm">
      Configure durante o onboarding e toda a experiência se adapta automaticamente
    </p>
  </div>
);

const SupportSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent">
        Como Apoiamos Você
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Não vendemos software e sumimos. Somos parceiros do seu sucesso
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        {
          icon: Rocket,
          title: 'Onboarding Dedicado',
          items: ['Setup completo guiado', 'Treinamento da equipe', 'Configuração personalizada', 'Go-live acompanhado']
        },
        {
          icon: Headphones,
          title: 'Suporte Contínuo',
          items: ['Chat 7 dias por semana', 'Tempo de resposta < 2h', 'Suporte em português', 'Escalação para especialistas']
        },
        {
          icon: TrendingUp,
          title: 'Customer Success',
          items: ['Reuniões mensais de review', 'Análise de métricas', 'Recomendações proativas', 'Roadmap de evolução']
        },
      ].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <item.icon className="w-7 h-7 text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-foreground text-center mb-4">{item.title}</h3>
          <div className="space-y-2">
            {item.items.map((text, j) => (
              <div key={j} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-foreground/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    
    <div className="p-6 rounded-2xl bg-gradient-to-r from-secondary/10 to-teal-500/10 border border-secondary/20 text-center">
      <p className="text-lg font-semibold text-foreground mb-2">
        🎓 Academia Okinawa
      </p>
      <p className="text-muted-foreground">
        Biblioteca de tutoriais, webinars e best practices para extrair o máximo da plataforma
      </p>
    </div>
  </div>
);

const PricingSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent">
        Planos & Investimento
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Preços justos que se pagam em aumento de eficiência e faturamento
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        {
          name: 'Essencial',
          price: 'R$ 299',
          period: '/mês',
          desc: 'Para começar',
          features: [
            'Dashboard + KDS básico',
            'Até 20 mesas',
            'Reservas e fila virtual',
            'App cliente integrado',
            'Suporte por chat',
          ],
          cta: 'Começar',
          popular: false
        },
        {
          name: 'Profissional',
          price: 'R$ 599',
          period: '/mês',
          desc: 'Mais popular',
          features: [
            'Tudo do Essencial +',
            'Mesas ilimitadas',
            'KDS Cozinha + Bar',
            'Gestão de equipe',
            'Analytics avançado',
            'Programa de fidelidade',
            'Suporte prioritário',
          ],
          cta: 'Escolher',
          popular: true
        },
        {
          name: 'Enterprise',
          price: 'Sob consulta',
          period: '',
          desc: 'Multi-unidades',
          features: [
            'Tudo do Profissional +',
            'Multi-restaurantes',
            'API dedicada',
            'Customer Success dedicado',
            'SLA garantido',
            'Customizações',
          ],
          cta: 'Falar com vendas',
          popular: false
        },
      ].map((plan, i) => (
        <div key={i} className={`p-6 rounded-2xl border ${plan.popular ? 'bg-gradient-to-br from-secondary/10 to-teal-500/5 border-secondary/30 scale-105' : 'bg-card border-border'}`}>
          {plan.popular && (
            <div className="text-center mb-4">
              <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                Mais Popular
              </span>
            </div>
          )}
          <h3 className="text-xl font-bold text-foreground text-center">{plan.name}</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">{plan.desc}</p>
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-foreground">{plan.price}</span>
            <span className="text-muted-foreground">{plan.period}</span>
          </div>
          <div className="space-y-2 mb-6">
            {plan.features.map((feature, j) => (
              <div key={j} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>
          <button className={`w-full py-3 rounded-xl font-medium transition-colors ${plan.popular ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            {plan.cta}
          </button>
        </div>
      ))}
    </div>
    
    <div className="text-center text-sm text-muted-foreground">
      <p>+ Taxa de processamento de pagamentos: <strong className="text-foreground">1.5% a 2.5%</strong> sobre transações pelo app</p>
      <p className="mt-1">Sem taxa de setup • Sem fidelidade • Cancele quando quiser</p>
    </div>
  </div>
);

const ROISlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
        O Investimento se Paga
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Números reais de restaurantes que usam Okinawa
      </p>
    </div>
    
    <div className="grid md:grid-cols-4 gap-6 mb-10">
      {[
        { value: '+18%', label: 'Aumento de faturamento', icon: TrendingUp, color: 'green-500' },
        { value: '-30%', label: 'Redução de no-shows', icon: Calendar, color: 'secondary' },
        { value: '+45%', label: 'Taxa de retorno', icon: Heart, color: 'primary' },
        { value: '-25%', label: 'Tempo de atendimento', icon: Clock, color: 'teal-500' },
      ].map((stat, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border text-center">
          <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center mx-auto mb-3`}>
            <stat.icon className={`w-6 h-6 text-${stat.color}`} />
          </div>
          <p className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
    
    {/* ROI Calculator */}
    <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">Simulação de ROI</h3>
        <p className="text-muted-foreground text-sm">Restaurante com faturamento médio de R$ 150k/mês</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Investimento mensal</p>
          <p className="text-2xl font-bold text-foreground">R$ 599</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Aumento estimado (18%)</p>
          <p className="text-2xl font-bold text-green-500">+ R$ 27.000</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">ROI</p>
          <p className="text-2xl font-bold text-green-500">45x</p>
        </div>
      </div>
    </div>
  </div>
);

const CTASlide = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-500 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
    </div>
    
    {/* Logo */}
    <div className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br from-secondary via-teal-500 to-teal-600 flex items-center justify-center mb-8 shadow-2xl" style={{ boxShadow: '0 25px 60px -12px hsl(var(--secondary) / 0.4)' }}>
      <Store className="w-12 h-12 text-secondary-foreground" />
    </div>
    
    <h2 className="relative z-10 text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-secondary via-teal-500 to-secondary bg-clip-text text-transparent leading-tight">
      Pronto para Transformar<br />Seu Restaurante?
    </h2>
    
    <p className="relative z-10 text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
      Junte-se aos restaurantes que estão criando experiências memoráveis e crescendo com Okinawa
    </p>
    
    {/* CTAs */}
    <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 mb-10">
      <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-secondary to-teal-600 text-secondary-foreground shadow-lg cursor-pointer hover:opacity-90 transition-opacity">
        <Rocket className="w-5 h-5" />
        <span className="font-semibold">Agendar Demo Gratuita</span>
      </div>
      <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-card border border-border hover:border-secondary/30 transition-colors cursor-pointer">
        <Phone className="w-5 h-5 text-secondary" />
        <span className="font-semibold text-foreground">Falar com Consultor</span>
      </div>
    </div>
    
    {/* Benefits */}
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 mb-10">
      {[
        'Sem taxa de setup',
        'Treinamento incluso',
        '14 dias grátis',
        'Cancele quando quiser',
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-secondary" />
          <span>{item}</span>
        </div>
      ))}
    </div>
    
    {/* Contact */}
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Globe className="w-4 h-4" />
        <span className="text-sm">okinawa.app/restaurantes</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Mail className="w-4 h-4" />
        <span className="text-sm">parceiros@okinawa.app</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Phone className="w-4 h-4" />
        <span className="text-sm">(11) 9999-9999</span>
      </div>
    </div>
  </div>
);

// ========================================
// MAIN COMPONENT
// ========================================

export default function RestaurantPitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNav, setShowNav] = useState(false);
  
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
      setShowNav(false);
    }
  }, []);
  
  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);
  
  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        setShowNav(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);
  
  const renderSlide = () => {
    switch (slides[currentSlide].type) {
      case 'cover': return <CoverSlide />;
      case 'pain-points': return <PainPointsSlide />;
      case 'market-problem': return <MarketProblemSlide />;
      case 'solution': return <SolutionSlide />;
      case 'ecosystem': return <EcosystemSlide />;
      case 'app-overview': return <AppOverviewSlide />;
      case 'dashboard': return <DashboardSlide />;
      case 'kds': return <KDSSlide />;
      case 'floor-plan': return <FloorPlanSlide />;
      case 'reservations': return <ReservationsSlide />;
      case 'team-management': return <TeamManagementSlide />;
      case 'analytics': return <AnalyticsSlide />;
      case 'loyalty': return <LoyaltySlide />;
      case 'service-types': return <ServiceTypesSlide />;
      case 'support': return <SupportSlide />;
      case 'pricing': return <PricingSlide />;
      case 'roi': return <ROISlide />;
      case 'cta': return <CTASlide />;
      default: return <CoverSlide />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead
        title="Para Restaurantes"
        description="Okinawa para Restaurantes — plataforma completa de gestão, fidelização e operação inteligente para seu estabelecimento."
        canonical="/pitch/restaurants"
      />
      {/* Navigation Menu */}
      {showNav && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl">
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setShowNav(false)}
              className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="h-full flex items-center justify-center overflow-y-auto py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-8 max-w-6xl">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentSlide === index 
                      ? 'bg-secondary/10 border-secondary/30' 
                      : 'bg-card border-border hover:border-secondary/20'
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">{index + 1}</p>
                  <p className="font-medium text-xs text-foreground">{slide.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border">
        <button
          onClick={() => setShowNav(true)}
          className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-teal-600 flex items-center justify-center">
              <Store className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="font-bold text-foreground hidden md:inline">Okinawa</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Para Restaurantes
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
      
      {/* Slide content */}
      <div className="pt-16 pb-20 min-h-screen">
        {renderSlide()}
      </div>
      
      {/* Navigation controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-t border-border">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`p-3 rounded-xl transition-all ${
            currentSlide === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {/* Dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] px-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-2 h-2 rounded-full transition-all ${
                currentSlide === index 
                  ? 'w-6 bg-secondary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`p-3 rounded-xl transition-all ${
            currentSlide === slides.length - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
