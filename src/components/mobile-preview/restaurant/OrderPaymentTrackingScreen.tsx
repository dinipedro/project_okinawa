import { 
  ChevronLeft, Users, DollarSign, Clock, Check, AlertCircle,
  CreditCard, QrCode, Percent, Receipt, ChevronRight, Eye,
  CheckCircle2, Crown, Send
} from "lucide-react";

const order = {
  id: "ord-789",
  table: "Mesa 12",
  customer: "Carlos Mendes",
  waiter: "João Silva",
  status: "active",
  created_at: "19:35",
  subtotal: 348.60,
  service_charge: 34.86,
  total: 383.46,
  is_shared: true,
  split_mode: "individual",
};

const orderGuests = [
  {
    id: "og1",
    name: "Carlos Mendes",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
    is_host: true,
    status: "payment_completed",
    items_count: 3,
    amount_due: 127.82,
    amount_paid: 127.82,
    payment_method: "PIX",
    paid_at: "20:45",
  },
  {
    id: "og2",
    name: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    is_host: false,
    status: "payment_completed",
    items_count: 2,
    amount_due: 98.32,
    amount_paid: 98.32,
    payment_method: "Cartão",
    paid_at: "20:48",
  },
  {
    id: "og3",
    name: "João Santos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    is_host: false,
    status: "payment_pending",
    items_count: 2,
    amount_due: 87.32,
    amount_paid: 50.00,
    payment_method: null,
    paid_at: null,
  },
  {
    id: "og4",
    name: "Ana Costa",
    avatar: null,
    is_host: false,
    status: "joined",
    items_count: 2,
    amount_due: 70.00,
    amount_paid: 0,
    payment_method: null,
    paid_at: null,
  },
];

const paymentHistory = [
  { id: "p1", guest: "Carlos Mendes", amount: 127.82, method: "PIX", time: "20:45" },
  { id: "p2", guest: "Maria Silva", amount: 98.32, method: "Cartão Crédito", time: "20:48" },
  { id: "p3", guest: "João Santos", amount: 50.00, method: "Cartão Débito", time: "20:52" },
];

export const OrderPaymentTrackingScreen = () => {
  const totalPaid = orderGuests.reduce((sum, g) => sum + g.amount_paid, 0);
  const remaining = order.total - totalPaid;
  const progressPercent = (totalPaid / order.total) * 100;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold">Pagamento Split</h1>
            <p className="text-xs text-muted-foreground">{order.table} • Pedido #{order.id.slice(-4).toUpperCase()}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
            Em Andamento
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-32">
        {/* Payment Progress */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso do Pagamento</span>
            <span className="text-sm font-mono">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-4 rounded-full bg-muted overflow-hidden mb-3">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-success">R$ {totalPaid.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Recebido</p>
            </div>
            <div>
              <p className="text-lg font-bold text-warning">R$ {remaining.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Faltando</p>
            </div>
            <div>
              <p className="text-lg font-bold">R$ {order.total.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {/* Split Mode Info */}
        <div className="p-3 rounded-xl bg-muted/50 flex items-center gap-3 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <span className="text-sm font-medium">Modo: Individual</span>
            <p className="text-xs text-muted-foreground">Cada pessoa paga seus próprios itens</p>
          </div>
        </div>

        {/* Guests Payment Status */}
        <h2 className="font-semibold text-sm text-muted-foreground mb-3">
          Status dos Participantes ({orderGuests.filter(g => g.status === 'payment_completed').length}/{orderGuests.length} pagos)
        </h2>
        
        <div className="space-y-3 mb-6">
          {orderGuests.map((guest) => (
            <div
              key={guest.id}
              className={`p-4 rounded-2xl border ${
                guest.status === 'payment_completed' 
                  ? 'bg-success/5 border-success/30' 
                  : guest.amount_paid > 0
                  ? 'bg-warning/5 border-warning/30'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  {guest.avatar ? (
                    <img
                      src={guest.avatar}
                      alt={guest.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center font-semibold">
                      {guest.name[0]}
                    </div>
                  )}
                  {guest.status === 'payment_completed' && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-success">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{guest.name}</span>
                    {guest.is_host && (
                      <Crown className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{guest.items_count} itens</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">R$ {guest.amount_due.toFixed(2)}</p>
                  {guest.status === 'payment_completed' ? (
                    <p className="text-xs text-success flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {guest.payment_method}
                    </p>
                  ) : guest.amount_paid > 0 ? (
                    <p className="text-xs text-warning">
                      Pago: R$ {guest.amount_paid.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Pendente</p>
                  )}
                </div>
              </div>
              
              {/* Action buttons for pending payments */}
              {guest.status !== 'payment_completed' && (
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 rounded-lg bg-muted text-xs font-medium flex items-center justify-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    Ver Itens
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    Registrar Pagamento
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment History */}
        <div>
          <h2 className="font-semibold text-sm text-muted-foreground mb-3">Histórico de Pagamentos</h2>
          <div className="space-y-2">
            {paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="p-3 rounded-xl bg-card border border-border flex items-center gap-3"
              >
                <div className="p-2 rounded-full bg-success/10">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{payment.guest}</p>
                  <p className="text-xs text-muted-foreground">{payment.method} • {payment.time}</p>
                </div>
                <span className="font-semibold text-sm">R$ {payment.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="p-3 rounded-xl bg-muted/50 mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Faltando receber:</span>
          <span className="font-bold text-lg text-warning">R$ {remaining.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-3.5 rounded-2xl bg-muted font-semibold text-sm">
            Lembrar Pendentes
          </button>
          <button className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
            <Send className="h-4 w-4" />
            Fechar Conta
          </button>
        </div>
      </div>
    </div>
  );
};
