import { useState, useEffect, useCallback } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Users, 
  TrendingUp, 
  Heart,
  Target,
  Zap,
  Award,
  Clock,
  MapPin,
  CreditCard,
  Star,
  BarChart3,
  Smartphone,
  Globe,
  Layers,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Brain,
  Rocket,
  Building2,
  DollarSign,
  Percent,
  Timer,
  Crown,
  Check,
  CircleDot,
  TrendingDown,
  Wallet,
  Calendar,
  LineChart,
  PiggyBank
} from "lucide-react";

// ========================================
// SLIDE DATA - Investor Focus (14 slides max)
// ========================================

interface Slide {
  id: string;
  type: string;
  title: string;
}

const slides: Slide[] = [
  { id: 'cover', type: 'cover', title: 'Okinawa' },
  { id: 'problem', type: 'problem', title: 'O Problema' },
  { id: 'solution', type: 'solution', title: 'A Solução' },
  { id: 'product', type: 'product', title: 'O Produto' },
  { id: 'why-now', type: 'why-now', title: 'Por Que Agora' },
  { id: 'market', type: 'market', title: 'Mercado' },
  { id: 'business-model', type: 'business-model', title: 'Modelo de Negócio' },
  { id: 'traction', type: 'traction', title: 'Tração' },
  { id: 'competition', type: 'competition', title: 'Competição' },
  { id: 'gtm', type: 'gtm', title: 'Go-to-Market' },
  { id: 'team', type: 'team', title: 'Time' },
  { id: 'roadmap', type: 'roadmap', title: 'Roadmap' },
  { id: 'financials', type: 'financials', title: 'Números' },
  { id: 'ask', type: 'ask', title: 'O Ask' },
];

// ========================================
// SLIDE COMPONENTS - Clean & Impactful
// ========================================

const CoverSlide = () => (
  <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden px-6">
    {/* Subtle gradient background */}
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-full" />
    </div>
    
    {/* Logo */}
    <div className="relative z-10 mb-8">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-2xl" style={{ boxShadow: '0 20px 50px -12px hsl(var(--primary) / 0.35)' }}>
        <Utensils className="w-12 h-12 text-primary-foreground" />
      </div>
    </div>
    
    {/* One sentence */}
    <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 relative z-10">
      Okinawa
    </h1>
    
    <p className="text-2xl md:text-3xl text-foreground/80 max-w-3xl relative z-10 leading-relaxed font-light">
      A plataforma que transforma restaurantes em 
      <span className="text-primary font-semibold"> máquinas de fidelização</span>
    </p>
    
    <div className="mt-16 text-sm text-muted-foreground relative z-10">
      Seed Round • Janeiro 2025
    </div>
  </div>
);

const ProblemSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">O Problema</p>
    
    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
      Restaurantes perdem<br />
      <span className="text-red-500">R$ 50 bilhões/ano</span><br />
      para marketplaces
    </h2>
    
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        { number: '25%', label: 'Comissão média cobrada', icon: Percent },
        { number: '0%', label: 'Dos dados pertencem ao restaurante', icon: BarChart3 },
        { number: '70%', label: 'Dos clientes nunca voltam', icon: TrendingDown },
      ].map((stat, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border">
          <stat.icon className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-4xl font-bold text-foreground mb-2">{stat.number}</p>
          <p className="text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
    
    <p className="text-xl text-muted-foreground max-w-3xl">
      Restaurantes viraram <strong className="text-foreground">commodities</strong> em apps de terceiros. 
      Pagam caro, perdem o relacionamento com o cliente, e não têm dados para melhorar.
    </p>
  </div>
);

const SolutionSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">A Solução</p>
    
    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
      Devolvemos o cliente<br />
      <span className="text-primary">ao restaurante</span>
    </h2>
    
    <div className="grid md:grid-cols-2 gap-8 mb-8">
      <div className="space-y-6">
        {[
          { icon: Heart, text: 'Relacionamento direto com cada cliente' },
          { icon: Brain, text: 'Dados e insights de comportamento' },
          { icon: Zap, text: 'Operação 100% digitalizada' },
          { icon: TrendingUp, text: 'Programa de fidelidade próprio' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-lg text-foreground">{item.text}</p>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <p className="text-6xl font-bold text-primary mb-2">+45%</p>
            <p className="text-lg text-foreground">Taxa de retorno<br />dos clientes</p>
          </div>
        </div>
      </div>
    </div>
    
    <p className="text-xl text-muted-foreground">
      <strong className="text-foreground">Resultado:</strong> Restaurante deixa de depender de marketplace 
      e constrói base de clientes fiéis.
    </p>
  </div>
);

const ProductSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider text-center">O Produto</p>
    
    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-10 text-center">
      Dois apps. Uma experiência.
    </h2>
    
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Client App */}
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-xl" />
        <div className="relative p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">App Cliente</h3>
              <p className="text-sm text-muted-foreground">Para consumidores</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Descoberta', 'Reservas', 'QR Pedidos', 'Split Payment', 'Fidelidade', 'Avaliações'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground/80">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Restaurant App */}
      <div className="relative">
        <div className="absolute -inset-4 bg-secondary/5 rounded-[3rem] blur-xl" />
        <div className="relative p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-teal-600 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">App Restaurante</h3>
              <p className="text-sm text-muted-foreground">Para gestores e staff</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Dashboard', 'KDS Cozinha', 'Planta Salão', 'Reservas', 'Analytics', 'Equipe'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-foreground/80">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* Tech proof */}
    <div className="flex items-center justify-center gap-8 mt-10">
      {[
        { number: '56', label: 'Telas' },
        { number: '850+', label: 'Testes' },
        { number: '95%', label: 'Coverage' },
      ].map((stat, i) => (
        <div key={i} className="text-center">
          <p className="text-2xl font-bold text-primary">{stat.number}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const WhyNowSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">Por Que Agora</p>
    
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10 leading-tight">
      Timing perfeito para<br />
      <span className="text-primary">disruption</span>
    </h2>
    
    <div className="grid md:grid-cols-2 gap-6">
      {[
        { 
          icon: TrendingUp, 
          title: 'Digitalização Acelerada',
          desc: 'Pós-pandemia, 78% dos restaurantes buscam soluções digitais'
        },
        { 
          icon: Heart, 
          title: 'Fadiga de Marketplaces',
          desc: 'Restaurantes cansados de comissões predatórias e perda de relacionamento'
        },
        { 
          icon: Smartphone, 
          title: 'Consumidor Mobile-First',
          desc: 'Gen Z e Millennials preferem experiências digitais integradas'
        },
        { 
          icon: CreditCard, 
          title: 'Pagamentos Digitais',
          desc: 'PIX e carteiras digitais tornaram split payment viável'
        },
      ].map((item, i) => (
        <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <item.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
      <p className="text-lg text-foreground">
        <strong>A janela está aberta:</strong> quem construir a infra de fidelização vence.
      </p>
    </div>
  </div>
);

const MarketSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">Mercado</p>
    
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      Mercado de <span className="text-primary">R$ 500 bi</span>
    </h2>
    
    <div className="grid md:grid-cols-3 gap-6 mb-10">
      {[
        { 
          value: 'R$ 500bi', 
          label: 'TAM', 
          desc: 'Food Service Brasil',
          size: 'text-4xl'
        },
        { 
          value: 'R$ 80bi', 
          label: 'SAM', 
          desc: 'Full-Service + Fast Casual',
          size: 'text-4xl'
        },
        { 
          value: 'R$ 5bi', 
          label: 'SOM', 
          desc: 'Target inicial (SP + RJ)',
          size: 'text-4xl'
        },
      ].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-border text-center">
          <p className={`${item.size} font-bold text-primary mb-1`}>{item.value}</p>
          <p className="font-semibold text-foreground mb-1">{item.label}</p>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
    
    <div className="flex items-center gap-8">
      <div className="flex-1 p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="text-green-500 font-bold">+12% ao ano</span>
        </div>
        <p className="text-sm text-muted-foreground">Crescimento do setor</p>
      </div>
      <div className="flex-1 p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-5 h-5 text-primary" />
          <span className="text-primary font-bold">1.3 milhão</span>
        </div>
        <p className="text-sm text-muted-foreground">Restaurantes no Brasil</p>
      </div>
    </div>
  </div>
);

const BusinessModelSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">Modelo de Negócio</p>
    
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      SaaS + Take Rate
    </h2>
    
    <div className="grid md:grid-cols-2 gap-8 mb-8">
      {/* Revenue Streams */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Fontes de Receita
        </h3>
        {[
          { source: 'Assinatura SaaS', value: 'R$ 299-999/mês', desc: 'Por restaurante' },
          { source: 'Take Rate', value: '1.5-2.5%', desc: 'Sobre pagamentos' },
          { source: 'Premium Add-ons', value: 'R$ 99-299/mês', desc: 'AI, Analytics Pro' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div>
              <p className="font-semibold text-foreground">{item.source}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <p className="text-primary font-bold">{item.value}</p>
          </div>
        ))}
      </div>
      
      {/* Unit Economics */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-secondary" />
          Unit Economics
        </h3>
        {[
          { metric: 'CAC', value: 'R$ 500' },
          { metric: 'LTV', value: 'R$ 12.000' },
          { metric: 'LTV/CAC', value: '24x' },
          { metric: 'Payback', value: '2 meses' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <p className="text-foreground">{item.metric}</p>
            <p className="text-secondary font-bold text-xl">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
    
    <p className="text-muted-foreground text-center">
      Modelo comprovado em vertical SaaS. Receita recorrente + transacional.
    </p>
  </div>
);

const TractionSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">Tração</p>
    
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      Sinais reais
    </h2>
    
    <div className="grid md:grid-cols-4 gap-6 mb-10">
      {[
        { number: '850+', label: 'Testes automatizados', icon: CheckCircle2 },
        { number: '95%', label: 'Code coverage', icon: Target },
        { number: '56', label: 'Telas funcionais', icon: Smartphone },
        { number: '2', label: 'Apps nativos prontos', icon: Layers },
      ].map((stat, i) => (
        <div key={i} className="p-5 rounded-2xl bg-card border border-border text-center">
          <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-foreground">{stat.number}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
    
    <div className="grid md:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-green-500" />
          Produto
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> MVP completo e funcional</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Arquitetura enterprise-ready</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Design system maduro</li>
        </ul>
      </div>
      
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Próximos 90 dias
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><CircleDot className="w-4 h-4 text-primary" /> 5 restaurantes piloto</li>
          <li className="flex items-center gap-2"><CircleDot className="w-4 h-4 text-primary" /> 500 usuários ativos</li>
          <li className="flex items-center gap-2"><CircleDot className="w-4 h-4 text-primary" /> Primeiro MRR</li>
        </ul>
      </div>
    </div>
  </div>
);

const CompetitionSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-16 overflow-y-auto py-4">
    <p className="text-primary text-sm font-medium mb-3 uppercase tracking-wider">Competição</p>
    
    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
      Por que <span className="text-primary">ganhamos</span>
    </h2>
    <p className="text-muted-foreground mb-6">
      Único player que integra <strong className="text-foreground">toda a jornada</strong> em uma plataforma UX-first
    </p>
    
    {/* The Integration Problem */}
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* Fragmented Market */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <X className="w-5 h-5 text-red-500" />
          Mercado Fragmentado Hoje
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { tool: 'iFood/Rappi', use: 'Pedidos delivery', problem: 'Só delivery, 25% comissão' },
            { tool: 'TheFork', use: 'Reservas', problem: 'Só reserva, cliente deles' },
            { tool: 'Toast/Linx', use: 'POS/PDV', problem: 'Só operação, sem consumidor' },
            { tool: 'Apps próprios', use: 'Fidelidade', problem: 'Caro, sem escala, sem UX' },
            { tool: 'WhatsApp', use: 'Atendimento', problem: 'Manual, sem dados' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
              <div>
                <span className="font-medium text-foreground">{item.tool}</span>
                <span className="text-muted-foreground ml-2">→ {item.use}</span>
              </div>
              <span className="text-xs text-red-400">{item.problem}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Restaurante usa 5+ ferramentas desconectadas. Dados fragmentados. UX ruim.
        </p>
      </div>
      
      {/* Okinawa Solution */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Okinawa: Tudo Integrado
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { feature: 'Descoberta + Reservas', benefit: 'Cliente encontra e agenda' },
            { feature: 'Check-in + Pedidos', benefit: 'QR na mesa, menu digital' },
            { feature: 'Pagamento + Split', benefit: '4 modos de divisão' },
            { feature: 'Fidelidade + CRM', benefit: 'Pontos, tiers, campanhas' },
            { feature: 'KDS + Analytics', benefit: 'Operação + inteligência' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
              <span className="font-medium text-foreground">{item.feature}</span>
              <span className="text-xs text-primary">{item.benefit}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-foreground font-medium">
          Uma plataforma. Dados unificados. UX premium. Escala infinita.
        </p>
      </div>
    </div>
    
    {/* Competitive Matrix - Compact */}
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Capacidade</th>
            <th className="py-2 px-2 text-center">
              <span className="text-primary font-bold text-xs">Okinawa</span>
            </th>
            <th className="py-2 px-2 text-center text-muted-foreground text-xs">iFood</th>
            <th className="py-2 px-2 text-center text-muted-foreground text-xs">TheFork</th>
            <th className="py-2 px-2 text-center text-muted-foreground text-xs">Toast</th>
            <th className="py-2 px-2 text-center text-muted-foreground text-xs">Goomer</th>
          </tr>
        </thead>
        <tbody>
          {[
            { feature: 'App consumidor nativo', okinawa: true, ifood: true, fork: true, toast: false, goomer: true },
            { feature: 'App restaurante completo', okinawa: true, ifood: false, fork: false, toast: true, goomer: false },
            { feature: 'Foco presencial (não delivery)', okinawa: true, ifood: false, fork: true, toast: true, goomer: true },
            { feature: 'Cliente pertence ao restaurante', okinawa: true, ifood: false, fork: false, toast: true, goomer: true },
            { feature: 'Split Payment (4 modos)', okinawa: true, ifood: false, fork: false, toast: false, goomer: false },
            { feature: 'KDS Cozinha + Bar', okinawa: true, ifood: false, fork: false, toast: true, goomer: false },
            { feature: 'Programa fidelidade white-label', okinawa: true, ifood: false, fork: false, toast: false, goomer: false },
            { feature: 'Analytics comportamental', okinawa: true, ifood: false, fork: false, toast: true, goomer: false },
            { feature: '8 tipos de serviço adaptáveis', okinawa: true, ifood: false, fork: false, toast: false, goomer: false },
            { feature: 'UX-first design system', okinawa: true, ifood: false, fork: false, toast: false, goomer: false },
          ].map((row, i) => (
            <tr key={i} className="border-b border-border/30">
              <td className="py-2 px-3 text-xs text-foreground">{row.feature}</td>
              <td className="py-2 px-2 text-center">
                {row.okinawa ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
              </td>
              <td className="py-2 px-2 text-center">
                {row.ifood ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
              </td>
              <td className="py-2 px-2 text-center">
                {row.fork ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
              </td>
              <td className="py-2 px-2 text-center">
                {row.toast ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
              </td>
              <td className="py-2 px-2 text-center">
                {row.goomer ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Defensibility */}
    <div className="grid md:grid-cols-3 gap-4">
      {[
        { 
          icon: Layers, 
          title: 'Integração Total',
          desc: 'Única plataforma end-to-end: descoberta → reserva → pedido → pagamento → fidelidade'
        },
        { 
          icon: Zap, 
          title: 'UX-First',
          desc: 'Design system premium, 56 telas nativas, experiência que engaja e retém'
        },
        { 
          icon: Target, 
          title: 'Lock-in Natural',
          desc: 'Quanto mais usa, mais dados, mais personalizado, mais difícil trocar'
        },
      ].map((item, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border text-center">
          <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="font-bold text-sm text-foreground mb-1">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const GTMSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">Go-to-Market</p>
    
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      Crescimento <span className="text-primary">replicável</span>
    </h2>
    
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        {
          phase: 'Fase 1',
          title: 'Founders Sales',
          period: 'Q1-Q2 2025',
          desc: 'Top 50 restaurantes SP premium',
          icon: Target
        },
        {
          phase: 'Fase 2',
          title: 'Inside Sales',
          period: 'Q3-Q4 2025',
          desc: 'Expansão RJ + BH com time comercial',
          icon: Users
        },
        {
          phase: 'Fase 3',
          title: 'Product-Led',
          period: '2026+',
          desc: 'Self-service para fast casual',
          icon: Rocket
        },
      ].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary font-medium">{item.phase}</p>
              <p className="font-bold text-foreground">{item.title}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{item.period}</p>
          <p className="text-sm text-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
    
    <div className="grid md:grid-cols-2 gap-6">
      <div className="p-5 rounded-xl bg-card border border-border">
        <h4 className="font-bold text-foreground mb-3">Canais</h4>
        <div className="flex flex-wrap gap-2">
          {['Outbound B2B', 'Eventos gastro', 'Parcerias associações', 'Referral program'].map((c, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-muted text-sm text-foreground">{c}</span>
          ))}
        </div>
      </div>
      <div className="p-5 rounded-xl bg-card border border-border">
        <h4 className="font-bold text-foreground mb-3">Flywheel</h4>
        <p className="text-sm text-muted-foreground">
          Restaurante adota → Clientes usam app → Mais dados → Melhor experiência → Mais restaurantes
        </p>
      </div>
    </div>
  </div>
);

const TeamSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">Time</p>
    
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      Por que <span className="text-primary">esse time</span>
    </h2>
    
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        {
          role: 'CEO & Product',
          skills: ['10+ anos produto tech', 'Ex-Nubank, iFood', 'Stanford GSB'],
          icon: Crown
        },
        {
          role: 'CTO',
          skills: ['15+ anos engenharia', 'Ex-AWS, Mercado Livre', 'MIT CSAIL'],
          icon: Brain
        },
        {
          role: 'COO',
          skills: ['12+ anos operações', 'Ex-Movile, 99', 'Harvard MBA'],
          icon: Target
        },
      ].map((member, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
            <member.icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground mb-3">{member.role}</h3>
          <div className="space-y-1">
            {member.skills.map((skill, j) => (
              <p key={j} className="text-sm text-muted-foreground">{skill}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
    
    <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-center">
      <p className="text-lg text-foreground">
        <strong>Combinação rara:</strong> Experiência em tech de escala + Conhecimento profundo de food service
      </p>
    </div>
  </div>
);

const RoadmapSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">Roadmap</p>
    
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      Próximos <span className="text-primary">24 meses</span>
    </h2>
    
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-primary/30 md:-translate-x-1/2" />
      
      <div className="space-y-8">
        {[
          { quarter: 'Q1 2025', title: 'Beta Privado', items: ['5 restaurantes piloto', '500 usuários', 'Validação de features'], side: 'left' },
          { quarter: 'Q2 2025', title: 'Lançamento SP', items: ['50 restaurantes', '5k usuários', 'Primeiro MRR'], side: 'right' },
          { quarter: 'Q3-Q4 2025', title: 'Expansão', items: ['200 restaurantes', '50k usuários', 'RJ + BH'], side: 'left' },
          { quarter: '2026', title: 'Escala', items: ['1000+ restaurantes', '500k usuários', 'Series A ready'], side: 'right' },
        ].map((item, i) => (
          <div key={i} className={`relative flex items-center gap-6 ${item.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
            <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background md:-translate-x-1/2 z-10" />
            <div className={`flex-1 ml-8 md:ml-0 ${item.side === 'right' ? 'md:pl-8' : 'md:pr-8 md:text-right'}`}>
              <span className="text-xs text-primary font-medium">{item.quarter}</span>
              <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
              <div className={`space-y-1 mt-2 ${item.side === 'right' ? '' : 'md:flex md:flex-col md:items-end'}`}>
                {item.items.map((text, j) => (
                  <p key={j} className="text-sm text-muted-foreground">{text}</p>
                ))}
              </div>
            </div>
            <div className="hidden md:block flex-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FinancialsSlide = () => (
  <div className="h-full flex flex-col justify-center px-6 md:px-20">
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider">Números</p>
    
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10">
      Financeiro <span className="text-primary">simples</span>
    </h2>
    
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[
        { label: 'Burn Mensal', value: 'R$ 80k', icon: Wallet, desc: 'Equipe + Infra' },
        { label: 'Runway Atual', value: '6 meses', icon: Timer, desc: 'Com recursos próprios' },
        { label: 'Runway Pós-Round', value: '24 meses', icon: Calendar, desc: 'Com R$ 2M' },
      ].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border text-center">
          <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-foreground mb-1">{item.value}</p>
          <p className="font-medium text-foreground">{item.label}</p>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
    
    {/* Projections */}
    <div className="p-6 rounded-2xl bg-card border border-border">
      <h3 className="font-bold text-foreground mb-4">Projeção de ARR</h3>
      <div className="grid grid-cols-4 gap-4 text-center">
        {[
          { year: 'Y1', arr: 'R$ 500k' },
          { year: 'Y2', arr: 'R$ 3M' },
          { year: 'Y3', arr: 'R$ 12M' },
          { year: 'Y5', arr: 'R$ 50M' },
        ].map((item, i) => (
          <div key={i}>
            <p className="text-xs text-muted-foreground mb-1">{item.year}</p>
            <p className="text-xl font-bold text-primary">{item.arr}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AskSlide = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-full" />
    </div>
    
    <p className="text-primary text-sm font-medium mb-4 uppercase tracking-wider relative z-10">O Ask</p>
    
    <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-4 relative z-10">
      R$ 2 Milhões
    </h2>
    
    <p className="text-xl text-muted-foreground mb-10 relative z-10">
      Seed Round • 24 meses de runway
    </p>
    
    {/* Use of Funds */}
    <div className="grid md:grid-cols-4 gap-4 mb-10 relative z-10 max-w-4xl">
      {[
        { percent: '50%', area: 'Produto & Eng', value: 'R$ 1M' },
        { percent: '25%', area: 'Comercial', value: 'R$ 500k' },
        { percent: '15%', area: 'Marketing', value: 'R$ 300k' },
        { percent: '10%', area: 'Operações', value: 'R$ 200k' },
      ].map((item, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-primary">{item.percent}</p>
          <p className="font-medium text-foreground">{item.area}</p>
          <p className="text-sm text-muted-foreground">{item.value}</p>
        </div>
      ))}
    </div>
    
    {/* What we'll achieve */}
    <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 max-w-2xl relative z-10">
      <h3 className="font-bold text-foreground mb-4">Com esse investimento:</h3>
      <div className="grid grid-cols-2 gap-4 text-left">
        {[
          '500+ restaurantes',
          '100k+ usuários',
          'R$ 3M ARR',
          'Series A ready'
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-foreground">{item}</span>
          </div>
        ))}
      </div>
    </div>
    
    {/* Closing */}
    <div className="mt-12 relative z-10">
      <p className="text-2xl font-semibold text-foreground mb-2">
        A dor é grande. A solução é única. O time executa.
      </p>
      <p className="text-muted-foreground">
        contato@okinawa.app
      </p>
    </div>
  </div>
);

// ========================================
// MAIN COMPONENT
// ========================================

export default function InvestorPitchDeck() {
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
      case 'problem': return <ProblemSlide />;
      case 'solution': return <SolutionSlide />;
      case 'product': return <ProductSlide />;
      case 'why-now': return <WhyNowSlide />;
      case 'market': return <MarketSlide />;
      case 'business-model': return <BusinessModelSlide />;
      case 'traction': return <TractionSlide />;
      case 'competition': return <CompetitionSlide />;
      case 'gtm': return <GTMSlide />;
      case 'team': return <TeamSlide />;
      case 'roadmap': return <RoadmapSlide />;
      case 'financials': return <FinancialsSlide />;
      case 'ask': return <AskSlide />;
      default: return <CoverSlide />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead
        title="Investidores"
        description="Okinawa Seed Round — Oportunidade de investimento na plataforma que transforma restaurantes em máquinas de fidelização. Mercado de R$500bi."
        canonical="/pitch/investors"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "PresentationDigitalDocument",
          name: "Okinawa Investor Pitch Deck",
          description: "Seed Round pitch deck — R$500bi market opportunity in food service.",
        }}
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
          <div className="h-full flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-8 max-w-5xl">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    currentSlide === index 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-card border-border hover:border-primary/20'
                  }`}
                >
                  <p className="text-lg font-bold text-primary mb-1">{index + 1}</p>
                  <p className="text-xs text-foreground">{slide.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Top bar - Minimal */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/60 backdrop-blur-md">
        <button
          onClick={() => setShowNav(true)}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
            <Utensils className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">Okinawa</span>
          <span className="text-xs text-muted-foreground">• Investor Deck</span>
        </div>
        
        <div className="text-sm font-medium text-muted-foreground">
          {currentSlide + 1}/{slides.length}
        </div>
      </div>
      
      {/* Slide content */}
      <div className="pt-16 pb-20 min-h-screen flex items-center">
        {renderSlide()}
      </div>
      
      {/* Navigation controls - Minimal */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background/60 backdrop-blur-md">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`p-3 rounded-xl transition-all ${
            currentSlide === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'bg-muted/50 hover:bg-muted'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {/* Progress bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`p-3 rounded-xl transition-all ${
            currentSlide === slides.length - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
