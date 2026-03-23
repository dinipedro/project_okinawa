import { Clock, Check, ChefHat, Truck, X } from "lucide-react";

const orders = [
  { id: "#1234", table: "Mesa 5", items: ["2x Ramen Tonkotsu", "1x Gyoza"], total: 119.80, time: "14:32", status: "preparing" },
  { id: "#1235", table: "Mesa 12", items: ["1x Udon", "2x Edamame"], total: 68.00, time: "14:35", status: "new" },
  { id: "#1236", table: "Delivery", items: ["3x Ramen", "2x Gyoza"], total: 194.70, time: "14:28", status: "ready" },
];

export const RestaurantOrdersScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h1 className="font-display text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-2 mt-3">
          {["Todos", "Novos", "Preparando", "Prontos"].map((tab, i) => (
            <button key={tab} className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-3">
        {orders.map((order) => (
          <div key={order.id} className={`p-4 rounded-2xl border-2 ${
            order.status === 'new' ? 'border-primary bg-primary/5' :
            order.status === 'ready' ? 'border-success bg-success/5' : 'border-border bg-card'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-lg">{order.id}</span>
                <span className="text-sm text-muted-foreground ml-2">{order.table}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.time}</span>
              </div>
            </div>
            
            <div className="space-y-1 mb-3">
              {order.items.map((item, i) => (
                <p key={i} className="text-sm">{item}</p>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-bold text-primary">R$ {order.total.toFixed(2)}</span>
              <div className="flex gap-2">
                {order.status === 'new' && (
                  <>
                    <button className="p-2 rounded-xl bg-destructive/10 text-destructive">
                      <X className="h-5 w-5" />
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      Aceitar
                    </button>
                  </>
                )}
                {order.status === 'preparing' && (
                  <button className="px-4 py-2 rounded-xl bg-success text-success-foreground font-medium text-sm flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Pronto
                  </button>
                )}
                {order.status === 'ready' && (
                  <button className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Entregar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
