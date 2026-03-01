import { FC } from 'react';
import { ArrowLeft, Clock, Check, Package, ChevronRight, Star, Flame, RotateCcw } from 'lucide-react';
import LiquidGlassNav from '../components/LiquidGlassNav';

interface OrdersScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const activeOrders = [
  {
    id: 1,
    restaurant: 'Omakase Sushi',
    status: 'preparing',
    statusText: 'Preparando',
    items: '1x Omakase Selection, 2x Wagyu Tataki',
    total: 501.90,
    eta: '15-20 min',
    table: '12',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200',
  },
];

const pastOrders = [
  {
    id: 2,
    restaurant: 'Café Lumière',
    date: 'Ontem, 14:30',
    items: '1x Cappuccino, 1x Croissant',
    total: 28.50,
    rated: true,
    rating: 5,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200',
  },
  {
    id: 3,
    restaurant: 'La Trattoria Bella',
    date: '12/12, 20:15',
    items: '1x Pizza Margherita, 1x Tiramisu',
    total: 89.00,
    rated: false,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
  },
];

const OrdersScreenV2: FC<OrdersScreenV2Props> = ({ onNavigate, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-background relative pb-24">
      {/* Header */}
      <div className="bg-card px-4 py-4 border-b border-border flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Meus Pedidos</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Em andamento</h2>
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-3xl overflow-hidden border-2 border-primary shadow-lg shadow-primary/10"
              >
                <div className="p-4">
                  <div className="flex gap-3 mb-4">
                    <img
                      src={order.image}
                      alt={order.restaurant}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground">{order.restaurant}</h3>
                        <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                          <Flame className="h-3 w-3" />
                          {order.statusText}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.items}</p>
                      <p className="text-xs text-primary font-medium mt-1">Mesa {order.table}</p>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="bg-muted rounded-2xl p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Step 1 - Done */}
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div className="w-8 h-1 bg-primary rounded-full" />
                        </div>
                        {/* Step 2 - In Progress */}
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                            <Clock className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
                        </div>
                        {/* Step 3 - Pending */}
                        <div className="w-8 h-8 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{order.eta}</p>
                        <p className="text-xs text-muted-foreground">restantes</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => onNavigate('order-status')}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25"
                  >
                    Acompanhar em Tempo Real
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Orders */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h2>
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-2xl p-4 border border-border"
              >
                <div className="flex gap-3">
                  <img
                    src={order.image}
                    alt={order.restaurant}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{order.restaurant}</h3>
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{order.items}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">R$ {order.total.toFixed(2)}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onNavigate('digital-receipt')}
                          className="text-xs text-primary font-medium flex items-center gap-1"
                        >
                          Comprovante
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                        {order.rated ? (
                          <span className="flex items-center gap-1 text-xs text-warning">
                            <Star className="h-3.5 w-3.5 fill-warning" />
                            {order.rating}
                          </span>
                        ) : (
                          <button 
                            onClick={() => onNavigate('rating')}
                            className="text-xs text-primary font-medium flex items-center gap-1"
                          >
                            Avaliar
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Reorder */}
                <button 
                  onClick={() => onNavigate('restaurant-detail')}
                  className="w-full mt-3 py-2.5 rounded-xl bg-muted text-foreground font-medium text-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Pedir Novamente
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <LiquidGlassNav activeTab="orders" onNavigate={onNavigate} />
    </div>
  );
};

export default OrdersScreenV2;
