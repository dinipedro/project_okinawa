import { FC, useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, QrCode, Users, Check, ChevronRight, Wallet } from 'lucide-react';

interface CheckoutScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const paymentMethods = [
  { id: 'apple', name: 'Apple Pay', icon: Smartphone, connected: true },
  { id: 'google', name: 'Google Pay', icon: Smartphone, connected: true },
  { id: 'pix', name: 'PIX', icon: QrCode, connected: true },
  { id: 'card', name: 'Cartão de crédito', icon: CreditCard, last4: '4242' },
];

const splitModes = [
  { id: 'individual', label: 'Individual', description: 'Cada um paga o seu' },
  { id: 'equal', label: 'Dividir igual', description: 'Total dividido igualmente' },
  { id: 'selective', label: 'Por item', description: 'Selecionar itens para pagar' },
];

const CheckoutScreenV2: FC<CheckoutScreenV2Props> = ({ onNavigate, onBack }) => {
  const [selectedPayment, setSelectedPayment] = useState('apple');
  const [splitMode, setSplitMode] = useState('individual');
  const [tipPercent, setTipPercent] = useState(10);

  const subtotal = 501.90;
  const tip = subtotal * (tipPercent / 100);
  const total = subtotal + tip;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-4 py-4 border-b border-border flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Pagamento</h1>
          <p className="text-xs text-muted-foreground">Mesa 12 • Omakase Sushi</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Split Payment Mode */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Modo de pagamento
          </h2>
          <div className="bg-card rounded-2xl p-1 border border-border flex gap-1">
            {splitModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSplitMode(mode.id)}
                className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
                  splitMode === mode.id
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <p className="font-semibold text-sm">{mode.label}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {splitModes.find(m => m.id === splitMode)?.description}
          </p>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Forma de pagamento
          </h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPayment === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-card border border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {method.name}
                    </p>
                    {method.last4 && (
                      <p className="text-xs text-muted-foreground">•••• {method.last4}</p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tip Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Gorjeta para a equipe
          </h2>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex gap-2 mb-3">
              {[0, 10, 15, 20].map((percent) => (
                <button
                  key={percent}
                  onClick={() => setTipPercent(percent)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    tipPercent === percent
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {percent}%
                </button>
              ))}
            </div>
            {tipPercent > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Você está adicionando <span className="font-semibold text-primary">R$ {tip.toFixed(2)}</span> de gorjeta
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-semibold text-foreground mb-3">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            {tipPercent > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Gorjeta ({tipPercent}%)</span>
                <span>R$ {tip.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span className="text-foreground">Total</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-card border-t border-border px-4 py-4">
        <button 
          onClick={() => onNavigate('digital-receipt')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          Pagar R$ {total.toFixed(2)}
          <ChevronRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Pagamento seguro processado por Stripe
        </p>
      </div>
    </div>
  );
};

export default CheckoutScreenV2;
