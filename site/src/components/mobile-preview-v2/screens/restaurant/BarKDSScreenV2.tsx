import { FC, useState } from 'react';
import { Clock, Check, Wine, GlassWater, Coffee, Timer, Flame } from "lucide-react";

interface BarKDSScreenV2Props {
  onNavigate: (screen: string) => void;
}

type OrderStatus = 'new' | 'preparing' | 'ready';
type DrinkCategory = 'all' | 'cocktails' | 'wine' | 'beer' | 'soft' | 'coffee';

interface DrinkOrder {
  id: string;
  table: string;
  items: Array<{
    name: string;
    qty: number;
    notes?: string;
    category: DrinkCategory;
  }>;
  time: string;
  priority: 'high' | 'normal';
  status: OrderStatus;
  waiter: string;
}

const mockOrders: DrinkOrder[] = [
  { 
    id: "#B001", 
    table: "Mesa 5", 
    items: [
      { name: "Caipirinha", qty: 2, notes: "Sem açúcar", category: 'cocktails' },
      { name: "Mojito", qty: 1, category: 'cocktails' },
    ],
    time: "2:30",
    priority: "high",
    status: "new",
    waiter: "Carlos"
  },
  { 
    id: "#B002", 
    table: "Mesa 12", 
    items: [
      { name: "Chopp Pilsen", qty: 4, category: 'beer' },
    ],
    time: "1:15",
    priority: "normal",
    status: "preparing",
    waiter: "Ana"
  },
  { 
    id: "#B003", 
    table: "Mesa 3", 
    items: [
      { name: "Vinho Tinto - Malbec", qty: 1, notes: "Decantar", category: 'wine' },
      { name: "Água com Gás", qty: 2, category: 'soft' },
    ],
    time: "4:00",
    priority: "high",
    status: "preparing",
    waiter: "Pedro"
  },
];

const categories: { id: DrinkCategory; label: string; icon: typeof Wine }[] = [
  { id: 'all', label: 'Todos', icon: GlassWater },
  { id: 'cocktails', label: 'Drinks', icon: Wine },
  { id: 'wine', label: 'Vinhos', icon: Wine },
  { id: 'beer', label: 'Cervejas', icon: GlassWater },
  { id: 'coffee', label: 'Café', icon: Coffee },
];

const BarKDSScreenV2: FC<BarKDSScreenV2Props> = ({ onNavigate }) => {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory>('all');
  
  const filteredOrders = selectedCategory === 'all' 
    ? orders 
    : orders.filter(order => order.items.some(item => item.category === selectedCategory));
  
  const markAsReady = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'ready' as OrderStatus } : order
    ));
  };
  
  const newOrders = filteredOrders.filter(o => o.status === 'new');
  const preparingOrders = filteredOrders.filter(o => o.status === 'preparing');
  
  return (
    <div className="h-full flex flex-col bg-foreground text-background dark:bg-background dark:text-foreground">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-secondary to-secondary-light flex items-center justify-between text-secondary-foreground">
        <div className="flex items-center gap-2">
          <Wine className="w-6 h-6" />
          <span className="font-bold text-lg">KDS - Bar</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-secondary-foreground/20 px-3 py-1.5 rounded-full font-medium">
            {orders.filter(o => o.status !== 'ready').length} pendentes
          </span>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="px-4 py-2 bg-muted flex gap-2 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground' 
                : 'bg-card text-muted-foreground hover:bg-card-hover'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>
      
      {/* Orders Columns */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full flex gap-3">
          {/* New Orders */}
          <div className="flex-1 flex flex-col">
            <div className="px-3 py-2 mb-2 rounded-xl bg-primary/20 flex items-center justify-between">
              <span className="text-xs font-bold text-primary">NOVOS</span>
              <span className="text-xs text-primary">{newOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {newOrders.map(order => (
                <div
                  key={order.id}
                  className={`rounded-2xl p-3 bg-card ${
                    order.priority === 'high' ? 'border-2 border-destructive' : 'border border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{order.id}</span>
                      {order.priority === 'high' && <Flame className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{order.table}</span>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-secondary">{item.qty}x</span>
                          <span className="text-foreground">{item.name}</span>
                        </div>
                        {item.notes && (
                          <span className="text-destructive ml-5 text-xs">⚠ {item.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Timer className="w-3.5 h-3.5" />
                      <span className="font-mono">{order.time}</span>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground text-xs font-medium">
                      Iniciar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Preparing */}
          <div className="flex-1 flex flex-col">
            <div className="px-3 py-2 mb-2 rounded-xl bg-secondary/20 flex items-center justify-between">
              <span className="text-xs font-bold text-secondary">PREPARANDO</span>
              <span className="text-xs text-secondary">{preparingOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {preparingOrders.map(order => (
                <div
                  key={order.id}
                  className={`rounded-2xl p-3 bg-secondary/10 ${
                    order.priority === 'high' ? 'border-2 border-destructive' : 'border border-secondary/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{order.id}</span>
                      {order.priority === 'high' && <Flame className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{order.table}</span>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-bold text-secondary">{item.qty}x</span>
                        <span className="ml-1.5 text-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-secondary/30">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Timer className="w-3.5 h-3.5" />
                      <span className="font-mono">{order.time}</span>
                    </div>
                    <button 
                      onClick={() => markAsReady(order.id)}
                      className="p-1.5 rounded-lg bg-gradient-to-r from-success to-secondary text-success-foreground"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Stats */}
      <div className="px-4 py-2 bg-card border-t border-border flex items-center justify-around text-center">
        <div>
          <div className="text-lg font-bold text-primary">{newOrders.length}</div>
          <div className="text-xs text-muted-foreground">Novos</div>
        </div>
        <div>
          <div className="text-lg font-bold text-secondary">{preparingOrders.length}</div>
          <div className="text-xs text-muted-foreground">Preparando</div>
        </div>
        <div>
          <div className="text-lg font-bold text-success">0</div>
          <div className="text-xs text-muted-foreground">Prontos</div>
        </div>
        <div>
          <div className="text-lg font-bold text-foreground">3min</div>
          <div className="text-xs text-muted-foreground">Tempo Médio</div>
        </div>
      </div>
    </div>
  );
};

export default BarKDSScreenV2;
