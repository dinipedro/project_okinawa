import { FC, useState } from 'react';
import { ArrowLeft, Check, Clock, ChefHat, UtensilsCrossed, Bell, MessageCircle } from 'lucide-react';

interface OrderStatusScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const orderItems = [
  { 
    id: 1, 
    name: 'Omakase Selection', 
    status: 'preparing', 
    eta: '12 min',
    chef: 'Chef Tanaka'
  },
  { 
    id: 2, 
    name: 'Wagyu Tataki', 
    quantity: 2, 
    status: 'queued', 
    eta: '18 min',
    chef: 'Chef Tanaka'
  },
];

const statusSteps = [
  { id: 'received', label: 'Recebido', icon: Check, completed: true },
  { id: 'preparing', label: 'Preparando', icon: ChefHat, completed: true, active: true },
  { id: 'ready', label: 'Pronto', icon: UtensilsCrossed, completed: false },
];

const OrderStatusScreenV2: FC<OrderStatusScreenV2Props> = ({ onNavigate, onBack }) => {
  const [showCallWaiter, setShowCallWaiter] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">Status do Pedido</h1>
            <p className="text-primary-foreground/80 text-sm">Mesa 12 • Omakase Sushi</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      step.completed 
                        ? step.active 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/30'
                        : 'bg-white/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        step.completed 
                          ? step.active 
                            ? 'text-primary' 
                            : 'text-primary-foreground'
                          : 'text-primary-foreground/50'
                      }`} />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      step.active ? 'text-primary-foreground' : 'text-primary-foreground/70'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 rounded-full ${
                      step.completed ? 'bg-white/50' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto -mt-4">
        {/* ETA Card */}
        <div className="mx-4 bg-card rounded-3xl p-4 shadow-lg border border-border mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Tempo estimado</p>
              <p className="text-3xl font-bold text-foreground">12-18 min</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" />
          </div>
        </div>

        {/* Items Status */}
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seus itens</h2>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div 
                key={item.id}
                className={`bg-card rounded-2xl p-4 border ${
                  item.status === 'preparing' 
                    ? 'border-primary/30 shadow-sm shadow-primary/10' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    item.status === 'preparing'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.status === 'preparing' ? 'Preparando' : 'Na fila'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5" />
                    {item.chef}
                  </span>
                  <span className="text-primary font-medium">~{item.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call Waiter */}
        <div className="px-4 pb-8">
          <button
            onClick={() => setShowCallWaiter(!showCallWaiter)}
            className="w-full p-4 rounded-2xl bg-foreground flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-muted-foreground/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-background" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-background font-semibold">Precisa de ajuda?</p>
              <p className="text-muted text-sm">Chamar garçom discretamente</p>
            </div>
            <MessageCircle className="w-5 h-5 text-muted" />
          </button>

          {showCallWaiter && (
            <div className="mt-3 p-4 bg-card rounded-2xl border border-border space-y-2">
              <button className="w-full py-3 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors">
                Dúvidas sobre o pedido
              </button>
              <button className="w-full py-3 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors">
                Solicitar algo especial
              </button>
              <button className="w-full py-3 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors">
                Reportar problema
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusScreenV2;
