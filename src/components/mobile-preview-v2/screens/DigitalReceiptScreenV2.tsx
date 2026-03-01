import { FC } from 'react';
import { ChevronLeft, Download, Share2, CheckCircle2, Receipt, Clock, MapPin, CreditCard, Star } from 'lucide-react';

interface DigitalReceiptScreenV2Props {
  onNavigate: (screen: string) => void;
}

const receiptData = {
  orderNumber: '#1847',
  date: '15 Dez 2024',
  time: '20:45',
  restaurant: {
    name: 'Omakase Sushi',
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

const DigitalReceiptScreenV2: FC<DigitalReceiptScreenV2Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-muted to-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-card border-b border-border">
        <button 
          onClick={() => onNavigate('orders-v2')}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Comprovante Digital</h1>
          <p className="text-xs text-muted-foreground">Pedido {receiptData.orderNumber}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-24">
        {/* Success Banner */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-success/10 border border-success/30">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-success-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-success">Pagamento Aprovado!</h2>
            <p className="text-sm text-success/80">Obrigado por sua visita</p>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{receiptData.restaurant.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {receiptData.restaurant.address}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">CNPJ: {receiptData.restaurant.cnpj}</p>
            </div>
          </div>

          <div className="h-px bg-border my-3" />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="text-sm font-medium text-foreground">{receiptData.date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hora</p>
              <p className="text-sm font-medium text-foreground">{receiptData.time}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mesa</p>
              <p className="text-sm font-medium text-foreground">{receiptData.table}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
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

          <div className="h-px bg-border my-3" />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">R$ {receiptData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-success">
              <span>Desconto (OKINAWA10)</span>
              <span>- R$ {receiptData.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gorjeta</span>
              <span className="text-foreground">R$ {receiptData.tip.toFixed(2)}</span>
            </div>
          </div>

          <div className="h-px bg-border my-3" />

          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground">Total Pago</span>
            <span className="font-bold text-xl text-primary">R$ {receiptData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Forma de Pagamento
          </h3>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-info to-info/80 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-info-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">{receiptData.paymentMethod}</p>
              <p className="text-xs text-muted-foreground">•••• {receiptData.cardLast4}</p>
            </div>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-primary-foreground" />
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
        </div>

        {/* Rate Experience */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm text-center">
          <h3 className="font-semibold text-foreground mb-2">Avalie sua experiência</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Sua opinião nos ajuda a melhorar!
          </p>
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-lg">
            <Star className="w-4 h-4" />
            Avaliar Restaurante
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalReceiptScreenV2;
