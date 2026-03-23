import { FC } from 'react';
import { 
  ChevronLeft, Users, Plus, Check, Clock, 
  CreditCard, Percent, Receipt, UserPlus, Crown,
  AlertCircle, CheckCircle2
} from "lucide-react";

interface SharedOrderScreenV2Props {
  onNavigate: (screen: string) => void;
}

const orderData = {
  id: "ord-789",
  restaurant: "Omakase Sushi",
  table: "Mesa 12",
  total: 270.38,
};

const orderGuests = [
  {
    id: "og1",
    name: "Você",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50",
    is_host: true,
    items: [
      { id: "i1", name: "Ramen Tonkotsu", price: 58.90 },
      { id: "i2", name: "Gyoza (6 un)", price: 32.00 },
    ],
    amount_due: 100.09,
    amount_paid: 0,
    payment_completed: false,
  },
  {
    id: "og2",
    name: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50",
    is_host: false,
    items: [
      { id: "i3", name: "Ramen Shoyu", price: 52.90 },
      { id: "i4", name: "Edamame", price: 18.00 },
    ],
    amount_due: 78.09,
    amount_paid: 78.09,
    payment_completed: true,
  },
  {
    id: "og3",
    name: "João Santos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50",
    is_host: false,
    items: [
      { id: "i5", name: "Ramen Miso", price: 54.90 },
      { id: "i6", name: "Karaage", price: 29.00 },
    ],
    amount_due: 92.20,
    amount_paid: 50.00,
    payment_completed: false,
  },
];

const splitModes = [
  { id: "individual", name: "Individual", icon: Receipt },
  { id: "split_equal", name: "Dividir Igual", icon: Percent },
  { id: "split_selective", name: "Selecionar", icon: Check },
];

const SharedOrderScreenV2: FC<SharedOrderScreenV2Props> = ({ onNavigate }) => {
  const totalPaid = orderGuests.reduce((sum, g) => sum + g.amount_paid, 0);
  const totalRemaining = orderData.total - totalPaid;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-background">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button 
            onClick={() => onNavigate('cart-v2')}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Pedido Compartilhado</h1>
            <p className="text-xs text-muted-foreground">{orderData.restaurant} • {orderData.table}</p>
          </div>
          <button className="p-2.5 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Split Mode Selector */}
        <div className="flex gap-2">
          {splitModes.map((mode, i) => (
            <button
              key={mode.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border whitespace-nowrap ${
                i === 0
                  ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-600'
                  : 'bg-card border-border text-muted-foreground'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-48">
        {/* Payment Progress */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800/30 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Progresso do Pagamento</h3>
            <span className="text-sm font-mono text-muted-foreground">
              R$ {totalPaid.toFixed(2)} / R$ {orderData.total.toFixed(2)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-card overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
              style={{ width: `${(totalPaid / orderData.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{orderGuests.filter(g => g.payment_completed).length} de {orderGuests.length} pagaram</span>
            <span>Falta: R$ {totalRemaining.toFixed(2)}</span>
          </div>
        </div>

        {/* Guests & Their Items */}
        <h2 className="font-semibold text-sm text-muted-foreground mb-3">
          Participantes ({orderGuests.length})
        </h2>
        
        <div className="space-y-3">
          {orderGuests.map((guest) => (
            <div
              key={guest.id}
              className={`rounded-2xl border overflow-hidden ${
                guest.payment_completed 
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30' 
                  : guest.amount_paid > 0
                  ? 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30'
                  : 'bg-card border-border'
              }`}
            >
              {/* Guest Header */}
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={guest.avatar}
                      alt={guest.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {guest.payment_completed && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">{guest.name}</span>
                      {guest.is_host && (
                        <Crown className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {guest.payment_completed ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Pago
                        </span>
                      ) : guest.amount_paid > 0 ? (
                        <span className="text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Parcial (R$ {guest.amount_paid.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-foreground">R$ {guest.amount_due.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{guest.items.length} itens</p>
                  </div>
                </div>
              </div>
              
              {/* Guest Items */}
              <div className="p-3 space-y-2">
                {guest.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium text-foreground">R$ {item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {/* Guest Actions */}
              {!guest.payment_completed && guest.is_host && (
                <div className="p-3 pt-0">
                  <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold text-sm shadow-lg">
                    Pagar R$ {guest.amount_due.toFixed(2)}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Guest */}
        <button className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-orange-500 hover:text-orange-500 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Adicionar Participante</span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Sua parte:</span>
            <span className="font-bold text-lg text-foreground">R$ 100,09</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Receipt className="w-3.5 h-3.5" />
            <span>2 itens + taxa de serviço</span>
          </div>
        </div>
        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
          <CreditCard className="w-5 h-5" />
          Pagar Minha Parte
        </button>
      </div>
    </div>
  );
};

export default SharedOrderScreenV2;
