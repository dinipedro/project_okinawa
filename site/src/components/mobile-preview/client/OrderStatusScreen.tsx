import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ChefHat, Flame, CheckCircle2, Bell, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMobilePreview } from '../context/MobilePreviewContext';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  estimatedTime?: number;
}

const statusConfig = {
  pending: { label: 'Na Fila', color: 'bg-muted', textColor: 'text-muted-foreground', icon: Clock },
  preparing: { label: 'Preparando', color: 'bg-amber-500', textColor: 'text-amber-600', icon: Flame },
  ready: { label: 'Pronto', color: 'bg-green-500', textColor: 'text-green-600', icon: CheckCircle2 },
  delivered: { label: 'Entregue', color: 'bg-primary', textColor: 'text-primary', icon: Package },
};

export const OrderStatusScreen: React.FC = () => {
  const { goBack, currentTable } = useMobilePreview();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: '1', name: 'Filé Mignon ao Molho Madeira', quantity: 1, status: 'preparing', estimatedTime: 12 },
    { id: '2', name: 'Risoto de Funghi', quantity: 1, status: 'pending', estimatedTime: 18 },
    { id: '3', name: 'Água com Gás 500ml', quantity: 2, status: 'delivered' },
    { id: '4', name: 'Petit Gateau', quantity: 1, status: 'pending', estimatedTime: 25 },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderItems(prev => prev.map(item => {
        if (item.status === 'pending' && Math.random() > 0.7) {
          return { ...item, status: 'preparing' as const, estimatedTime: item.estimatedTime ? item.estimatedTime - 5 : undefined };
        }
        if (item.status === 'preparing' && item.estimatedTime && item.estimatedTime <= 5 && Math.random() > 0.5) {
          return { ...item, status: 'ready' as const };
        }
        return item;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalEstimatedTime = Math.max(...orderItems
    .filter(item => item.estimatedTime)
    .map(item => item.estimatedTime || 0));

  const orderProgress = {
    pending: orderItems.filter(i => i.status === 'pending').length,
    preparing: orderItems.filter(i => i.status === 'preparing').length,
    ready: orderItems.filter(i => i.status === 'ready').length,
    delivered: orderItems.filter(i => i.status === 'delivered').length,
  };

  const totalItems = orderItems.length;
  const completedItems = orderProgress.ready + orderProgress.delivered;
  const progressPercent = (completedItems / totalItems) * 100;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Status do Pedido</h1>
          <p className="text-xs text-muted-foreground">Mesa {currentTable || '12'} • Pedido #1847</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Bell className="h-4 w-4" />
          Notificar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Overall Progress */}
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">Progresso Geral</h2>
                <p className="text-sm text-muted-foreground">
                  {completedItems} de {totalItems} itens prontos
                </p>
              </div>
              {totalEstimatedTime > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{totalEstimatedTime}'</p>
                  <p className="text-xs text-muted-foreground">tempo estimado</p>
                </div>
              )}
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(orderProgress).map(([status, count]) => {
                const config = statusConfig[status as keyof typeof statusConfig];
                const Icon = config.icon;
                return (
                  <div key={status} className="text-center p-2 rounded-lg bg-muted/50">
                    <div className={`mx-auto w-8 h-8 rounded-full ${config.color} flex items-center justify-center mb-1`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{count}</p>
                    <p className="text-[10px] text-muted-foreground">{config.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Live View */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Visão da Cozinha</h3>
              <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Ao vivo
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seu pedido está sendo preparado pelo Chef Carlos. O próximo item a ficar pronto é o Filé Mignon.
            </p>
          </CardContent>
        </Card>

        {/* Individual Items */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Itens do Pedido</h3>
          <div className="space-y-2">
            {orderItems.map((item) => {
              const config = statusConfig[item.status];
              const Icon = config.icon;
              
              return (
                <Card key={item.id} className={item.status === 'ready' ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.quantity}x {item.name}
                      </p>
                      <p className={`text-xs ${config.textColor}`}>{config.label}</p>
                    </div>
                    {item.estimatedTime && item.status !== 'delivered' && item.status !== 'ready' && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-foreground">{item.estimatedTime}'</p>
                        <p className="text-[10px] text-muted-foreground">restantes</p>
                      </div>
                    )}
                    {item.status === 'ready' && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">
                        A caminho!
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Help Notice */}
        <div className="p-4 rounded-xl bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            Algum problema com seu pedido?
          </p>
          <Button variant="link" className="text-primary p-0 h-auto text-sm">
            Chamar atendimento
          </Button>
        </div>
      </div>
    </div>
  );
};
