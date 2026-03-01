import { Clock, Check, ChefHat, Flame, Timer } from "lucide-react";

const orders = [
  { 
    id: "#1234", 
    table: "Mesa 5", 
    items: [
      { name: "Ramen Tonkotsu", qty: 2, notes: "Sem cebola" },
      { name: "Gyoza (6un)", qty: 1, notes: "" },
    ],
    time: "5:23",
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
    priority: "normal",
    status: "new"
  },
  { 
    id: "#1236", 
    table: "Delivery", 
    items: [
      { name: "Temaki Salmão", qty: 2, notes: "Extra wasabi" },
      { name: "Hot Roll", qty: 1, notes: "" },
      { name: "Refrigerante", qty: 2, notes: "" },
    ],
    time: "8:45",
    priority: "high",
    status: "preparing"
  },
  { 
    id: "#1237", 
    table: "Mesa 3", 
    items: [
      { name: "Combinado 20", qty: 1, notes: "" },
    ],
    time: "1:30",
    priority: "normal",
    status: "new"
  },
];

export const KitchenDisplayScreen = () => {
  return (
    <div className="h-full flex flex-col bg-foreground text-background">
      {/* Header */}
      <div className="px-4 py-3 bg-primary flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6" />
          <span className="font-display font-bold text-lg">KDS - Cozinha</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-background/20 px-3 py-1 rounded-full">
            {orders.length} pedidos
          </span>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-2 gap-3">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={`rounded-xl p-3 ${
                order.priority === 'high' ? 'bg-destructive/20 border-2 border-destructive' : 'bg-background/10'
              }`}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{order.id}</span>
                  {order.priority === 'high' && <Flame className="h-4 w-4 text-destructive" />}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  order.status === 'new' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                }`}>
                  {order.status === 'new' ? 'NOVO' : 'PREP'}
                </span>
              </div>

              <div className="text-sm text-background/70 mb-2">{order.table}</div>

              {/* Items */}
              <div className="space-y-1 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.qty}x</span>
                      <span>{item.name}</span>
                    </div>
                    {item.notes && (
                      <span className="text-xs text-destructive ml-5">⚠ {item.notes}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-background/20">
                <div className="flex items-center gap-1 text-background/70">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-mono">{order.time}</span>
                </div>
                <button className="p-2 rounded-lg bg-success text-success-foreground">
                  <Check className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="px-4 py-3 bg-background/10 flex items-center justify-around">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">4</div>
          <div className="text-xs text-background/60">Pendentes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">2</div>
          <div className="text-xs text-background/60">Preparando</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">12</div>
          <div className="text-xs text-background/60">Finalizados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">18min</div>
          <div className="text-xs text-background/60">Tempo Médio</div>
        </div>
      </div>
    </div>
  );
};
