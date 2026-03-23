import { FC, useState } from 'react';
import { ArrowLeft, User, Users, Check, DollarSign, QrCode, CreditCard, Smartphone, Wallet, Nfc, CheckCircle } from 'lucide-react';

interface SplitPaymentScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const orderItems = [
  { id: 'i1', name: 'Ramen Tonkotsu', price: 58.90, orderedBy: 'Você' },
  { id: 'i2', name: 'Gyoza (6 un)', price: 32.00, orderedBy: 'Você' },
  { id: 'i3', name: 'Ramen Shoyu', price: 52.90, orderedBy: 'Maria' },
  { id: 'i4', name: 'Edamame', price: 18.00, orderedBy: 'Maria' },
  { id: 'i5', name: 'Ramen Miso', price: 54.90, orderedBy: 'João' },
  { id: 'i6', name: 'Karaage', price: 29.00, orderedBy: 'João' },
];

const guests = [
  { id: 'you', name: 'Você (Principal)', paid: false },
  { id: 'maria', name: 'Maria Silva', paid: false },
  { id: 'joao', name: 'João Pedro', paid: true },
];

type SplitMode = 'individual' | 'equal' | 'selective' | 'fixed';
type PaymentMethod = 'pix' | 'credit' | 'apple' | 'google' | 'tap' | 'wallet';

const splitModes = [
  { id: 'individual' as SplitMode, name: 'Unitário', description: 'Principal paga tudo', icon: User },
  { id: 'equal' as SplitMode, name: 'Dividir Igual', description: 'Valor dividido', icon: Users },
  { id: 'selective' as SplitMode, name: 'Por Item', description: 'Escolha itens', icon: Check },
  { id: 'fixed' as SplitMode, name: 'Valor Fixo', description: 'Defina valor', icon: DollarSign },
];

const paymentMethods = [
  { id: 'pix' as PaymentMethod, name: 'PIX', icon: QrCode, popular: true },
  { id: 'credit' as PaymentMethod, name: 'Crédito', icon: CreditCard },
  { id: 'apple' as PaymentMethod, name: 'Apple Pay', icon: Smartphone },
  { id: 'google' as PaymentMethod, name: 'Google Pay', icon: Smartphone },
  { id: 'tap' as PaymentMethod, name: 'TAP to Pay', icon: Nfc },
  { id: 'wallet' as PaymentMethod, name: 'Carteira', icon: Wallet },
];

const SplitPaymentScreenV2: FC<SplitPaymentScreenV2Props> = ({ onNavigate, onBack }) => {
  const [splitMode, setSplitMode] = useState<SplitMode>('selective');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix');
  const [selectedItems, setSelectedItems] = useState<string[]>(['i1', 'i2']);
  const [fixedAmount, setFixedAmount] = useState(100);
  const [tipPercent, setTipPercent] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);

  const totalOrder = orderItems.reduce((sum, item) => sum + item.price, 0);
  const paidByOthers = 83.90; // João's items
  const remainingTotal = totalOrder - paidByOthers;

  const calculateMyTotal = () => {
    switch (splitMode) {
      case 'individual':
        return remainingTotal;
      case 'equal':
        return remainingTotal / guests.filter(g => !g.paid).length;
      case 'selective':
        return selectedItems.reduce((sum, itemId) => {
          const item = orderItems.find(i => i.id === itemId);
          return sum + (item ? item.price : 0);
        }, 0);
      case 'fixed':
        return fixedAmount;
      default:
        return 0;
    }
  };

  const mySubtotal = calculateMyTotal();
  const myTip = mySubtotal * tipPercent / 100;
  const myTotal = mySubtotal + myTip;

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-success-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado!</h2>
          <p className="text-muted-foreground mb-6">
            Seu pagamento de <strong>R$ {myTotal.toFixed(2)}</strong> foi processado
          </p>
          
          <div className="w-full p-4 rounded-2xl bg-card border border-border mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Valor restante da mesa:</span>
              <span className="font-bold text-foreground">R$ {(remainingTotal - mySubtotal).toFixed(2)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                style={{ width: `${((totalOrder - remainingTotal + mySubtotal) / totalOrder) * 100}%` }}
              />
            </div>
          </div>

          <button 
            onClick={() => onNavigate('orders')}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl shadow-xl shadow-primary/25"
          >
            Ver Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Pagar Conta</h1>
            <p className="text-xs text-muted-foreground">Total: R$ {totalOrder.toFixed(2)} • Resta: R$ {remainingTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Guests Status */}
        <div>
          <h2 className="font-semibold text-foreground text-sm mb-3">Status da Mesa</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {guests.map((guest) => (
              <div 
                key={guest.id}
                className={`flex-shrink-0 p-3 rounded-2xl border-2 min-w-[100px] text-center ${
                  guest.paid 
                    ? 'border-success bg-success/10' 
                    : 'border-border bg-card'
                }`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  guest.paid ? 'bg-success' : 'bg-muted'
                }`}>
                  {guest.paid ? (
                    <Check className="w-5 h-5 text-success-foreground" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground truncate">{guest.name.split(' ')[0]}</p>
                <p className={`text-xs ${guest.paid ? 'text-success' : 'text-muted-foreground'}`}>
                  {guest.paid ? 'Pago' : 'Pendente'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Split Mode */}
        <div>
          <h2 className="font-semibold text-foreground text-sm mb-3">Modo de Pagamento</h2>
          <div className="grid grid-cols-2 gap-2">
            {splitModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSplitMode(mode.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all duration-300 ${
                  splitMode === mode.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <mode.icon className={`w-4 h-4 ${splitMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-semibold text-xs ${splitMode === mode.id ? 'text-primary' : 'text-foreground'}`}>
                    {mode.name}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selective Mode - Items */}
        {splitMode === 'selective' && (
          <div className="animate-fade-in">
            <h2 className="font-semibold text-foreground text-sm mb-3">Selecione os Itens</h2>
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
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isPaid 
                        ? 'border-success bg-success'
                        : isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground/30'
                    }`}>
                      {(isSelected || isPaid) && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.orderedBy}{isPaid && ' • Pago'}</p>
                    </div>
                    <span className="font-semibold text-sm text-foreground">R$ {item.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fixed Amount Mode */}
        {splitMode === 'fixed' && (
          <div className="animate-fade-in bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Máximo: R$ {remainingTotal.toFixed(2)}</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setFixedAmount(Math.max(0, fixedAmount - 10))}
                className="w-12 h-12 rounded-full bg-muted text-xl font-bold text-muted-foreground"
              >
                -
              </button>
              <span className="text-3xl font-bold text-foreground">R$ {fixedAmount.toFixed(2)}</span>
              <button
                onClick={() => setFixedAmount(Math.min(remainingTotal, fixedAmount + 10))}
                className="w-12 h-12 rounded-full bg-muted text-xl font-bold text-muted-foreground"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Tip */}
        <div>
          <h2 className="font-semibold text-foreground text-sm mb-3">Adicionar Gorjeta</h2>
          <div className="flex gap-2">
            {[0, 10, 15, 20].map((percent) => (
              <button
                key={percent}
                onClick={() => setTipPercent(percent)}
                className={`flex-1 py-3 rounded-xl border-2 text-center transition-all ${
                  tipPercent === percent
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-border'
                }`}
              >
                <span className={`font-semibold text-sm ${tipPercent === percent ? 'text-primary' : 'text-foreground'}`}>
                  {percent === 0 ? 'Sem' : `${percent}%`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="font-semibold text-foreground text-sm mb-3">Forma de Pagamento</h2>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  selectedPayment === method.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-border'
                }`}
              >
                <method.icon className={`w-5 h-5 mx-auto mb-1 ${selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {method.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-3">Resumo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">R$ {mySubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gorjeta ({tipPercent}%)</span>
              <span className="text-foreground">R$ {myTip.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-xl text-primary">R$ {myTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-5 bg-card border-t border-border">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl shadow-xl shadow-primary/25 active:scale-[0.98] transition-all"
        >
          Pagar R$ {myTotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default SplitPaymentScreenV2;
