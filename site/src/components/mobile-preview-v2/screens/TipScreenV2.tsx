import { FC } from 'react';
import { 
  ChevronLeft, Heart, Star, Users, Plus, Minus,
  CreditCard, QrCode, Wallet, Send, Sparkles, Check
} from "lucide-react";

interface TipScreenV2Props {
  onNavigate: (screen: string) => void;
}

const staffMembers = [
  {
    id: "s1",
    name: "Carlos Silva",
    role: "Garçom",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    rating: 4.9,
    reviews: 127,
  },
  {
    id: "s2",
    name: "Ana Santos",
    role: "Chef",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
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

const TipScreenV2: FC<TipScreenV2Props> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-background">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('checkout-v2')}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dar Gorjeta</h1>
            <p className="text-xs text-muted-foreground">Agradeça quem fez sua experiência especial</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-48">
        {/* Select Staff */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-foreground mb-3">Para quem?</h2>
          
          {/* Team Option */}
          <button className="w-full p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold text-foreground">Toda a Equipe</span>
                <p className="text-xs text-muted-foreground">Dividido entre todos os funcionários</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          </button>
          
          {/* Individual Staff */}
          <div className="space-y-2">
            {staffMembers.map((staff) => (
              <button
                key={staff.id}
                className="w-full p-4 rounded-2xl bg-card border-2 border-border hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-sm text-foreground">{staff.name}</span>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">{staff.rating}</span>
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
          <h2 className="font-semibold text-sm text-foreground mb-3">Valor da Gorjeta</h2>
          
          {/* Presets */}
          <div className="flex gap-2 mb-4">
            {tipPresets.map((preset) => (
              <button
                key={preset.value}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                  preset.value === 20
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-600'
                    : 'bg-card border-border text-foreground hover:border-orange-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {/* Custom Amount */}
          <div className="p-4 rounded-2xl bg-muted border border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Ou digite um valor</p>
            <div className="flex items-center justify-center gap-4">
              <button className="p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors">
                <Minus className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold text-foreground">R$ 20,00</span>
              </div>
              <button className="p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-foreground mb-3">Mensagem (opcional)</h2>
          <textarea
            placeholder="Obrigado pelo excelente atendimento!"
            className="w-full p-4 rounded-2xl bg-card border border-border resize-none h-24 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="font-semibold text-sm text-foreground mb-3">Forma de Pagamento</h2>
          <div className="flex gap-2">
            <button className="flex-1 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-500 flex flex-col items-center gap-1">
              <QrCode className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-medium text-teal-600">PIX</span>
            </button>
            <button className="flex-1 p-3 rounded-xl bg-card border-2 border-border flex flex-col items-center gap-1">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Cartão</span>
            </button>
            <button className="flex-1 p-3 rounded-xl bg-card border-2 border-border flex flex-col items-center gap-1">
              <Wallet className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Carteira</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800/30 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">+20 pontos de fidelidade</p>
              <p className="text-xs text-muted-foreground">Gorjetas geram pontos bônus!</p>
            </div>
          </div>
        </div>
        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
          <Send className="w-5 h-5" />
          Enviar R$ 20,00
        </button>
      </div>
    </div>
  );
};

export default TipScreenV2;
