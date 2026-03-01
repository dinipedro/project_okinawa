import { FC, useState } from 'react';
import { 
  Plus, X, Bell, ShoppingBag, CreditCard, Wine, 
  ChefHat, LayoutGrid, Users, BarChart3, Settings
} from 'lucide-react';

export type QuickActionType = 'client' | 'restaurant';
export type UserRole = 'owner' | 'manager' | 'waiter' | 'chef' | 'barman' | 'maitre';

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  screen: string;
}

interface QuickActionsFABProps {
  type: QuickActionType;
  role?: UserRole;
  onNavigate: (screen: string) => void;
  /** Whether user is at a restaurant (has active table/order) */
  isAtRestaurant?: boolean;
  /** Whether user has an active reservation */
  hasReservation?: boolean;
}

const clientActions: QuickAction[] = [
  { id: 'call-waiter', icon: Bell, label: 'Garçom', color: 'from-primary to-accent', screen: 'call-waiter' },
  { id: 'new-order', icon: ShoppingBag, label: 'Pedido', color: 'from-success to-secondary', screen: 'cart' },
  { id: 'pay-bill', icon: CreditCard, label: 'Pagar', color: 'from-info to-info/80', screen: 'unified-payment' },
  { id: 'drinks', icon: Wine, label: 'Bebidas', color: 'from-destructive to-destructive/80', screen: 'dish-builder' },
];

const getRestaurantActions = (role: UserRole): QuickAction[] => {
  const baseActions: Record<UserRole, QuickAction[]> = {
    owner: [
      { id: 'new-order', icon: ShoppingBag, label: 'Pedido', color: 'from-primary to-accent', screen: 'orders' },
      { id: 'reports', icon: BarChart3, label: 'Relatórios', color: 'from-info to-info/80', screen: 'reports' },
      { id: 'staff', icon: Users, label: 'Equipe', color: 'from-success to-secondary', screen: 'staff' },
      { id: 'settings', icon: Settings, label: 'Config', color: 'from-secondary to-muted', screen: 'settings' },
    ],
    manager: [
      { id: 'new-order', icon: ShoppingBag, label: 'Pedido', color: 'from-primary to-accent', screen: 'orders' },
      { id: 'kds', icon: ChefHat, label: 'KDS', color: 'from-destructive to-warning', screen: 'kitchen-kds' },
      { id: 'staff', icon: Users, label: 'Equipe', color: 'from-success to-secondary', screen: 'staff' },
      { id: 'alerts', icon: Bell, label: 'Alertas', color: 'from-warning to-warning/80', screen: 'orders' },
    ],
    waiter: [
      { id: 'new-order', icon: ShoppingBag, label: 'Pedido', color: 'from-primary to-accent', screen: 'orders' },
      { id: 'tables', icon: LayoutGrid, label: 'Mesas', color: 'from-info to-info/80', screen: 'tables' },
      { id: 'pay-bill', icon: CreditCard, label: 'Pagamento', color: 'from-success to-secondary', screen: 'order-payment' },
      { id: 'call-manager', icon: Bell, label: 'Gerente', color: 'from-warning to-warning/80', screen: 'dashboard' },
    ],
    chef: [
      { id: 'kds', icon: ChefHat, label: 'KDS', color: 'from-primary to-accent', screen: 'kitchen-kds' },
      { id: 'menu', icon: ShoppingBag, label: 'Cardápio', color: 'from-info to-info/80', screen: 'menu' },
      { id: 'inventory', icon: LayoutGrid, label: 'Estoque', color: 'from-warning to-warning/80', screen: 'settings' },
      { id: 'call-waiter', icon: Bell, label: 'Garçom', color: 'from-success to-secondary', screen: 'waiter' },
    ],
    barman: [
      { id: 'bar-kds', icon: Wine, label: 'Bar KDS', color: 'from-primary to-accent', screen: 'bar-kds' },
      { id: 'inventory', icon: LayoutGrid, label: 'Estoque', color: 'from-info to-info/80', screen: 'settings' },
      { id: 'recipes', icon: ShoppingBag, label: 'Receitas', color: 'from-success to-secondary', screen: 'menu' },
    ],
    maitre: [
      { id: 'floor-plan', icon: LayoutGrid, label: 'Salão', color: 'from-primary to-accent', screen: 'tables' },
      { id: 'reservations', icon: Users, label: 'Reservas', color: 'from-info to-info/80', screen: 'reservations' },
      { id: 'waitlist', icon: Bell, label: 'Fila', color: 'from-warning to-warning/80', screen: 'maitre' },
      { id: 'vip', icon: CreditCard, label: 'VIP', color: 'from-success to-secondary', screen: 'reservations' },
    ],
  };
  
  return baseActions[role] || baseActions.waiter;
};

const QuickActionsFAB: FC<QuickActionsFABProps> = ({ 
  type, 
  role = 'waiter', 
  onNavigate,
  isAtRestaurant = false,
  hasReservation = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const actions = type === 'client' ? clientActions : getRestaurantActions(role);
  
  // Dynamic center button label based on context
  const getCenterLabel = () => {
    if (type === 'restaurant') return 'Ações';
    if (isAtRestaurant) return 'Pedido';
    if (hasReservation) return 'Check-in';
    return 'Mesa';
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Actions Menu */}
      <div className={`absolute bottom-16 right-0 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <div className="flex flex-col gap-3 items-end">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  onNavigate(action.screen);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-2xl bg-card border border-border shadow-lg transition-all duration-300`}
                style={{ 
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                  transform: isOpen ? 'translateX(0)' : 'translateX(20px)'
                }}
              >
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {action.label}
                </span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-foreground rotate-45' 
            : 'bg-gradient-to-br from-primary to-accent shadow-primary/30'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-background mx-auto" />
        ) : (
          <Plus className="w-6 h-6 text-primary-foreground mx-auto" />
        )}
        
        {/* Pulse effect when closed */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent animate-ping opacity-30" />
        )}
      </button>

      {/* Label */}
      {!isOpen && (
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-foreground/90 backdrop-blur-sm">
          <span className="text-xs font-medium text-background whitespace-nowrap">
            {getCenterLabel()}
          </span>
        </div>
      )}
    </div>
  );
};

export default QuickActionsFAB;
