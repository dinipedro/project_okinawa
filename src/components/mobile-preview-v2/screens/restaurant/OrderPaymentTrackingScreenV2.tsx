import { FC, useState } from "react";
import { 
  CreditCard, Users, Check, Clock, DollarSign, ArrowLeft, 
  User, Smartphone, QrCode, Nfc, AlertCircle, ChevronRight,
  Eye, RefreshCw, CheckCircle2, XCircle
} from "lucide-react";

interface OrderPaymentTrackingScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

type SplitMode = 'individual' | 'equal' | 'selective' | 'fixed';

interface GuestPayment {
  id: string;
  name: string;
  avatar: string;
  isPrimary: boolean;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  amount_due: number;
  amount_paid: number;
  payment_method?: 'pix' | 'card' | 'apple' | 'google' | 'tap' | 'cash';
  items?: string[];
  paid_at?: string;
}

interface TableOrder {
  id: string;
  table_number: number;
  total: number;
  split_mode: SplitMode;
  guests: GuestPayment[];
  created_at: string;
  service_charge: number;
  tip_total: number;
}

const mockOrder: TableOrder = {
  id: 'ORD-2847',
  table_number: 12,
  total: 485.70,
  split_mode: 'selective',
  service_charge: 48.57,
  tip_total: 72.86,
  created_at: '2025-02-04T19:30:00',
  guests: [
    { 
      id: 'g1', 
      name: 'Carlos (Host)', 
      avatar: '👨‍💼', 
      isPrimary: true,
      status: 'paid', 
      amount_due: 189.90, 
      amount_paid: 189.90,
      payment_method: 'card',
      items: ['Omakase Selection', 'Sake Premium'],
      paid_at: '20:45'
    },
    { 
      id: 'g2', 
      name: 'Maria Silva', 
      avatar: '👩', 
      isPrimary: false,
      status: 'paid', 
      amount_due: 120.50, 
      amount_paid: 120.50,
      payment_method: 'pix',
      items: ['Wagyu Tataki', 'Edamame'],
      paid_at: '20:42'
    },
    { 
      id: 'g3', 
      name: 'João Pedro', 
      avatar: '👨', 
      isPrimary: false,
      status: 'processing', 
      amount_due: 95.30, 
      amount_paid: 0,
      items: ['Ramen Tonkotsu', 'Gyoza']
    },
    { 
      id: 'g4', 
      name: 'Ana Costa', 
      avatar: '👩‍🦰', 
      isPrimary: false,
      status: 'pending', 
      amount_due: 80.00, 
      amount_paid: 0,
      items: ['Sashimi Mix']
    },
  ]
};

const splitModeLabels: Record<SplitMode, { label: string; description: string }> = {
  individual: { label: 'Unitário', description: 'Anfitrião paga tudo' },
  equal: { label: 'Dividido Igual', description: 'Valor dividido entre todos' },
  selective: { label: 'Por Item', description: 'Cada um paga seus itens' },
  fixed: { label: 'Valor Fixo', description: 'Valores customizados' },
};

const paymentMethodIcons: Record<string, any> = {
  pix: QrCode,
  card: CreditCard,
  apple: Smartphone,
  google: Smartphone,
  tap: Nfc,
  cash: DollarSign,
};

const OrderPaymentTrackingScreenV2: FC<OrderPaymentTrackingScreenV2Props> = ({ onNavigate, onBack }) => {
  const [order] = useState<TableOrder>(mockOrder);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  const totalPaid = order.guests.reduce((sum, g) => sum + g.amount_paid, 0);
  const remainingAmount = order.total + order.service_charge + order.tip_total - totalPaid;
  const paidPercentage = (totalPaid / (order.total + order.service_charge + order.tip_total)) * 100;

  const getStatusColor = (status: GuestPayment['status']) => {
    switch (status) {
      case 'paid': return 'bg-success text-success-foreground';
      case 'processing': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
    }
  };

  const getStatusLabel = (status: GuestPayment['status']) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'processing': return 'Processando';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
    }
  };

  const getStatusIcon = (status: GuestPayment['status']) => {
    switch (status) {
      case 'paid': return CheckCircle2;
      case 'processing': return RefreshCw;
      case 'pending': return Clock;
      case 'failed': return XCircle;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Split Payment</h1>
            <p className="text-xs text-muted-foreground">Mesa {order.table_number} • Pedido #{order.id}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            paidPercentage === 100 
              ? 'bg-success/10 text-success' 
              : 'bg-warning/10 text-warning'
          }`}>
            {paidPercentage === 100 ? 'Quitado' : `${paidPercentage.toFixed(0)}% Pago`}
          </div>
        </div>

        {/* Split Mode Indicator */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{splitModeLabels[order.split_mode].label}</p>
            <p className="text-xs text-muted-foreground">{splitModeLabels[order.split_mode].description}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Total da Mesa</p>
            <p className="text-xl font-bold text-foreground">R$ {(order.total + order.service_charge + order.tip_total).toFixed(2)}</p>
            <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
              <span>Pedido: R$ {order.total.toFixed(2)}</span>
              <span>•</span>
              <span>Taxa: R$ {order.service_charge.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
            <p className="text-xs text-muted-foreground mb-1">Total Pago</p>
            <p className="text-xl font-bold text-success">R$ {totalPaid.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground mt-2">
              Gorjetas: R$ {order.tip_total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Progresso do Pagamento</span>
            <span className="font-semibold text-foreground">{order.guests.filter(g => g.status === 'paid').length}/{order.guests.length} convidados</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
          {remainingAmount > 0 && (
            <p className="text-xs text-warning mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Falta receber: R$ {remainingAmount.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Guest Payments List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Pagamentos por Convidado
        </h2>
        
        <div className="space-y-3">
          {order.guests.map((guest) => {
            const StatusIcon = getStatusIcon(guest.status);
            const PaymentIcon = guest.payment_method ? paymentMethodIcons[guest.payment_method] : null;
            const isExpanded = selectedGuest === guest.id;
            
            return (
              <div 
                key={guest.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  guest.status === 'paid' 
                    ? 'bg-success/5 border-success/20' 
                    : guest.status === 'processing'
                      ? 'bg-warning/5 border-warning/20'
                      : guest.status === 'failed'
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'bg-card border-border'
                }`}
              >
                <button 
                  onClick={() => setSelectedGuest(isExpanded ? null : guest.id)}
                  className="w-full p-4 flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    guest.status === 'paid' ? 'bg-success/20' : 'bg-muted'
                  }`}>
                    {guest.avatar}
                    {guest.isPrimary && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{guest.name}</p>
                      {guest.isPrimary && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          Anfitrião
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {guest.items?.join(', ').substring(0, 30)}...
                    </p>
                  </div>

                  {/* Amount & Status */}
                  <div className="text-right">
                    <p className="font-bold text-foreground">R$ {guest.amount_due.toFixed(2)}</p>
                    <div className={`flex items-center gap-1 justify-end text-xs px-2 py-0.5 rounded-full ${getStatusColor(guest.status)}`}>
                      <StatusIcon className={`w-3 h-3 ${guest.status === 'processing' ? 'animate-spin' : ''}`} />
                      {getStatusLabel(guest.status)}
                    </div>
                  </div>

                  <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/50 animate-fade-in">
                    <div className="space-y-3">
                      {/* Items */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Itens</p>
                        <div className="flex flex-wrap gap-1">
                          {guest.items?.map((item, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Payment Details */}
                      {guest.status === 'paid' && guest.payment_method && PaymentIcon && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-success/10">
                          <div className="flex items-center gap-2">
                            <PaymentIcon className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium text-foreground">
                              {guest.payment_method.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Pago às {guest.paid_at}
                          </span>
                        </div>
                      )}

                      {/* Actions for Pending/Failed */}
                      {(guest.status === 'pending' || guest.status === 'failed') && (
                        <div className="flex gap-2">
                          <button className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Cobrar Agora
                          </button>
                          <button className="py-2.5 px-4 rounded-xl bg-muted text-foreground text-sm font-medium">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Processing indicator */}
                      {guest.status === 'processing' && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10">
                          <RefreshCw className="w-4 h-4 text-warning animate-spin" />
                          <span className="text-sm text-warning font-medium">Aguardando confirmação do pagamento...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('orders')}
            className="flex-1 py-3 rounded-xl bg-muted text-foreground font-semibold text-sm"
          >
            Ver Pedido Completo
          </button>
          {remainingAmount > 0 ? (
            <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
              <DollarSign className="w-4 h-4" />
              Cobrar Pendentes
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex-1 py-3 rounded-xl bg-success text-success-foreground font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Finalizar Mesa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentTrackingScreenV2;
