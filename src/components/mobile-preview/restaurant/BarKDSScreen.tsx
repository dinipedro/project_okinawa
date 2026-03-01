import { useState } from 'react';
import { Clock, Check, Wine, GlassWater, Coffee, Timer, Flame, ChevronDown } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

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
  { 
    id: "#B004", 
    table: "Mesa 8", 
    items: [
      { name: "Espresso", qty: 2, category: 'coffee' },
      { name: "Cappuccino", qty: 1, category: 'coffee' },
    ],
    time: "0:45",
    priority: "normal",
    status: "new",
    waiter: "Maria"
  },
  { 
    id: "#B005", 
    table: "Bar", 
    items: [
      { name: "Gin Tônica", qty: 1, notes: "Extra limão", category: 'cocktails' },
      { name: "Whisky Sour", qty: 1, category: 'cocktails' },
    ],
    time: "3:20",
    priority: "normal",
    status: "preparing",
    waiter: "João"
  },
];

const categoryIcons: Record<DrinkCategory, React.ReactNode> = {
  all: <GlassWater className="h-4 w-4" />,
  cocktails: <Wine className="h-4 w-4" />,
  wine: <Wine className="h-4 w-4" />,
  beer: <GlassWater className="h-4 w-4" />,
  soft: <GlassWater className="h-4 w-4" />,
  coffee: <Coffee className="h-4 w-4" />,
};

const categories: { id: DrinkCategory; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'cocktails', label: 'Drinks' },
  { id: 'wine', label: 'Vinhos' },
  { id: 'beer', label: 'Cervejas' },
  { id: 'soft', label: 'Soft' },
  { id: 'coffee', label: 'Café' },
];

export const BarKDSScreen = () => {
  const { navigate } = useMobilePreview();
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
  
  const startPreparing = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'preparing' as OrderStatus } : order
    ));
  };
  
  const newOrders = filteredOrders.filter(o => o.status === 'new');
  const preparingOrders = filteredOrders.filter(o => o.status === 'preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');
  
  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="px-4 py-3 bg-secondary flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wine className="h-6 w-6" />
          <span className="font-display font-bold text-lg">KDS - Bar</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-slate-800 px-3 py-1 rounded-full">
            {orders.filter(o => o.status !== 'ready').length} pendentes
          </span>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="px-4 py-2 bg-slate-800 flex gap-2 overflow-x-auto scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-secondary text-secondary-foreground' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {categoryIcons[cat.id]}
            {cat.label}
          </button>
        ))}
      </div>
      
      {/* Orders Columns */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full flex gap-3">
          {/* New Orders */}
          <div className="flex-1 flex flex-col">
            <div className="px-2 py-1.5 mb-2 rounded-lg bg-primary/20 flex items-center justify-between">
              <span className="text-xs font-bold text-primary">NOVOS</span>
              <span className="text-xs text-primary">{newOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
              {newOrders.map(order => (
                <div
                  key={order.id}
                  className={`rounded-xl p-3 bg-slate-800 ${
                    order.priority === 'high' ? 'border-2 border-destructive' : 'border border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{order.id}</span>
                      {order.priority === 'high' && <Flame className="h-3.5 w-3.5 text-destructive" />}
                    </div>
                    <span className="text-xs text-slate-400">{order.table}</span>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          {categoryIcons[item.category]}
                          <span className="font-bold">{item.qty}x</span>
                          <span>{item.name}</span>
                        </div>
                        {item.notes && (
                          <span className="text-destructive ml-5 text-xs">⚠ {item.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Timer className="h-3.5 w-3.5" />
                      <span className="font-mono">{order.time}</span>
                    </div>
                    <button 
                      onClick={() => startPreparing(order.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                    >
                      Iniciar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Preparing */}
          <div className="flex-1 flex flex-col">
            <div className="px-2 py-1.5 mb-2 rounded-lg bg-accent/20 flex items-center justify-between">
              <span className="text-xs font-bold text-accent">PREPARANDO</span>
              <span className="text-xs text-accent">{preparingOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
              {preparingOrders.map(order => (
                <div
                  key={order.id}
                  className={`rounded-xl p-3 bg-accent/10 ${
                    order.priority === 'high' ? 'border-2 border-destructive' : 'border border-accent/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{order.id}</span>
                      {order.priority === 'high' && <Flame className="h-3.5 w-3.5 text-destructive" />}
                    </div>
                    <span className="text-xs text-slate-400">{order.table}</span>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          {categoryIcons[item.category]}
                          <span className="font-bold">{item.qty}x</span>
                          <span>{item.name}</span>
                        </div>
                        {item.notes && (
                          <span className="text-destructive ml-5 text-xs">⚠ {item.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-accent/30">
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Timer className="h-3.5 w-3.5" />
                      <span className="font-mono">{order.time}</span>
                    </div>
                    <button 
                      onClick={() => markAsReady(order.id)}
                      className="p-1.5 rounded-lg bg-success text-success-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Ready */}
          <div className="flex-1 flex flex-col">
            <div className="px-2 py-1.5 mb-2 rounded-lg bg-success/20 flex items-center justify-between">
              <span className="text-xs font-bold text-success">PRONTOS</span>
              <span className="text-xs text-success">{readyOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
              {readyOrders.map(order => (
                <div
                  key={order.id}
                  className="rounded-xl p-3 bg-success/10 border border-success/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{order.id}</span>
                    <span className="text-xs text-slate-400">{order.table}</span>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs flex items-center gap-1.5">
                        {categoryIcons[item.category]}
                        <span className="font-bold">{item.qty}x</span>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2 border-t border-success/30 text-xs text-slate-400">
                    Garçom: {order.waiter}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Stats */}
      <div className="px-4 py-2 bg-slate-800 flex items-center justify-around text-center">
        <div>
          <div className="text-lg font-bold text-primary">{newOrders.length}</div>
          <div className="text-xs text-slate-400">Novos</div>
        </div>
        <div>
          <div className="text-lg font-bold text-accent">{preparingOrders.length}</div>
          <div className="text-xs text-slate-400">Preparando</div>
        </div>
        <div>
          <div className="text-lg font-bold text-success">{readyOrders.length}</div>
          <div className="text-xs text-slate-400">Prontos</div>
        </div>
        <div>
          <div className="text-lg font-bold">3min</div>
          <div className="text-xs text-slate-400">Tempo Médio</div>
        </div>
      </div>
    </div>
  );
};
