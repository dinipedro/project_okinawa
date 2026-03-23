import { ThemeToggle } from "@/components/ui/ThemeToggle";
import ReservioLogo from "@/components/brand/ReservioLogo";
import SEOHead from "@/components/seo/SEOHead";
import { 
  Sparkles, 
  Zap, 
  Heart, 
  MapPin, 
  Star, 
  ArrowRight,
  Utensils,
  Clock,
  Shield
} from "lucide-react";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Okinawa",
  applicationCategory: "FoodEstablishmentReservation",
  operatingSystem: "iOS, Android",
  description: "Descubra momentos incríveis perto de você. Reservas, pedidos e experiências gastronômicas em um só app.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2500",
  },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SEOHead
        title="Experiências Gastronômicas"
        description="Descubra momentos incríveis perto de você. Reservas instantâneas, pedidos e experiências gastronômicas em um só app."
        canonical="/"
        jsonLd={jsonLd}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong" role="navigation" aria-label="Navegação principal">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <ReservioLogo size="sm" />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors link-underline">
              Explorar
            </a>
            <a href="#experiences" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors link-underline">
              Experiências
            </a>
            <a href="#cta" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors link-underline">
              Para Negócios
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle size="sm" />
            <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-dark transition-all duration-300 hover-glow">
              Baixar App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="experiences" className="relative pt-32 pb-20 md:pt-40 md:pb-32" aria-label="Introdução">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-300" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium text-primary">Experiências que conectam</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up delay-100">
              Descubra momentos
              <span className="block text-gradient-hero">incríveis perto de você</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up delay-200">
              Conectamos você às melhores experiências gastronômicas, 
              com a praticidade que você merece e a qualidade que você espera.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              <button className="group w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary-dark transition-all duration-300 hover-glow flex items-center justify-center gap-2">
                Começar Agora
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-border bg-background/50 font-semibold text-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-secondary" aria-hidden="true" />
                Ver Experiências
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border animate-fade-up delay-400" role="list" aria-label="Estatísticas">
              <div className="text-center" role="listitem">
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">50k+</div>
                <div className="text-sm text-muted-foreground mt-1">Usuários Ativos</div>
              </div>
              <div className="text-center" role="listitem">
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">2.5k+</div>
                <div className="text-sm text-muted-foreground mt-1">Estabelecimentos</div>
              </div>
              <div className="text-center" role="listitem">
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">4.9</div>
                <div className="text-sm text-muted-foreground mt-1">Avaliação Média</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted/30" aria-label="Recursos">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Por que escolher o <span className="text-gradient-primary">Okinawa</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Criamos uma experiência completa que coloca você no centro de tudo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {[
              { icon: MapPin, title: "Descoberta Inteligente", desc: "Recomendações personalizadas baseadas no seu gosto e localização.", gradient: "from-primary to-primary-light" },
              { icon: Clock, title: "Reservas Instantâneas", desc: "Reserve sua mesa em segundos, sem complicações ou ligações.", gradient: "from-secondary to-secondary-light" },
              { icon: Star, title: "Avaliações Reais", desc: "Opiniões verificadas de pessoas que viveram a experiência.", gradient: "from-accent to-accent-light" },
              { icon: Shield, title: "Pagamento Seguro", desc: "Transações protegidas com as melhores práticas de segurança.", gradient: "from-success to-success/70" },
              { icon: Heart, title: "Experiências Curadas", desc: "Selecionamos os melhores estabelecimentos para você.", gradient: "from-info to-info/70" },
              { icon: Utensils, title: "Diversidade", desc: "De cafés a restaurantes fine dining, temos opções para todos.", gradient: "from-primary to-secondary" },
            ].map(({ icon: Icon, title, desc, gradient }) => (
              <div key={title} className="card-interactive p-8 hover-lift" role="listitem">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
                  <Icon className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 md:py-32 relative overflow-hidden" aria-label="Download">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" aria-hidden="true" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Pronto para descobrir
              <span className="block text-gradient-hero">sua próxima experiência?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Baixe o Okinawa e comece a explorar milhares de estabelecimentos 
              selecionados especialmente para você.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-all duration-300" aria-label="Download na App Store">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">Download on the</div>
                  <div className="text-lg font-semibold -mt-1">App Store</div>
                </div>
              </button>
              
              <button className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-all duration-300" aria-label="Download no Google Play">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">Get it on</div>
                  <div className="text-lg font-semibold -mt-1">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border" role="contentinfo">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="font-display text-sm font-bold text-primary-foreground">O</span>
              </div>
              <span className="font-display text-lg font-bold">Okinawa</span>
            </div>
            
            <nav className="flex items-center gap-6 text-sm text-muted-foreground" aria-label="Links do rodapé">
              <a href="#features" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#cta" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#features" className="hover:text-foreground transition-colors">Suporte</a>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Okinawa. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
