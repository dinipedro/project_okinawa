import { 
  ChevronLeft, Heart, Star, Users, Plus, Minus,
  CreditCard, QrCode, Wallet, Send, Sparkles, Check
} from "lucide-react";

const staffMembers = [
  {
    id: "s1",
    name: "Carlos Silva",
    role: "Garçom",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 4.9,
    reviews: 127,
  },
  {
    id: "s2",
    name: "Ana Santos",
    role: "Chef",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 4.8,
    reviews: 89,
  },
];

const tipPresets = [
  { value: 10, label: "R$ 10" },
  { value: 20, label: "R$ 20" },
  { value: 30, label: "R$ 30" },
  { value: 50, label: "R$ 50" },
];

const recentTips = [
  {
    id: "t1",
    staff: "Carlos Silva",
    amount: 25.00,
    date: "Há 2 dias",
    restaurant: "Sakura Ramen",
  },
  {
    id: "t2",
    staff: "Equipe",
    amount: 30.00,
    date: "Há 5 dias",
    restaurant: "La Trattoria",
  },
];

export const TipScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold">Dar Gorjeta</h1>
            <p className="text-xs text-muted-foreground">Agradeça quem fez sua experiência especial</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-44">
        {/* Select Staff */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Para quem?</h2>
          
          {/* Team Option */}
          <button className="w-full p-4 rounded-2xl bg-primary/5 border-2 border-primary mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold">Toda a Equipe</span>
                <p className="text-xs text-muted-foreground">Dividido entre todos os funcionários</p>
              </div>
              <div className="p-1 rounded-full bg-primary">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </button>
          
          {/* Individual Staff */}
          <div className="space-y-2">
            {staffMembers.map((staff) => (
              <button
                key={staff.id}
                className="w-full p-4 rounded-2xl bg-card border-2 border-border hover:border-muted-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-sm">{staff.name}</span>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold">{staff.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{staff.reviews} avaliações</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tip Amount */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Valor da Gorjeta</h2>
          
          {/* Presets */}
          <div className="flex gap-2 mb-4">
            {tipPresets.map((preset) => (
              <button
                key={preset.value}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                  preset.value === 20
                    ? 'bg-secondary/10 border-secondary text-secondary'
                    : 'bg-card border-border hover:border-muted-foreground/30'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {/* Custom Amount */}
          <div className="p-4 rounded-2xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Ou digite um valor</p>
            <div className="flex items-center justify-center gap-4">
              <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <Minus className="h-5 w-5" />
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold">R$ 20,00</span>
              </div>
              <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Mensagem (opcional)</h2>
          <textarea
            placeholder="Obrigado pelo excelente atendimento!"
            className="w-full p-4 rounded-2xl bg-card border border-border resize-none h-24 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Forma de Pagamento</h2>
          <div className="flex gap-2">
            <button className="flex-1 p-3 rounded-xl bg-secondary/10 border-2 border-secondary flex flex-col items-center gap-1">
              <QrCode className="h-5 w-5 text-secondary" />
              <span className="text-xs font-medium">PIX</span>
            </button>
            <button className="flex-1 p-3 rounded-xl bg-card border-2 border-border flex flex-col items-center gap-1">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium">Cartão</span>
            </button>
            <button className="flex-1 p-3 rounded-xl bg-card border-2 border-border flex flex-col items-center gap-1">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium">Carteira</span>
            </button>
          </div>
        </div>

        {/* Recent Tips */}
        <div>
          <h2 className="font-semibold text-sm mb-3">Gorjetas Recentes</h2>
          <div className="space-y-2">
            {recentTips.map((tip) => (
              <div
                key={tip.id}
                className="p-3 rounded-xl bg-card border border-border flex items-center gap-3"
              >
                <div className="p-2 rounded-full bg-primary/10">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{tip.staff}</p>
                  <p className="text-xs text-muted-foreground">{tip.restaurant} • {tip.date}</p>
                </div>
                <span className="font-semibold text-sm">R$ {tip.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">+20 pontos de fidelidade</p>
              <p className="text-xs text-muted-foreground">Gorjetas geram pontos bônus!</p>
            </div>
          </div>
        </div>
        <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
          <Send className="h-5 w-5" />
          Enviar R$ 20,00
        </button>
      </div>
    </div>
  );
};
