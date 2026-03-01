import { FC, useState, useRef } from 'react';
import { Clock, Check, ChefHat, Flame, Timer, RefreshCw, Volume2, VolumeX, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

interface KitchenDisplayScreenV2Props {
  onNavigate: (screen: string) => void;
}

interface OrderItem {
  name: string;
  qty: number;
  notes: string;
}

interface KitchenOrder {
  id: string;
  table: string;
  items: OrderItem[];
  time: string;
  timeSeconds: number;
  priority: 'high' | 'normal';
  status: 'new' | 'preparing' | 'ready';
}

const initialOrders: KitchenOrder[] = [
  { 
    id: "#1234", 
    table: "Mesa 5", 
    items: [
      { name: "Ramen Tonkotsu", qty: 2, notes: "Sem cebola" },
      { name: "Gyoza (6un)", qty: 1, notes: "" },
    ],
    time: "8:23",
    timeSeconds: 503,
    priority: "high",
    status: "preparing"
  },
  { 
    id: "#1235", 
    table: "Mesa 12", 
    items: [
      { name: "Yakissoba", qty: 1, notes: "" },
    ],
    time: "2:10",
    timeSeconds: 130,
    priority: "normal",
    status: "new"
  },
  { 
    id: "#1236", 
    table: "Mesa 3", 
    items: [
      { name: "Temaki Salmão", qty: 2, notes: "Extra wasabi" },
      { name: "Hot Roll", qty: 1, notes: "" },
    ],
    time: "5:45",
    timeSeconds: 345,
    priority: "normal",
    status: "preparing"
  },
  { 
    id: "#1237", 
    table: "Mesa 8", 
    items: [
      { name: "Combinado 20", qty: 1, notes: "" },
    ],
    time: "1:30",
    timeSeconds: 90,
    priority: "normal",
    status: "new"
  },
  { 
    id: "#1238", 
    table: "Mesa 15", 
    items: [
      { name: "Sashimi Selection", qty: 1, notes: "VIP - Chef's choice" },
      { name: "Edamame", qty: 2, notes: "" },
    ],
    time: "0:45",
    timeSeconds: 45,
    priority: "high",
    status: "new"
  },
];

const SLA_WARNING = 300; // 5 minutes
const SLA_CRITICAL = 480; // 8 minutes

const KitchenDisplayScreenV2: FC<KitchenDisplayScreenV2Props> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [swipingOrder, setSwipingOrder] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gradient-to-r from-primary to-accent';
      case 'preparing': return 'bg-gradient-to-r from-warning to-warning/80';
      case 'ready': return 'bg-gradient-to-r from-success to-success/80';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'NOVO';
      case 'preparing': return 'PREP';
      case 'ready': return 'PRONTO';
      default: return status;
    }
  };

  const getTimeColor = (seconds: number) => {
    if (seconds >= SLA_CRITICAL) return 'text-destructive';
    if (seconds >= SLA_WARNING) return 'text-warning';
    return 'text-muted-foreground';
  };

  const isOverdue = (seconds: number) => seconds >= SLA_CRITICAL;

  const handleTouchStart = (orderId: string, e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipingOrder(orderId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipingOrder) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(Math.max(-100, Math.min(100, diff)));
  };

  const handleTouchEnd = () => {
    if (!swipingOrder) return;
    
    const order = orders.find(o => o.id === swipingOrder);
    if (!order) {
      setSwipingOrder(null);
      setSwipeOffset(0);
      return;
    }

    // Swipe right = progress status
    if (swipeOffset > 60) {
      progressOrder(swipingOrder);
    }
    // Swipe left = regress status
    else if (swipeOffset < -60) {
      regressOrder(swipingOrder);
    }

    setSwipingOrder(null);
    setSwipeOffset(0);
  };

  const progressOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const nextStatus = order.status === 'new' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'ready';
        return { ...order, status: nextStatus };
      }
      return order;
    }));
  };

  const regressOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const prevStatus = order.status === 'ready' ? 'preparing' : order.status === 'preparing' ? 'new' : 'new';
        return { ...order, status: prevStatus };
      }
      return order;
    }));
  };

  const markAsReady = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'ready' } : order
    ));
  };

  const pendingOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const avgTime = Math.round(orders.reduce((sum, o) => sum + o.timeSeconds, 0) / orders.length / 60);

  return (
    <div className="h-full flex flex-col bg-foreground dark:bg-background">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary to-accent flex items-center justify-between text-primary-foreground">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6" />
          <span className="font-bold text-lg">KDS - Cozinha</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <span className="text-sm bg-primary-foreground/20 px-3 py-1.5 rounded-full font-medium">
            {orders.length} pedidos
          </span>
        </div>
      </div>

      {/* Priority Alert Banner */}
      {orders.some(o => isOverdue(o.timeSeconds)) && (
        <div className="px-4 py-2 bg-destructive/90 flex items-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
          <span className="text-sm font-medium text-destructive-foreground">
            {orders.filter(o => isOverdue(o.timeSeconds)).length} pedido(s) atrasado(s) - SLA excedido!
          </span>
        </div>
      )}

      {/* Swipe Instructions */}
      <div className="px-4 py-2 bg-foreground/95 flex items-center justify-center gap-6 text-muted text-xs">
        <div className="flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar status</span>
        </div>
        <div className="w-px h-4 bg-muted/30" />
        <div className="flex items-center gap-1">
          <span>Avançar status</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 p-3 overflow-y-auto bg-foreground/90">
        <div className="grid grid-cols-2 gap-3">
          {orders.filter(o => o.status !== 'ready').sort((a, b) => {
            // Priority first, then by time (oldest first)
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return b.timeSeconds - a.timeSeconds;
          }).map((order) => (
            <div 
              key={order.id}
              onTouchStart={(e) => handleTouchStart(order.id, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            className={`rounded-2xl p-4 transition-all duration-200 relative ${
                order.priority === 'high' || isOverdue(order.timeSeconds)
                  ? 'bg-gradient-to-br from-destructive/30 to-destructive/10 border-2 border-destructive' 
                  : 'bg-card border border-border'
              } ${swipingOrder === order.id ? 'scale-[0.98]' : ''}`}
              style={{
                transform: swipingOrder === order.id ? `translateX(${swipeOffset}px)` : undefined,
              }}
            >
              {/* Swipe Indicators */}
              {swipingOrder === order.id && (
                <>
                  {swipeOffset > 30 && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-success flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-success-foreground" />
                    </div>
                  )}
                  {swipeOffset < -30 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-warning flex items-center justify-center">
                      <ChevronLeft className="w-5 h-5 text-warning-foreground" />
                    </div>
                  )}
                </>
              )}

              {/* Order Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground">{order.id}</span>
                  {(order.priority === 'high' || isOverdue(order.timeSeconds)) && (
                    <Flame className="w-4 h-4 text-destructive animate-pulse" />
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(order.status)} text-primary-foreground`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="text-sm text-muted-foreground mb-3">{order.table}</div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{item.qty}x</span>
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    {item.notes && (
                      <span className="text-xs text-destructive ml-6 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {item.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className={`flex items-center gap-1.5 ${getTimeColor(order.timeSeconds)}`}>
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-mono font-bold">{order.time}</span>
                  {isOverdue(order.timeSeconds) && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-medium ml-1">
                      ATRASADO
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => markAsReady(order.id)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-success to-secondary text-success-foreground shadow-lg active:scale-95 transition-transform"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ready Orders Section */}
        {readyOrders.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              Prontos para Retirada ({readyOrders.length})
            </h3>
            <div className="space-y-2">
              {readyOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-success/20 border border-success/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">{order.id}</span>
                    <span className="text-sm text-muted-foreground">{order.table}</span>
                    <span className="text-xs text-muted-foreground/70">{order.items.length} item(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-success">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold text-sm">PRONTO</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="px-4 py-3 bg-card border-t border-border flex items-center justify-around">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{pendingOrders.length}</div>
          <div className="text-xs text-muted-foreground">Novos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">{preparingOrders.length}</div>
          <div className="text-xs text-muted-foreground">Preparando</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{readyOrders.length}</div>
          <div className="text-xs text-muted-foreground">Prontos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{avgTime}min</div>
          <div className="text-xs text-muted-foreground">Tempo Médio</div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplayScreenV2;
