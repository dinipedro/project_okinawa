import { HelpCircle, MessageSquare, Phone, Mail, FileText, ChevronRight, Search, Sparkles, BookOpen, AlertCircle, CreditCard, Calendar } from "lucide-react";
import { useState } from "react";

export const SupportScreenV2 = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "orders",
      title: "Pedidos",
      icon: FileText,
      color: "from-orange-400 to-amber-500",
      questions: 8,
    },
    {
      id: "payments",
      title: "Pagamentos",
      icon: CreditCard,
      color: "from-emerald-400 to-teal-500",
      questions: 6,
    },
    {
      id: "reservations",
      title: "Reservas",
      icon: Calendar,
      color: "from-blue-400 to-indigo-500",
      questions: 5,
    },
    {
      id: "account",
      title: "Minha Conta",
      icon: AlertCircle,
      color: "from-purple-400 to-violet-500",
      questions: 7,
    },
  ];

  const faqs = [
    { id: 1, question: "Como faço para cancelar uma reserva?", category: "reservations" },
    { id: 2, question: "Como dividir a conta com amigos?", category: "payments" },
    { id: 3, question: "Como usar meus pontos de fidelidade?", category: "account" },
    { id: 4, question: "Como chamar o garçom pelo app?", category: "orders" },
  ];

  const contactOptions = [
    {
      id: "chat",
      title: "Chat ao vivo",
      description: "Resposta em até 5 min",
      icon: MessageSquare,
      color: "from-orange-400 to-amber-500",
      available: true,
    },
    {
      id: "phone",
      title: "Telefone",
      description: "(11) 3456-7890",
      icon: Phone,
      color: "from-emerald-400 to-teal-500",
      available: true,
    },
    {
      id: "email",
      title: "E-mail",
      description: "suporte@okinawa.app",
      icon: Mail,
      color: "from-blue-400 to-indigo-500",
      available: true,
    },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Central de Ajuda</h1>
            <p className="text-xs text-muted-foreground">Como podemos ajudar?</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Buscar dúvidas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>

      <div className="px-4 space-y-6 pb-6">
        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
              <BookOpen className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">Categorias</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border text-left"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-2`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground">{cat.questions} artigos</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular FAQs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">Perguntas Frequentes</span>
          </div>

          <div className="space-y-2">
            {faqs.map((faq) => (
              <button
                key={faq.id}
                className="w-full p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border flex items-center justify-between"
              >
                <span className="text-sm text-foreground text-left">{faq.question}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Contact Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">Fale Conosco</span>
          </div>

          <div className="space-y-3">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  className="w-full p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {option.available && (
                    <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                      Online
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Assistant Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Assistente IA</h3>
              <p className="text-xs text-white/80">Respostas instantâneas 24/7</p>
            </div>
          </div>
          <button className="w-full py-3 rounded-xl bg-white/20 backdrop-blur-sm font-medium text-sm">
            Iniciar conversa
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportScreenV2;
