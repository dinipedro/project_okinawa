import { Clock, Check, Package, ChevronRight, Star, ArrowLeft, Flame } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const activeOrders = [
  {
    id: 1,
    restaurant: "Sakura Ramen",
    status: "preparing",
    statusText: "Preparando",
    items: "2x Ramen Tonkotsu, 1x Gyoza",
    total: 118.70,
    eta: "15-20 min",
    table: "12",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop",
  },
];

const pastOrders = [
  {
    id: 2,
    restaurant: "Café Lumière",
    date: "Ontem, 14:30",
    items: "1x Cappuccino, 1x Croissant",
    total: 28.50,
    rated: true,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    restaurant: "La Trattoria",
    date: "12/12, 20:15",
    items: "1x Pizza Margherita",
    total: 52.00,
    rated: false,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop",
  },
];

export const OrdersScreen = () => {
  const { navigate, goBack } = useMobilePreview();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-4">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl font-bold">Meus Pedidos</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-sm text-muted-foreground mb-3">Em andamento</h2>
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-primary/5 border-2 border-primary"
              >
                <div className="flex gap-3 mb-3">
                  <img
                    src={order.image}
                    alt={order.restaurant}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{order.restaurant}</h3>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {order.statusText}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{order.items}</p>
                    <p className="text-xs text-primary mt-1 font-medium">Mesa {order.table}</p>
                  </div>
                </div>
                
                {/* Progress */}
                <div className="flex items-center justify-between bg-background rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <div className="w-8 h-1 bg-primary rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center animate-pulse">
                        <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <div className="w-8 h-1 bg-muted rounded-full" />
                    </div>
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary">{order.eta}</span>
                </div>

                <button 
                  className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
                  onClick={() => navigate('order-status')}
                >
                  Acompanhar Pedido em Tempo Real
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Past Orders */}
        <div>
          <h2 className="font-semibold text-sm text-muted-foreground mb-3">Histórico</h2>
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex gap-3">
                  <img
                    src={order.image}
                    alt={order.restaurant}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{order.restaurant}</h3>
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{order.items}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm">R$ {order.total.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <button 
                          className="text-xs text-primary font-medium flex items-center gap-1"
                          onClick={() => navigate('digital-receipt')}
                        >
                          Comprovante
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                        {order.rated ? (
                          <span className="flex items-center gap-1 text-xs text-accent">
                            <Star className="h-3.5 w-3.5 fill-accent" />
                            Avaliado
                          </span>
                        ) : (
                          <button 
                            className="text-xs text-primary font-medium flex items-center gap-1"
                            onClick={() => navigate('rating')}
                          >
                            Avaliar
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
