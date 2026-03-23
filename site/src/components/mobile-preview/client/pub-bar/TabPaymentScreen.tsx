import React, { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  QrCode,
  Check,
  Receipt,
  Gift,
  ChevronRight,
  Shield,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Payment data
const paymentData = {
  subtotal: 211.50,
  serviceCharge: 21.15,
  credits: 30.00,
  total: 232.65,
  balanceDue: 202.65,
  userPart: 89.70, // If split by consumption
};

const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    description: 'Visa •••• 4242',
    icon: CreditCard,
    isDefault: true,
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    description: 'Pagamento rápido',
    icon: Smartphone,
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    description: 'Pagamento rápido',
    icon: Smartphone,
  },
  {
    id: 'pix',
    name: 'PIX',
    description: 'Pagamento instantâneo',
    icon: QrCode,
  },
];

const tipOptions = [0, 10, 15, 20];

export function TabPaymentScreen() {
  const { goBack, navigate } = useMobilePreview();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [selectedTip, setSelectedTip] = useState<number>(10);
  const [customTip, setCustomTip] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const tipAmount = customTip
    ? parseFloat(customTip)
    : (paymentData.balanceDue * selectedTip) / 100;
  const finalTotal = paymentData.balanceDue + tipAmount;

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado!</h2>
            <p className="text-muted-foreground mb-6">
              Sua comanda foi fechada com sucesso.
            </p>
            
            <div className="p-4 rounded-xl bg-card border border-border mb-6">
              <p className="text-sm text-muted-foreground mb-1">Total pago</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {finalTotal.toFixed(2)}
              </p>
              {tipAmount > 0 && (
                <p className="text-sm text-success mt-1">
                  Gorjeta: R$ {tipAmount.toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('digital-receipt')}
                className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-foreground"
              >
                <Receipt className="w-4 h-4" />
                Ver Recibo
              </button>
              <button
                onClick={() => navigate('home')}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Pagamento</h1>
          <p className="text-xs text-muted-foreground">Comanda #TAB-001</p>
        </div>
        <Shield className="w-5 h-5 text-success" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-48">
        {/* Order Summary */}
        <div className="p-4 rounded-xl bg-card border border-border mb-4">
          <h3 className="font-semibold text-foreground mb-3">Resumo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">R$ {paymentData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de serviço (10%)</span>
              <span className="text-foreground">R$ {paymentData.serviceCharge.toFixed(2)}</span>
            </div>
            {paymentData.credits > 0 && (
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  Créditos
                </span>
                <span>- R$ {paymentData.credits.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border font-semibold text-base">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">R$ {paymentData.balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tip Selection */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground mb-3">Gorjeta</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {tipOptions.map((tip) => (
              <button
                key={tip}
                onClick={() => {
                  setSelectedTip(tip);
                  setCustomTip('');
                }}
                className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                  selectedTip === tip && !customTip
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                {tip === 0 ? 'Sem' : `${tip}%`}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <input
              type="number"
              value={customTip}
              onChange={(e) => {
                setCustomTip(e.target.value);
                setSelectedTip(0);
              }}
              placeholder="Outro valor"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          {tipAmount > 0 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Gorjeta: R$ {tipAmount.toFixed(2)}
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground mb-3">Forma de Pagamento</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPaymentMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-primary">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  {method.isDefault && !isSelected && (
                    <span className="text-xs text-primary">Padrão</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add New Payment Method */}
        <button className="w-full p-4 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <CreditCard className="w-5 h-5" />
          <span className="font-medium">Adicionar Forma de Pagamento</span>
        </button>
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="p-4">
          <div className="p-4 rounded-xl bg-card border border-border mb-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total a pagar</span>
              <span className="text-2xl font-bold text-foreground">
                R$ {finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pagar R$ {finalTotal.toFixed(2)}
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Pagamento seguro e criptografado
          </p>
        </div>
      </div>
    </div>
  );
}
