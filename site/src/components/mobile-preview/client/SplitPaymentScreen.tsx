import React, { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { 
  ChevronLeft, Check, CreditCard, QrCode, Wallet,
  Receipt, Percent, Users, ChevronRight, Plus, Minus,
  AlertCircle, Sparkles, DollarSign, Smartphone, User,
  CheckCircle, ArrowRight, Nfc
} from "lucide-react";

const orderItems = [
  { id: "i1", name: "Ramen Tonkotsu", price: 58.90, quantity: 1, ordered_by: "Você", selected: false },
  { id: "i2", name: "Gyoza (6 un)", price: 32.00, quantity: 1, ordered_by: "Você", selected: false },
  { id: "i3", name: "Ramen Shoyu", price: 52.90, quantity: 1, ordered_by: "Maria", selected: false },
  { id: "i4", name: "Edamame", price: 18.00, quantity: 1, ordered_by: "Maria", selected: false },
  { id: "i5", name: "Ramen Miso", price: 54.90, quantity: 1, ordered_by: "João", selected: false },
  { id: "i6", name: "Karaage", price: 29.00, quantity: 1, ordered_by: "João", selected: false },
];

const guests = [
  { id: 'you', name: 'Você (Principal)', paid: false, items: ['i1', 'i2'] },
  { id: 'maria', name: 'Maria Silva', paid: false, items: ['i3', 'i4'] },
  { id: 'joao', name: 'João Pedro', paid: true, items: ['i5', 'i6'] },
];

type SplitMode = 'individual' | 'equal' | 'selective' | 'fixed';
type PaymentMethod = 'pix' | 'credit' | 'debit' | 'apple' | 'google' | 'tap' | 'wallet';

const splitModes = [
  {
    id: 'individual' as SplitMode,
    name: "Unitário",
    description: "Cliente principal paga tudo",
    icon: User,
  },
  {
    id: 'equal' as SplitMode,
    name: "Dividir Igual",
    description: "Valor dividido por todos",
    icon: Users,
  },
  {
    id: 'selective' as SplitMode,
    name: "Selecionar Itens",
    description: "Escolha o que vai pagar",
    icon: Check,
  },
  {
    id: 'fixed' as SplitMode,
    name: "Valor Fixo",
    description: "Defina quanto pagar",
    icon: DollarSign,
  },
];

const paymentMethods = [
  { id: 'pix' as PaymentMethod, name: "PIX", icon: QrCode, description: "Instantâneo", popular: true },
  { id: 'credit' as PaymentMethod, name: "Crédito", icon: CreditCard, description: "Visa •••• 4242" },
  { id: 'debit' as PaymentMethod, name: "Débito", icon: CreditCard, description: "Nubank •••• 1234" },
  { id: 'apple' as PaymentMethod, name: "Apple Pay", icon: Smartphone, description: "iPhone" },
  { id: 'google' as PaymentMethod, name: "Google Pay", icon: Smartphone, description: "Android" },
  { id: 'tap' as PaymentMethod, name: "TAP to Pay", icon: Nfc, description: "Aproximação" },
  { id: 'wallet' as PaymentMethod, name: "Carteira", icon: Wallet, description: "Saldo: R$ 150,00" },
];

export const SplitPaymentScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [splitMode, setSplitMode] = useState<SplitMode>('selective');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fixedAmount, setFixedAmount] = useState(0);
  const [tip, setTip] = useState(0);
  const [tipPercent, setTipPercent] = useState(0);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  
  const totalOrder = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paidByOthers = guests.filter(g => g.paid).reduce((sum, g) => {
    return sum + g.items.reduce((s, itemId) => {
      const item = orderItems.find(i => i.id === itemId);
      return s + (item ? item.price : 0);
    }, 0);
  }, 0);
  const remainingTotal = totalOrder - paidByOthers;
  const serviceCharge = remainingTotal * 0.1;

  const calculateMyTotal = () => {
    switch (splitMode) {
      case 'individual':
        return remainingTotal;
      case 'equal':
        const unpaidGuests = guests.filter(g => !g.paid).length;
        return remainingTotal / unpaidGuests;
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
  const myServiceCharge = mySubtotal * 0.1;
  const myTotal = mySubtotal + myServiceCharge + tip;

  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleTipPercent = (percent: number) => {
    setTipPercent(percent);
    setTip(mySubtotal * percent / 100);
  };

  if (showPaymentConfirm) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h2>
          <p className="text-muted-foreground mb-6">
            Seu pagamento de <strong>R$ {myTotal.toFixed(2)}</strong> foi processado
          </p>
          
          <div className="w-full p-4 rounded-2xl bg-muted/50 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Valor restante da mesa:</span>
              <span className="font-bold">R$ {(remainingTotal - mySubtotal).toFixed(2)}</span>
            </div>
            <div className="h-2 bg-accent rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((totalOrder - remainingTotal + mySubtotal) / totalOrder) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {remainingTotal - mySubtotal > 0 
                ? 'Aguardando pagamento dos demais'
                : 'Conta totalmente paga!'
              }
            </p>
          </div>

          <button 
            onClick={() => navigate('rating')}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Avaliar Experiência
          </button>
          <button 
            onClick={() => navigate('reservations')}
            className="w-full py-3 mt-2 text-muted-foreground text-sm"
          >
            Voltar para Reservas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold">Pagar Conta</h1>
            <p className="text-xs text-muted-foreground">
              Total da mesa: R$ {totalOrder.toFixed(2)} • Resta: R$ {remainingTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-48">
        {/* Guests Status */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Status da Mesa</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {guests.map((guest) => (
              <div 
                key={guest.id}
                className={`flex-shrink-0 p-3 rounded-xl border-2 min-w-[100px] text-center ${
                  guest.paid 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-border bg-card'
                }`}
              >
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  guest.paid ? 'bg-green-500' : 'bg-accent'
                }`}>
                  {guest.paid ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs font-medium truncate">{guest.name.split(' ')[0]}</p>
                <p className={`text-xs ${guest.paid ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {guest.paid ? 'Pago' : 'Pendente'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Split Mode Selection */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Modo de Pagamento</h2>
          <div className="grid grid-cols-2 gap-2">
            {splitModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSplitMode(mode.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  splitMode === mode.id
                    ? 'bg-primary/5 border-primary'
                    : 'bg-card border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <mode.icon className={`h-4 w-4 ${
                    splitMode === mode.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className="font-semibold text-xs">{mode.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selective Mode - Item Selection */}
        {splitMode === 'selective' && (
          <div className="mb-6 animate-fade-in">
            <h2 className="font-semibold text-sm mb-3">Selecione os Itens</h2>
            <div className="space-y-2">
              {orderItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                const isPaidByOther = guests.find(g => g.paid && g.items.includes(item.id));
                
                return (
                  <button
                    key={item.id}
                    onClick={() => !isPaidByOther && toggleItem(item.id)}
                    disabled={!!isPaidByOther}
                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      isPaidByOther 
                        ? 'border-green-500/30 bg-green-500/5 opacity-60'
                        : isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isPaidByOther 
                        ? 'border-green-500 bg-green-500'
                        : isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                    }`}>
                      {(isSelected || isPaidByOther) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Pedido por {item.ordered_by}
                        {isPaidByOther && ' • Pago'}
                      </p>
                    </div>
                    <span className="font-semibold text-sm">R$ {item.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fixed Amount Mode */}
        {splitMode === 'fixed' && (
          <div className="mb-6 animate-fade-in">
            <h2 className="font-semibold text-sm mb-3">Valor a Pagar</h2>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Valor máximo: R$ {remainingTotal.toFixed(2)}
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setFixedAmount(Math.max(0, fixedAmount - 10))}
                  className="w-12 h-12 rounded-full bg-accent text-xl font-bold"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-3xl font-bold">R$ {fixedAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setFixedAmount(Math.min(remainingTotal, fixedAmount + 10))}
                  className="w-12 h-12 rounded-full bg-accent text-xl font-bold"
                >
                  +
                </button>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {[50, 100, 150].map((val) => (
                  <button
                    key={val}
                    onClick={() => setFixedAmount(Math.min(remainingTotal, val))}
                    className="px-4 py-2 rounded-lg bg-muted text-sm font-medium"
                  >
                    R$ {val}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Valor residual será cobrado do cliente principal
            </p>
          </div>
        )}

        {/* Equal Split Info */}
        {splitMode === 'equal' && (
          <div className="mb-6 p-4 rounded-xl bg-accent/50 animate-fade-in">
            <p className="text-sm text-center">
              Dividindo por <strong>{guests.filter(g => !g.paid).length} pessoas</strong>
            </p>
            <p className="text-2xl font-bold text-center text-primary mt-1">
              R$ {(remainingTotal / guests.filter(g => !g.paid).length).toFixed(2)} cada
            </p>
          </div>
        )}

        {/* Add Tip */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Adicionar Gorjeta</h2>
          <div className="flex gap-2 mb-3">
            {[0, 10, 15, 20].map((percent) => (
              <button
                key={percent}
                onClick={() => handleTipPercent(percent)}
                className={`flex-1 py-3 rounded-xl border-2 text-center transition-all ${
                  tipPercent === percent
                    ? 'bg-primary/5 border-primary'
                    : 'bg-card border-border hover:border-muted-foreground/30'
                }`}
              >
                <span className="font-semibold text-sm">{percent === 0 ? 'Sem' : `${percent}%`}</span>
                {percent > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    R$ {(mySubtotal * percent / 100).toFixed(2)}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Forma de Pagamento</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full p-3 rounded-xl border-2 transition-all ${
                  selectedPayment === method.id
                    ? 'bg-secondary/5 border-secondary'
                    : 'bg-card border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    selectedPayment === method.id ? 'bg-secondary/20' : 'bg-muted'
                  }`}>
                    <method.icon className={`h-5 w-5 ${
                      selectedPayment === method.id ? 'text-secondary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{method.name}</span>
                      {method.popular && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  {selectedPayment === method.id && (
                    <div className="p-1 rounded-full bg-secondary">
                      <Check className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-2xl bg-muted/50 border border-border">
          <h3 className="font-semibold mb-3">Resumo do seu Pagamento</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {mySubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de serviço (10%)</span>
              <span>R$ {myServiceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gorjeta</span>
              <span>R$ {tip.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground">Seu total:</span>
          <span className="font-bold text-2xl">R$ {myTotal.toFixed(2)}</span>
        </div>
        <button 
          onClick={() => setShowPaymentConfirm(true)}
          disabled={myTotal <= 0}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${
            myTotal > 0 
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {selectedPayment === 'pix' && <QrCode className="h-5 w-5" />}
          {selectedPayment === 'tap' && <Nfc className="h-5 w-5" />}
          {(selectedPayment === 'apple' || selectedPayment === 'google') && <Smartphone className="h-5 w-5" />}
          {(selectedPayment === 'credit' || selectedPayment === 'debit') && <CreditCard className="h-5 w-5" />}
          Pagar R$ {myTotal.toFixed(2)}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Pagamento seguro e criptografado
        </p>
      </div>
    </div>
  );
};