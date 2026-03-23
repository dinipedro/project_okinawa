import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, QrCode, Nfc, ChevronRight, Check, Receipt, Gift, Percent, Plus, Copy, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useMobilePreview } from '../context/MobilePreviewContext';

type PaymentMethod = 'apple_pay' | 'google_pay' | 'tap_to_pay' | 'pix' | 'credit_card' | 'debit_card';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export const CheckoutScreen: React.FC = () => {
  const { navigate } = useMobilePreview();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showPixCode, setShowPixCode] = useState(false);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [customTip, setCustomTip] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>('visa-4242');
  const [processing, setProcessing] = useState(false);

  // Mock order data
  const orderItems: OrderItem[] = [
    { id: '1', name: 'Filé Mignon ao Molho Madeira', quantity: 1, price: 89.90, notes: 'Ponto médio' },
    { id: '2', name: 'Risoto de Funghi', quantity: 1, price: 68.50 },
    { id: '3', name: 'Água com Gás 500ml', quantity: 2, price: 8.00 },
    { id: '4', name: 'Petit Gateau', quantity: 1, price: 32.00 },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const tipAmount = customTip ? parseFloat(customTip) || 0 : (subtotal - discount) * (tipPercentage / 100);
  const total = subtotal - discount + tipAmount;

  const paymentMethods = [
    { id: 'apple_pay' as PaymentMethod, name: 'Apple Pay', icon: '🍎', color: 'bg-black text-white', description: 'Pagamento rápido e seguro' },
    { id: 'google_pay' as PaymentMethod, name: 'Google Pay', icon: '🔵', color: 'bg-white border border-border', description: 'Use sua conta Google' },
    { id: 'tap_to_pay' as PaymentMethod, name: 'TAP to Pay', icon: Nfc, color: 'bg-primary text-primary-foreground', description: 'Aproxime o celular' },
    { id: 'pix' as PaymentMethod, name: 'PIX', icon: QrCode, color: 'bg-[#32BCAD] text-white', description: 'Transferência instantânea' },
    { id: 'credit_card' as PaymentMethod, name: 'Cartão de Crédito', icon: CreditCard, color: 'bg-blue-600 text-white', description: 'Parcele em até 12x' },
    { id: 'debit_card' as PaymentMethod, name: 'Cartão de Débito', icon: Wallet, color: 'bg-green-600 text-white', description: 'Débito direto na conta' },
  ];

  const savedCards = [
    { id: 'visa-4242', brand: 'Visa', last4: '4242', expiry: '12/26', color: 'bg-blue-600' },
    { id: 'master-8888', brand: 'Mastercard', last4: '8888', expiry: '08/25', color: 'bg-red-600' },
  ];

  const handlePayment = () => {
    if (selectedMethod === 'pix') {
      setShowPixCode(true);
    } else {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        // Navigate to digital receipt after successful payment
        navigate('digital-receipt');
      }, 2000);
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'OKINAWA10') {
      setPromoApplied(true);
    }
  };

  const copyPixCode = () => {
    const pixCode = `00020126580014br.gov.bcb.pix0136okinawa@restaurant.com5204000053039865406${total.toFixed(2)}5802BR`;
    navigator.clipboard?.writeText(pixCode);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate('cart')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Pagamento</h1>
          <p className="text-xs text-muted-foreground">Finalize seu pedido</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Order Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Resumo do Pedido
              </h2>
              <Badge variant="outline">{orderItems.length} itens</Badge>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <span className="text-foreground">{item.quantity}x {item.name}</span>
                    {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                  </div>
                  <span className="font-medium text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">R$ {subtotal.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto (10%)</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gorjeta ({tipPercentage}%)</span>
                <span className="text-foreground">R$ {tipAmount.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-xl text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Promo Code */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Gift className="h-4 w-4 text-primary" />
              Cupom de Desconto
            </h3>
            
            {promoApplied ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">OKINAWA10 aplicado</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o código"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={applyPromoCode}>Aplicar</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tip Selection */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Percent className="h-4 w-4 text-primary" />
              Gorjeta (opcional)
            </h3>
            
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[0, 5, 10, 15, 20].map((percent) => (
                <Button
                  key={percent}
                  variant={tipPercentage === percent && !customTip ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTipPercentage(percent); setCustomTip(''); }}
                  className="text-xs px-2"
                >
                  {percent}%
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Outro:</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Forma de Pagamento</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                const isIconComponent = typeof method.icon !== 'string';
                
                return (
                  <button
                    key={method.id}
                    onClick={() => { setSelectedMethod(method.id); setShowPixCode(false); }}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`p-2 rounded-lg ${method.color}`}>
                      {isIconComponent ? React.createElement(method.icon as React.ComponentType<{className?: string}>, { className: "h-5 w-5" }) : <span className="text-lg">{method.icon as string}</span>}
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">{method.name}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{method.description}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* PIX Code Display */}
        {showPixCode && selectedMethod === 'pix' && (
          <Card className="border-[#32BCAD]">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-foreground mb-3">Código PIX Gerado</h3>
              
              <div className="w-40 h-40 mx-auto bg-white p-3 rounded-lg mb-3 flex items-center justify-center">
                <QrCode className="h-28 w-28 text-black" />
              </div>

              <p className="text-xs text-muted-foreground mb-2">Escaneie ou copie o código</p>

              <div className="bg-muted p-2 rounded-lg mb-3">
                <code className="text-[10px] break-all text-muted-foreground">
                  00020126580014br.gov.bcb.pix...{total.toFixed(2)}
                </code>
              </div>

              <Button variant="outline" className="w-full" onClick={copyPixCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Código PIX
              </Button>
            </CardContent>
          </Card>
        )}

        {/* TAP to Pay Instructions */}
        {selectedMethod === 'tap_to_pay' && (
          <Card className="border-primary">
            <CardContent className="p-4 text-center">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Nfc className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">TAP to Pay</h3>
              <p className="text-sm text-muted-foreground">
                Aproxime seu celular da maquininha do estabelecimento para pagar
              </p>
            </CardContent>
          </Card>
        )}

        {/* Saved Cards (for credit/debit) */}
        {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Cartões Salvos</h3>
              
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedCard === card.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`p-2 ${card.color} rounded-lg`}>
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{card.brand} •••• {card.last4}</p>
                      <p className="text-xs text-muted-foreground">Expira {card.expiry}</p>
                    </div>
                    {selectedCard === card.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}

                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors">
                  <div className="p-2 bg-muted rounded-lg">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">Adicionar novo cartão</span>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Split Payment Option */}
        <button 
          onClick={() => navigate('split-payment')}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Dividir a Conta</p>
              <p className="text-xs text-muted-foreground">Divida com seus amigos</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Pay Button */}
      <div className="p-4 border-t border-border bg-card">
        <Button 
          className="w-full h-14 text-lg font-bold"
          disabled={!selectedMethod || (showPixCode && selectedMethod === 'pix') || processing}
          onClick={handlePayment}
        >
          {processing ? (
            'Processando...'
          ) : showPixCode ? (
            'Aguardando Pagamento PIX...'
          ) : (
            <>Pagar R$ {total.toFixed(2)}</>
          )}
        </Button>
      </div>
    </div>
  );
};
