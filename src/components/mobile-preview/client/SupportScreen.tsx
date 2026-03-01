import { ArrowLeft, MessageCircle, Phone, Mail, ChevronRight, Search, HelpCircle } from "lucide-react";

const faqItems = [
  { question: "Como faço para rastrear meu pedido?", category: "Pedidos" },
  { question: "Como cancelar uma reserva?", category: "Reservas" },
  { question: "Quais formas de pagamento aceitas?", category: "Pagamentos" },
  { question: "Como resgatar meus pontos?", category: "Fidelidade" },
];

export const SupportScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
        <button className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Ajuda</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar ajuda..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-xs font-medium">Ligar</span>
          </button>
          <button className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <span className="text-xs font-medium">Email</span>
          </button>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Perguntas Frequentes
          </h2>
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border text-left hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{item.question}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Need More Help */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center">
          <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-sm mb-1">Precisa de mais ajuda?</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Nossa equipe está disponível 24/7
          </p>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
            Iniciar conversa
          </button>
        </div>
      </div>
    </div>
  );
};
