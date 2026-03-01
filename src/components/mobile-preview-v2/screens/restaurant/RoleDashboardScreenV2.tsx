import { FC, useState } from 'react';
import { 
  Users, Clock, DollarSign, TrendingUp, Star, ChefHat, Utensils, AlertCircle,
  ShoppingBag, Calendar, LayoutGrid, Wine, BarChart3, Settings, Bell, Heart,
  Package, Book, CreditCard, UserCheck, Timer, Flame, CheckCircle
} from "lucide-react";

type UserRole = 'owner' | 'manager' | 'waiter' | 'chef' | 'barman' | 'maitre';

interface RoleDashboardScreenV2Props {
  onNavigate: (screen: string) => void;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  screen: string;
}

interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  time: string;
}

interface DashboardConfig {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: StatCard[];
  quickActions: QuickAction[];
  alerts: Alert[];
}

const dashboardConfigs: Record<UserRole, DashboardConfig> = {
  owner: {
    title: 'Owner Dashboard',
    icon: TrendingUp,
    stats: [
      { label: 'Faturamento', value: 'R$ 12.4k', icon: DollarSign, color: 'from-success to-success/80', trend: '+15%' },
      { label: 'Pedidos Hoje', value: 127, icon: ShoppingBag, color: 'from-primary to-accent' },
      { label: 'Clientes', value: 89, icon: Users, color: 'from-info to-info/80' },
      { label: 'Ticket Médio', value: 'R$ 98', icon: TrendingUp, color: 'from-secondary to-secondary/80', trend: '+8%' },
    ],
    quickActions: [
      { id: 'reports', label: 'Relatórios', icon: BarChart3, color: 'from-primary to-accent', screen: 'reports' },
      { id: 'staff', label: 'Equipe', icon: Users, color: 'from-info to-info/80', screen: 'staff' },
      { id: 'promotions', label: 'Promoções', icon: Star, color: 'from-warning to-warning/80', screen: 'promotions' },
      { id: 'settings', label: 'Configurar', icon: Settings, color: 'from-secondary to-muted', screen: 'settings' },
    ],
    alerts: [
      { id: '1', message: 'Estoque de bebidas baixo (3 itens)', type: 'warning', time: '10 min' },
      { id: '2', message: '2 avaliações negativas pendentes', type: 'error', time: '1h' },
    ],
  },
  manager: {
    title: 'Manager Dashboard',
    icon: Users,
    stats: [
      { label: 'Pedidos Ativos', value: 23, icon: ShoppingBag, color: 'from-primary to-accent' },
      { label: 'Tempo Médio', value: '18 min', icon: Clock, color: 'from-info to-info/80' },
      { label: 'Pagtos Pendentes', value: 5, icon: CreditCard, color: 'from-warning to-warning/80' },
      { label: 'Staff Online', value: 8, icon: UserCheck, color: 'from-success to-success/80' },
    ],
    quickActions: [
      { id: 'orders', label: 'Pedidos', icon: ShoppingBag, color: 'from-primary to-accent', screen: 'orders' },
      { id: 'kds', label: 'KDS', icon: ChefHat, color: 'from-destructive to-warning', screen: 'kitchen-kds' },
      { id: 'staff', label: 'Equipe', icon: Users, color: 'from-info to-info/80', screen: 'staff' },
      { id: 'issues', label: 'Pendências', icon: AlertCircle, color: 'from-warning to-warning/80', screen: 'orders' },
    ],
    alerts: [
      { id: '1', message: 'Mesa 5 aguardando aprovação de cancelamento', type: 'warning', time: '5 min' },
      { id: '2', message: 'Garçom Carlos solicitou pausa', type: 'info', time: '15 min' },
    ],
  },
  waiter: {
    title: 'Garçom Dashboard',
    icon: Utensils,
    stats: [
      { label: 'Minhas Mesas', value: 6, icon: LayoutGrid, color: 'from-primary to-accent' },
      { label: 'Pedidos Ativos', value: 12, icon: ShoppingBag, color: 'from-info to-info/80' },
      { label: 'Pagtos Pendentes', value: 3, icon: CreditCard, color: 'from-warning to-warning/80' },
      { label: 'Gorjetas Hoje', value: 'R$ 127', icon: Heart, color: 'from-success to-success/80' },
    ],
    quickActions: [
      { id: 'new-order', label: 'Novo Pedido', icon: ShoppingBag, color: 'from-primary to-accent', screen: 'orders' },
      { id: 'tables', label: 'Mesas', icon: LayoutGrid, color: 'from-info to-info/80', screen: 'tables' },
      { id: 'payments', label: 'Pagamentos', icon: CreditCard, color: 'from-success to-success/80', screen: 'order-payment' },
      { id: 'call-manager', label: 'Gerente', icon: Bell, color: 'from-warning to-warning/80', screen: 'dashboard' },
    ],
    alerts: [
      { id: '1', message: 'Mesa 8 chamando há 3 min', type: 'error', time: '3 min' },
      { id: '2', message: 'Pedido #1234 pronto para servir', type: 'info', time: '1 min' },
    ],
  },
  chef: {
    title: 'Chef Dashboard',
    icon: ChefHat,
    stats: [
      { label: 'Pendentes', value: 12, icon: Clock, color: 'from-warning to-warning/80' },
      { label: 'Preparando', value: 5, icon: Flame, color: 'from-destructive to-destructive/80' },
      { label: 'Concluídos', value: 48, icon: CheckCircle, color: 'from-success to-success/80' },
      { label: 'Tempo Médio', value: '8 min', icon: Timer, color: 'from-secondary to-secondary/80' },
    ],
    quickActions: [
      { id: 'kds', label: 'KDS', icon: ChefHat, color: 'from-primary to-accent', screen: 'kitchen-kds' },
      { id: 'menu', label: 'Cardápio', icon: Book, color: 'from-info to-info/80', screen: 'menu' },
      { id: 'inventory', label: 'Estoque', icon: Package, color: 'from-warning to-warning/80', screen: 'settings' },
      { id: 'call-waiter', label: 'Garçom', icon: Bell, color: 'from-success to-success/80', screen: 'waiter' },
    ],
    alerts: [
      { id: '1', message: 'Pedido #1234 atrasado (8 min SLA)', type: 'error', time: '2 min' },
      { id: '2', message: 'Salmão: últimas 3 porções', type: 'warning', time: '30 min' },
    ],
  },
  barman: {
    title: 'Bar Dashboard',
    icon: Wine,
    stats: [
      { label: 'Drinks Pendentes', value: 8, icon: Clock, color: 'from-primary to-accent' },
      { label: 'Tempo Médio', value: '4 min', icon: Timer, color: 'from-info to-info/80' },
      { label: 'Concluídos Hoje', value: 67, icon: CheckCircle, color: 'from-success to-success/80' },
      { label: 'Mais Pedido', value: 'Mojito', icon: Star, color: 'from-secondary to-secondary/80' },
    ],
    quickActions: [
      { id: 'bar-kds', label: 'Bar KDS', icon: Wine, color: 'from-primary to-accent', screen: 'bar-kds' },
      { id: 'inventory', label: 'Estoque', icon: Package, color: 'from-info to-info/80', screen: 'settings' },
      { id: 'recipes', label: 'Receitas', icon: Book, color: 'from-warning to-warning/80', screen: 'menu' },
    ],
    alerts: [
      { id: '1', message: 'Vodka Belvedere: estoque baixo', type: 'warning', time: '1h' },
    ],
  },
  maitre: {
    title: 'Maître Dashboard',
    icon: UserCheck,
    stats: [
      { label: 'Reservas Hoje', value: 24, icon: Calendar, color: 'from-primary to-accent' },
      { label: 'Na Fila', value: 7, icon: Clock, color: 'from-warning to-warning/80' },
      { label: 'Ocupação', value: '78%', icon: LayoutGrid, color: 'from-info to-info/80' },
      { label: 'VIPs', value: 3, icon: Star, color: 'from-secondary to-secondary/80' },
    ],
    quickActions: [
      { id: 'floor-plan', label: 'Salão', icon: LayoutGrid, color: 'from-primary to-accent', screen: 'tables' },
      { id: 'reservations', label: 'Reservas', icon: Calendar, color: 'from-info to-info/80', screen: 'reservations' },
      { id: 'waitlist', label: 'Fila', icon: Clock, color: 'from-warning to-warning/80', screen: 'maitre' },
      { id: 'vip', label: 'VIP', icon: Star, color: 'from-secondary to-secondary/80', screen: 'reservations' },
    ],
    alerts: [
      { id: '1', message: 'Reserva VIP chegando em 15 min (Mesa 1)', type: 'info', time: '15 min' },
      { id: '2', message: 'Risco de no-show: Reserva 19:30 não confirmada', type: 'warning', time: '30 min' },
    ],
  },
};

const RoleDashboardScreenV2: FC<RoleDashboardScreenV2Props> = ({ onNavigate }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');

  const config = dashboardConfigs[currentRole];
  const RoleIcon = config.icon;

  const roles: { id: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'owner', label: 'Owner', icon: TrendingUp },
    { id: 'manager', label: 'Manager', icon: Users },
    { id: 'maitre', label: 'Maître', icon: UserCheck },
    { id: 'waiter', label: 'Garçom', icon: Utensils },
    { id: 'chef', label: 'Chef', icon: ChefHat },
    { id: 'barman', label: 'Barman', icon: Wine },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-muted to-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <RoleIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{config.title}</h1>
            <p className="text-xs text-muted-foreground">Visão personalizada por cargo</p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setCurrentRole(role.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentRole === role.id
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {role.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {config.stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  {stat.trend && (
                    <span className="text-xs font-medium text-success">{stat.trend}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {config.quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate(action.screen)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all active:scale-95"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {config.alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertas
            </h2>
            <div className="space-y-2">
              {config.alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    alert.type === 'error' 
                      ? 'bg-destructive/10 border-destructive/30' 
                      : alert.type === 'warning'
                        ? 'bg-warning/10 border-warning/30'
                        : 'bg-info/10 border-info/30'
                  }`}
                >
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.type === 'error' 
                      ? 'text-destructive' 
                      : alert.type === 'warning'
                        ? 'text-warning'
                        : 'text-info'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">há {alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Overview - For visual balance */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Resumo do Dia
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentRole === 'owner' && 'Faturamento 15% acima da média. 3 novos clientes fidelidade.'}
            {currentRole === 'manager' && 'Operação fluindo bem. 2 pendências para resolver.'}
            {currentRole === 'waiter' && 'Bom dia! Suas mesas estão com ocupação alta.'}
            {currentRole === 'chef' && 'Fluxo intenso. Tempo médio dentro do SLA.'}
            {currentRole === 'barman' && 'Movimento moderado. Estoque precisa de atenção.'}
            {currentRole === 'maitre' && 'Ocupação alta para o jantar. VIPs confirmados.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboardScreenV2;
