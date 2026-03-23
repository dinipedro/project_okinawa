import { FC, useState } from 'react';
import { 
  ArrowLeft, CreditCard, Smartphone, QrCode, Users, Check, ChevronRight, 
  Wallet, Heart, Star, Send, User, DollarSign, Nfc, Sparkles, ExternalLink
} from 'lucide-react';

interface UnifiedPaymentScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

type PaymentTab = 'checkout' | 'split' | 'tip';
type SplitMode = 'full' | 'equal' | 'items' | 'fixed';
type PaymentMethod = 'apple' | 'google' | 'pix' | 'card' | 'tap' | 'wallet';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  orderedBy: string;
}

const orderItems: OrderItem[] = [
  { id: 'i1', name: 'Omakase Selection', price: 189.90, quantity: 1, orderedBy: 'Você' },
  { id: 'i2', name: 'Wagyu Tataki', price: 156.00, quantity: 2, orderedBy: 'Você' },
  { id: 'i3', name: 'Sake Premium', price: 89.00, quantity: 1, orderedBy: 'Maria' },
  { id: 'i4', name: 'Edamame', price: 28.00, quantity: 1, orderedBy: 'João' },
  { id: 'i5', name: 'Mochi Ice Cream', price: 39.00, quantity: 1, orderedBy: 'João' },
];

const paymentMethods = [
  { id: 'apple' as PaymentMethod, name: 'Apple Pay', icon: Smartphone, connected: true },
  { id: 'google' as PaymentMethod, name: 'Google Pay', icon: Smartphone, connected: true },
  { id: 'pix' as PaymentMethod, name: 'PIX', icon: QrCode, connected: true },
  { id: 'card' as PaymentMethod, name: 'Crédito', icon: CreditCard, last4: '4242' },
  { id: 'tap' as PaymentMethod, name: 'TAP to Pay', icon: Nfc, connected: true },
  { id: 'wallet' as PaymentMethod, name: 'Carteira', icon: Wallet, balance: 150.00 },
];

const guests = [
  { id: 'you', name: 'Você', avatar: '👤', paid: false },
  { id: 'maria', name: 'Maria', avatar: '👩', paid: false },
  { id: 'joao', name: 'João', avatar: '👨', paid: true, paidAmount: 67.00 },
];

const staffMembers = [
  { id: 's1', name: 'Carlos Silva', role: 'Garçom', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', rating: 4.9 },
  { id: 's2', name: 'Ana Santos', role: 'Chef', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', rating: 4.8 },
];

const UnifiedPaymentScreenV2: FC<UnifiedPaymentScreenV2Props> = ({ onNavigate, onBack }) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('checkout');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('apple');
  const [splitMode, setSplitMode] = useState<SplitMode>('full');
  const [selectedItems, setSelectedItems] = useState<string[]>(['i1', 'i2']);
  const [tipPercent, setTipPercent] = useState(10);
  const [tipRecipient, setTipRecipient] = useState<'team' | string>('team');
  const [fixedAmount, setFixedAmount] = useState(200);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalOrder = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const paidByOthers = guests.filter(g => g.paid).reduce((sum, g) => sum + (g.paidAmount || 0), 0);
  const remainingTotal = totalOrder - paidByOthers;

  const calculateMySubtotal = () => {
    switch (splitMode) {
      case 'full':
        return remainingTotal;
      case 'equal':
        return remainingTotal / guests.filter(g => !g.paid).length;
      case 'items':
        return selectedItems.reduce((sum, itemId) => {
          const item = orderItems.find(i => i.id === itemId);
          return sum + (item ? item.price * item.quantity : 0);
        }, 0);
      case 'fixed':
        return Math.min(fixedAmount, remainingTotal);
      default:
        return 0;
    }
  };

  const mySubtotal = calculateMySubtotal();
  const myTip = mySubtotal * (tipPercent / 100);
  const myTotal = mySubtotal + myTip;

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handlePayment = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onNavigate('digital-receipt');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30 animate-bounce">
            <Check className="w-12 h-12 text-success-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado!</h2>
          <p className="text-muted-foreground mb-4">
            Seu pagamento de <strong className="text-primary">R$ {myTotal.toFixed(2)}</strong> foi processado
          </p>
          {tipPercent > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Heart className="w-4 h-4 fill-primary" />
              <span className="text-sm font-medium">+{tipPercent}% gorjeta para a equipe</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Pagamento</h1>
            <p className="text-xs text-muted-foreground">
              Mesa 12 • Omakase Sushi • Total: R$ {totalOrder.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-2xl">
          {[
            { id: 'checkout', label: 'Pagar', icon: CreditCard },
            { id: 'split', label: 'Dividir', icon: Users },
            { id: 'tip', label: 'Gorjeta', icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PaymentTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Guest Status - Always Visible */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {guests.map((guest) => (
              <div 
                key={guest.id}
                className={`flex-shrink-0 p-2.5 rounded-2xl border-2 min-w-[80px] text-center ${
                  guest.paid 
                    ? 'border-success bg-success/10' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="text-xl mb-1">{guest.avatar}</div>
                <p className="text-xs font-medium text-foreground truncate">{guest.name.split(' ')[0]}</p>
                <p className={`text-[10px] ${guest.paid ? 'text-success' : 'text-muted-foreground'}`}>
                  {guest.paid ? `R$ ${guest.paidAmount?.toFixed(0)}` : 'Pendente'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TAB: Checkout */}
        {activeTab === 'checkout' && (
          <div className="space-y-4 animate-fade-in">
            {/* Split Mode Quick Select */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Como pagar?
                </h2>
                <button 
                  onClick={() => onNavigate('split-payment')}
                  className="text-xs text-primary font-medium flex items-center gap-1"
                >
                  Ver opções avançadas
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'full', label: 'Tudo', sublabel: `R$ ${remainingTotal.toFixed(0)}` },
                  { id: 'equal', label: 'Igual', sublabel: `R$ ${(remainingTotal / guests.filter(g => !g.paid).length).toFixed(0)}/p` },
                  { id: 'items', label: 'Itens', sublabel: 'Escolher' },
                  { id: 'fixed', label: 'Valor', sublabel: 'Definir' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSplitMode(mode.id as SplitMode)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      splitMode === mode.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${splitMode === mode.id ? 'text-primary' : 'text-foreground'}`}>
                      {mode.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{mode.sublabel}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Items Selection (for 'items' mode) */}
            {splitMode === 'items' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Selecione seus itens
                  </h2>
                  <button 
                    onClick={() => onNavigate('split-by-item')}
                    className="text-xs text-primary font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Tela completa
                  </button>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item) => {
                    const isSelected = selectedItems.includes(item.id);
                    const isPaid = item.orderedBy === 'João';
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => !isPaid && toggleItem(item.id)}
                        disabled={isPaid}
                        className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                          isPaid 
                            ? 'border-success/30 bg-success/10 opacity-60'
                            : isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isPaid 
                            ? 'border-success bg-success'
                            : isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground/30'
                        }`}>
                          {(isSelected || isPaid) && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.orderedBy}{isPaid && ' • Pago'}</p>
                        </div>
                        <span className="font-semibold text-sm text-foreground">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fixed Amount (for 'fixed' mode) */}
            {splitMode === 'fixed' && (
              <div className="animate-fade-in bg-card rounded-2xl p-4 border border-border">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Máximo: R$ {remainingTotal.toFixed(2)}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setFixedAmount(Math.max(50, fixedAmount - 50))}
                    className="w-12 h-12 rounded-full bg-muted text-xl font-bold text-muted-foreground"
                  >−</button>
                  <span className="text-3xl font-bold text-foreground">R$ {fixedAmount}</span>
                  <button
                    onClick={() => setFixedAmount(Math.min(remainingTotal, fixedAmount + 50))}
                    className="w-12 h-12 rounded-full bg-muted text-xl font-bold text-muted-foreground"
                  >+</button>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Forma de pagamento
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.slice(0, 6).map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPayment === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {method.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Tip Selection */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Gorjeta
              </h2>
              <div className="flex gap-2">
                {[0, 10, 15, 20].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setTipPercent(percent)}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      tipPercent === percent
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {percent === 0 ? 'Sem' : `${percent}%`}
                  </button>
                ))}
              </div>
              {tipPercent > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  + R$ {myTip.toFixed(2)} para a equipe
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB: Split Details */}
        {activeTab === 'split' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Divisão da Conta</span>
              </div>
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{guest.avatar}</span>
                      <span className="text-sm text-foreground">{guest.name}</span>
                    </div>
                    <span className={`text-sm font-semibold ${guest.paid ? 'text-success' : 'text-muted-foreground'}`}>
                      {guest.paid ? `✓ R$ ${guest.paidAmount?.toFixed(2)}` : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Itens do Pedido
              </h2>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x • {item.orderedBy}</p>
                    </div>
                    <span className="font-semibold text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Tip */}
        {activeTab === 'tip' && (
          <div className="space-y-4 animate-fade-in">
            {/* Tip Recipient */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Para quem?
              </h2>
              <button
                onClick={() => setTipRecipient('team')}
                className={`w-full p-4 rounded-2xl border-2 mb-3 transition-all ${
                  tipRecipient === 'team' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-foreground">Toda a Equipe</span>
                    <p className="text-xs text-muted-foreground">Dividido entre todos</p>
                  </div>
                  {tipRecipient === 'team' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
              
              <div className="space-y-2">
                {staffMembers.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => setTipRecipient(staff.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all ${
                      tipRecipient === staff.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1 text-left">
                        <span className="font-semibold text-sm text-foreground">{staff.name}</span>
                        <p className="text-xs text-muted-foreground">{staff.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          <span className="font-semibold text-foreground">{staff.rating}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tip Amount */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Valor da Gorjeta
              </h2>
              <div className="flex gap-2 mb-4">
                {[10, 15, 20, 25].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setTipPercent(percent)}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                      tipPercent === percent
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground'
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
              <div className="text-center py-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <span className="text-3xl font-bold text-primary">R$ {myTip.toFixed(2)}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {tipPercent}% de R$ {mySubtotal.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Loyalty Points Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-warning-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">+{Math.round(myTip * 2)} pontos de fidelidade</p>
                  <p className="text-xs text-muted-foreground">Gorjetas geram pontos bônus!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary & CTA */}
      <div className="bg-card border-t border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="text-sm text-foreground">R$ {mySubtotal.toFixed(2)}</p>
          </div>
          {tipPercent > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Gorjeta ({tipPercent}%)</p>
              <p className="text-sm text-foreground">R$ {myTip.toFixed(2)}</p>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary">R$ {myTotal.toFixed(2)}</p>
          </div>
        </div>
        <button 
          onClick={handlePayment}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          {activeTab === 'tip' ? (
            <>
              <Send className="w-5 h-5" />
              Enviar Gorjeta
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pagar R$ {myTotal.toFixed(2)}
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Pagamento seguro • Criptografia de ponta a ponta
        </p>
      </div>
    </div>
  );
};

export default UnifiedPaymentScreenV2;
