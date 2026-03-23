import { 
  ChevronLeft, Users, Plus, Share2, Check, Clock, 
  CreditCard, Percent, Receipt, UserPlus, Crown,
  ChevronRight, AlertCircle, CheckCircle2, Minus
} from "lucide-react";

const orderData = {
  id: "ord-789",
  restaurant: "Sakura Ramen",
  table: "Mesa 12",
  status: "active",
  subtotal: 245.80,
  service_charge: 24.58,
  total: 270.38,
  is_shared: true,
  split_mode: null, // 'individual', 'split_equal', 'split_selective'
};

const orderGuests = [
  {
    id: "og1",
    name: "Você",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
    is_host: true,
    status: "joined",
    items: [
      { id: "i1", name: "Ramen Tonkotsu", price: 58.90, quantity: 1 },
      { id: "i2", name: "Gyoza (6 un)", price: 32.00, quantity: 1 },
    ],
    amount_due: 100.09,
    amount_paid: 0,
    payment_completed: false,
  },
  {
    id: "og2",
    name: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    is_host: false,
    status: "joined",
    items: [
      { id: "i3", name: "Ramen Shoyu", price: 52.90, quantity: 1 },
      { id: "i4", name: "Edamame", price: 18.00, quantity: 1 },
    ],
    amount_due: 78.09,
    amount_paid: 78.09,
    payment_completed: true,
  },
  {
    id: "og3",
    name: "João Santos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    is_host: false,
    status: "payment_pending",
    items: [
      { id: "i5", name: "Ramen Miso", price: 54.90, quantity: 1 },
      { id: "i6", name: "Karaage", price: 29.00, quantity: 1 },
    ],
    amount_due: 92.20,
    amount_paid: 50.00,
    payment_completed: false,
  },
];

const splitModes = [
  {
    id: "individual",
    name: "Individual",
    description: "Cada um paga seus itens",
    icon: Receipt,
  },
  {
    id: "split_equal",
    name: "Dividir Igual",
    description: "Valor dividido igualmente",
    icon: Percent,
  },
  {
    id: "split_selective",
    name: "Selecionar Itens",
    description: "Escolha quais itens pagar",
    icon: Check,
  },
];

export const SharedOrderScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold">Pedido Compartilhado</h1>
            <p className="text-xs text-muted-foreground">{orderData.restaurant} • {orderData.table}</p>
          </div>
          <button className="p-2.5 rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </button>
        </div>
        
        {/* Split Mode Selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {splitModes.map((mode) => (
            <button
              key={mode.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border whitespace-nowrap ${
                orderData.split_mode === mode.id
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-border'
              }`}
            >
              <mode.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-44">
        {/* Payment Progress */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Progresso do Pagamento</h3>
            <span className="text-sm font-mono">
              R$ {(orderGuests.reduce((sum, g) => sum + g.amount_paid, 0)).toFixed(2)} / R$ {orderData.total.toFixed(2)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ 
                width: `${(orderGuests.reduce((sum, g) => sum + g.amount_paid, 0) / orderData.total) * 100}%` 
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{orderGuests.filter(g => g.payment_completed).length} de {orderGuests.length} pagaram</span>
            <span>Falta: R$ {(orderData.total - orderGuests.reduce((sum, g) => sum + g.amount_paid, 0)).toFixed(2)}</span>
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
                  ? 'bg-success/5 border-success/30' 
                  : guest.amount_paid > 0
                  ? 'bg-warning/5 border-warning/30'
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
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-success">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{guest.name}</span>
                      {guest.is_host && (
                        <span className="flex items-center gap-0.5 text-xs text-primary">
                          <Crown className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {guest.payment_completed ? (
                        <span className="text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Pago
                        </span>
                      ) : guest.amount_paid > 0 ? (
                        <span className="text-warning flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Parcial (R$ {guest.amount_paid.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">R$ {guest.amount_due.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{guest.items.length} itens</p>
                  </div>
                </div>
              </div>
              
              {/* Guest Items */}
              <div className="p-3 space-y-2">
                {guest.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">R$ {item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {/* Guest Actions */}
              {!guest.payment_completed && guest.is_host && (
                <div className="p-3 pt-0">
                  <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                    Pagar R$ {guest.amount_due.toFixed(2)}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Guest */}
        <button className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus className="h-5 w-5" />
          <span className="font-medium">Adicionar Participante</span>
        </button>

        {/* Order Summary */}
        <div className="mt-6 p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold mb-3">Resumo do Pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {orderData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de serviço (10%)</span>
              <span>R$ {orderData.service_charge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-semibold text-base">
              <span>Total</span>
              <span>R$ {orderData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="p-4 rounded-2xl bg-card border border-border mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Sua parte:</span>
            <span className="font-bold text-lg">R$ 100,09</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" />
            <span>2 itens + taxa de serviço</span>
          </div>
        </div>
        <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagar Minha Parte
        </button>
      </div>
    </div>
  );
};
