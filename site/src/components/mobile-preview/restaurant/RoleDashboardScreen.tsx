import { useState } from 'react';
import { 
  ChevronLeft, ChefHat, Wine, Users, UserCheck,
  Clock, AlertCircle, Check, Flame, TrendingUp,
  DollarSign, Star, Bell, Package
} from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

type StaffRole = 'CHEF' | 'BARMAN' | 'WAITER' | 'MAITRE';

interface RoleConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const roleConfigs: Record<StaffRole, RoleConfig> = {
  CHEF: {
    label: 'Chef de Cozinha',
    icon: <ChefHat className="h-6 w-6" />,
    color: 'primary',
    description: 'Gestão de pedidos e cozinha',
  },
  BARMAN: {
    label: 'Barman',
    icon: <Wine className="h-6 w-6" />,
    color: 'secondary',
    description: 'Gestão de bebidas',
  },
  WAITER: {
    label: 'Garçom',
    icon: <Users className="h-6 w-6" />,
    color: 'accent',
    description: 'Atendimento de mesas',
  },
  MAITRE: {
    label: 'Maître',
    icon: <UserCheck className="h-6 w-6" />,
    color: 'success',
    description: 'Reservas e recepção',
  },
};

export const RoleDashboardScreen = () => {
  const { goBack, navigate, params } = useMobilePreview();
  const [selectedRole, setSelectedRole] = useState<StaffRole>((params?.role as StaffRole) || 'CHEF');
  
  const roleConfig = roleConfigs[selectedRole];
  
  const renderChefDashboard = () => (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">12</span>
          </div>
          <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
        </div>
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-destructive" />
            <span className="text-2xl font-bold">3</span>
          </div>
          <p className="text-sm text-muted-foreground">Prioridade Alta</p>
        </div>
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold">18min</span>
          </div>
          <p className="text-sm text-muted-foreground">Tempo Médio</p>
        </div>
        <div className="p-4 rounded-2xl bg-success/10 border border-success/30">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold">47</span>
          </div>
          <p className="text-sm text-muted-foreground">Finalizados Hoje</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Ações Rápidas</h3>
        <button 
          onClick={() => navigate('kitchen-kds')}
          className="w-full p-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <ChefHat className="h-6 w-6" />
            <span className="font-medium">Abrir KDS Cozinha</span>
          </div>
          <span className="px-2 py-1 rounded-full bg-primary-foreground/20 text-sm">12 pedidos</span>
        </button>
      </div>
      
      {/* Alerts */}
      <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Estoque Baixo</p>
            <p className="text-xs text-muted-foreground">Salmão, Camarão, Wasabi</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderBarmanDashboard = () => (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <Wine className="h-5 w-5 text-secondary" />
            <span className="text-2xl font-bold">8</span>
          </div>
          <p className="text-sm text-muted-foreground">Drinks Pendentes</p>
        </div>
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold">3min</span>
          </div>
          <p className="text-sm text-muted-foreground">Tempo Médio</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Ações Rápidas</h3>
        <button 
          onClick={() => navigate('bar-kds')}
          className="w-full p-4 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Wine className="h-6 w-6" />
            <span className="font-medium">Abrir KDS Bar</span>
          </div>
          <span className="px-2 py-1 rounded-full bg-secondary-foreground/20 text-sm">8 pedidos</span>
        </button>
      </div>
      
      {/* Top Drinks */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Mais Pedidos Hoje</h3>
        <div className="space-y-2">
          {['Caipirinha', 'Chopp Pilsen', 'Gin Tônica'].map((drink, i) => (
            <div key={drink} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
              <span className="font-medium text-sm">{drink}</span>
              <span className="text-muted-foreground text-sm">{15 - i * 3}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderWaiterDashboard = () => (
    <div className="space-y-4">
      {/* My Tables */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: '3', status: 'occupied', guests: 4 },
          { id: '5', status: 'waiting', guests: 2 },
          { id: '8', status: 'occupied', guests: 6 },
          { id: '12', status: 'paying', guests: 3 },
        ].map(table => (
          <div 
            key={table.id}
            className={`p-3 rounded-xl text-center ${
              table.status === 'waiting' ? 'bg-primary/10 border-2 border-primary' :
              table.status === 'paying' ? 'bg-success/10 border border-success/30' :
              'bg-card border border-border'
            }`}
          >
            <p className="font-bold">Mesa {table.id}</p>
            <p className="text-xs text-muted-foreground">{table.guests} pessoas</p>
            {table.status === 'waiting' && (
              <span className="text-xs text-primary font-medium">Aguardando</span>
            )}
            {table.status === 'paying' && (
              <span className="text-xs text-success font-medium">Pagando</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold">R$ 1.240</span>
          </div>
          <p className="text-sm text-muted-foreground">Vendas Hoje</p>
        </div>
        <div className="p-4 rounded-2xl bg-success/10 border border-success/30">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold">R$ 186</span>
          </div>
          <p className="text-sm text-muted-foreground">Gorjetas</p>
        </div>
      </div>
      
      {/* Alerts */}
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-sm">Mesa 5 chamando</p>
            <p className="text-xs text-muted-foreground">Solicita atenção</p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm">
          Atender
        </button>
      </div>
    </div>
  );
  
  const renderMaitreDashboard = () => (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-success/10 border border-success/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold">14</span>
          </div>
          <p className="text-sm text-muted-foreground">Reservas Hoje</p>
        </div>
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold">6</span>
          </div>
          <p className="text-sm text-muted-foreground">Na Fila</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Ações Rápidas</h3>
        <button 
          onClick={() => navigate('maitre')}
          className="w-full p-4 rounded-2xl bg-success text-success-foreground flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6" />
            <span className="font-medium">Painel do Maître</span>
          </div>
          <span className="px-2 py-1 rounded-full bg-success-foreground/20 text-sm">3 chegaram</span>
        </button>
      </div>
      
      {/* Next Reservations */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Próximas Reservas</h3>
        <div className="space-y-2">
          {[
            { time: '19:00', name: 'Carlos Silva', guests: 4, vip: true },
            { time: '19:30', name: 'Ana Santos', guests: 2, vip: false },
            { time: '20:00', name: 'Pedro Costa', guests: 6, vip: false },
          ].map((res, i) => (
            <div key={i} className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <div className="text-center">
                <p className="font-bold text-sm">{res.time}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{res.name}</span>
                  {res.vip && <Star className="h-3.5 w-3.5 text-accent fill-accent" />}
                </div>
                <p className="text-xs text-muted-foreground">{res.guests} pessoas</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderDashboard = () => {
    switch (selectedRole) {
      case 'CHEF': return renderChefDashboard();
      case 'BARMAN': return renderBarmanDashboard();
      case 'WAITER': return renderWaiterDashboard();
      case 'MAITRE': return renderMaitreDashboard();
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className={`px-5 py-4 bg-${roleConfig.color} text-${roleConfig.color}-foreground`}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center gap-3">
            {roleConfig.icon}
            <div>
              <h1 className="font-display text-lg font-bold">{roleConfig.label}</h1>
              <p className="text-sm opacity-80">{roleConfig.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Role Selector */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {(Object.keys(roleConfigs) as StaffRole[]).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRole === role
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {roleConfigs[role].label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-20">
        {renderDashboard()}
      </div>
    </div>
  );
};
