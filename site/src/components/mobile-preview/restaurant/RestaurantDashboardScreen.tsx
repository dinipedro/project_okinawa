import { TrendingUp, Clock, Users, DollarSign, ChefHat, AlertCircle } from "lucide-react";

const stats = [
  { label: "Pedidos Hoje", value: "47", change: "+12%", icon: ChefHat, color: "primary" },
  { label: "Faturamento", value: "R$ 3.240", change: "+8%", icon: DollarSign, color: "success" },
  { label: "Clientes", value: "32", change: "+5%", icon: Users, color: "secondary" },
  { label: "Tempo Médio", value: "18 min", change: "-3%", icon: Clock, color: "accent" },
];

const pendingOrders = [
  { id: "#1234", table: "Mesa 5", items: 3, time: "5 min", status: "preparing" },
  { id: "#1235", table: "Mesa 12", items: 2, time: "2 min", status: "new" },
  { id: "#1236", table: "Delivery", items: 4, time: "8 min", status: "preparing" },
];

export const RestaurantDashboardScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm opacity-80">Bem-vindo de volta</p>
            <h1 className="font-display text-xl font-bold">Sakura Ramen</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-success rounded-full animate-pulse" />
            <span className="text-sm">Aberto</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-5 py-4 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Orders */}
      <div className="px-5 py-2 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Pedidos Pendentes
          </h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            {pendingOrders.length} ativos
          </span>
        </div>

        <div className="space-y-3">
          {pendingOrders.map((order) => (
            <div key={order.id} className={`p-4 rounded-2xl border-2 ${
              order.status === 'new' ? 'bg-primary/5 border-primary' : 'bg-card border-border'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{order.id}</span>
                  <span className="text-sm text-muted-foreground">{order.table}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  order.status === 'new' ? 'bg-primary text-primary-foreground' : 'bg-accent/10 text-accent'
                }`}>
                  {order.status === 'new' ? 'Novo' : 'Preparando'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{order.items} itens</span>
                <span className="text-sm font-medium">{order.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3">
        <div className="flex justify-around">
          {["Dashboard", "Pedidos", "Cardápio", "Config"].map((item, i) => (
            <button key={item} className={`flex flex-col items-center gap-1 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
