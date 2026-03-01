import React from 'react';
import { ArrowLeft, Download, Share2, CheckCircle2, Receipt, Clock, MapPin, CreditCard, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMobilePreview } from '../context/MobilePreviewContext';

export const DigitalReceiptScreen: React.FC = () => {
  const { goBack, navigate } = useMobilePreview();

  const receiptData = {
    orderNumber: '#1847',
    date: '15 Dez 2024',
    time: '20:45',
    restaurant: {
      name: 'Sakura Ramen',
      address: 'Rua das Flores, 123 - Jardins',
      cnpj: '12.345.678/0001-90',
    },
    table: '12',
    items: [
      { name: 'Filé Mignon ao Molho Madeira', quantity: 1, price: 89.90, notes: 'Ponto médio' },
      { name: 'Risoto de Funghi', quantity: 1, price: 68.50 },
      { name: 'Água com Gás 500ml', quantity: 2, price: 8.00 },
      { name: 'Petit Gateau', quantity: 1, price: 32.00 },
    ],
    subtotal: 206.40,
    discount: 20.64,
    tip: 18.58,
    total: 204.34,
    paymentMethod: 'Cartão de Crédito',
    cardLast4: '4242',
    loyaltyPoints: 204,
  };

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: `Comprovante ${receiptData.orderNumber}`,
        text: `Comprovante de pagamento - ${receiptData.restaurant.name}`,
      });
    }
  };

  const handleDownload = () => {
    // Download PDF functionality
    alert('Comprovante baixado!');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Comprovante Digital</h1>
          <p className="text-xs text-muted-foreground">Pedido {receiptData.orderNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Success Banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-green-700 dark:text-green-400">Pagamento Aprovado!</h2>
            <p className="text-sm text-green-600 dark:text-green-500">Obrigado por sua visita</p>
          </div>
        </div>

        {/* Restaurant Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{receiptData.restaurant.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {receiptData.restaurant.address}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">CNPJ: {receiptData.restaurant.cnpj}</p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="text-sm font-medium">{receiptData.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hora</p>
                <p className="text-sm font-medium">{receiptData.time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mesa</p>
                <p className="text-sm font-medium">{receiptData.table}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Itens Consumidos</h3>
            
            <div className="space-y-2">
              {receiptData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <span className="text-foreground">{item.quantity}x {item.name}</span>
                    {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                  </div>
                  <span className="font-medium text-foreground ml-2">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">R$ {receiptData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Desconto (OKINAWA10)</span>
                <span>- R$ {receiptData.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gorjeta</span>
                <span className="text-foreground">R$ {receiptData.tip.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">Total Pago</span>
              <span className="font-bold text-xl text-primary">R$ {receiptData.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Forma de Pagamento
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">{receiptData.paymentMethod}</p>
                <p className="text-xs text-muted-foreground">•••• {receiptData.cardLast4}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Points */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Pontos Acumulados</p>
                  <p className="text-xs text-muted-foreground">Programa de Fidelidade</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">+{receiptData.loyaltyPoints}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Experience */}
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-foreground mb-2">Avalie sua experiência</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Sua opinião nos ajuda a melhorar!
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('rating')}
            >
              <Star className="h-4 w-4 mr-2" />
              Avaliar Restaurante
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
