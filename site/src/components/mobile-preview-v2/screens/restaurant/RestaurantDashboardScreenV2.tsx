import { FC } from 'react';
import { TrendingUp, Clock, Users, DollarSign, ChefHat, AlertCircle } from "lucide-react";
import RestaurantLiquidGlassNav from '../../components/RestaurantLiquidGlassNav';

interface RestaurantDashboardScreenV2Props {
  onNavigate: (screen: string) => void;
}

const stats = [
  { label: "Pedidos Hoje", value: "47", change: "+12%", icon: ChefHat, gradient: "from-primary to-accent", isPositive: true },
  { label: "Faturamento", value: "R$ 3.240", change: "+8%", icon: DollarSign, gradient: "from-success to-secondary", isPositive: true },
  { label: "Clientes", value: "32", change: "+5%", icon: Users, gradient: "from-secondary to-secondary-light", isPositive: true },
  { label: "Tempo Médio", value: "18 min", change: "-3%", icon: Clock, gradient: "from-info to-info/80", isPositive: false },
];

const pendingOrders = [
  { id: "#1234", table: "Mesa 5", items: 3, time: "5 min", status: "preparing" },
  { id: "#1235", table: "Mesa 12", items: 2, time: "2 min", status: "new" },
  { id: "#1236", table: "Delivery", items: 4, time: "8 min", status: "preparing" },
];

const RestaurantDashboardScreenV2: FC<RestaurantDashboardScreenV2Props> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background relative pb-28">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-primary-foreground/80">Bem-vindo de volta</p>
            <h1 className="text-xl font-bold">Omakase Sushi</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
            <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
            <span className="text-sm font-medium">Aberto</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-5 py-4 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  stat.isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Orders */}
      <div className="px-5 py-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Pedidos Pendentes
          </h2>
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
            {pendingOrders.length} ativos
          </span>
        </div>

        <div className="space-y-3">
          {pendingOrders.map((order) => (
            <div key={order.id} className={`p-4 rounded-2xl border-2 ${
              order.status === 'new' 
                ? 'bg-primary/10 border-primary' 
                : 'bg-card border-border'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{order.id}</span>
                  <span className="text-sm text-muted-foreground">{order.table}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  order.status === 'new' 
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' 
                    : 'bg-secondary/10 text-secondary'
                }`}>
                  {order.status === 'new' ? 'Novo' : 'Preparando'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{order.items} itens</span>
                <span className="text-sm font-semibold text-foreground">{order.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RestaurantLiquidGlassNav activeTab="dashboard" onNavigate={onNavigate} />
    </div>
  );
};

export default RestaurantDashboardScreenV2;
