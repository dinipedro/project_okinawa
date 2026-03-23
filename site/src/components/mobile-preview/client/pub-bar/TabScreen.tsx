import React, { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import {
  ArrowLeft,
  Beer,
  Users,
  QrCode,
  Plus,
  Crown,
  CreditCard,
  Clock,
  RefreshCw,
  Receipt,
  Share2,
  UserPlus,
  Bell,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// Mock tab data
const tabData = {
  id: 'tab-001',
  status: 'open',
  type: 'group',
  restaurant: {
    name: 'O\'Malleys Irish Pub',
    table: 'Mesa 7',
  },
  host: {
    id: 'u1',
    name: 'Você',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
  },
  members: [
    {
      id: 'u1',
      name: 'Você',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
      isHost: true,
      status: 'active',
      itemsOrdered: 3,
      totalSpent: 89.70,
    },
    {
      id: 'u2',
      name: 'Carlos Lima',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
      isHost: false,
      status: 'active',
      itemsOrdered: 2,
      totalSpent: 54.00,
    },
    {
      id: 'u3',
      name: 'Ana Costa',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
      isHost: false,
      status: 'active',
      itemsOrdered: 2,
      totalSpent: 67.80,
    },
  ],
  items: [
    { id: 'i1', name: 'Heineken 600ml', price: 24.90, quantity: 2, orderedBy: 'Você', status: 'delivered' },
    { id: 'i2', name: 'Gin Tônica', price: 32.00, quantity: 1, orderedBy: 'Você', status: 'delivered' },
    { id: 'i3', name: 'Fish & Chips', price: 49.90, quantity: 1, orderedBy: 'Carlos Lima', status: 'preparing' },
    { id: 'i4', name: 'Corona Extra', price: 18.00, quantity: 2, orderedBy: 'Ana Costa', status: 'delivered' },
    { id: 'i5', name: 'Mojito', price: 28.00, quantity: 1, orderedBy: 'Ana Costa', status: 'pending' },
  ],
  credits: {
    coverCharge: 30.00,
    deposit: 0,
    total: 30.00,
  },
  preauth: {
    enabled: true,
    amount: 200.00,
  },
  subtotal: 211.50,
  serviceCharge: 21.15,
  total: 232.65,
  balanceDue: 202.65, // After credits
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
};

const happyHour = {
  active: true,
  name: 'Happy Hour',
  discount: '50% em Chopes',
  endsAt: '20:00',
};

export function TabScreen() {
  const { goBack, navigate, currentTable } = useMobilePreview();
  const [activeSection, setActiveSection] = useState<'items' | 'members'>('items');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">Entregue</span>;
      case 'preparing':
        return <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs">Preparando</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">Pendente</span>;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor(((Date.now() - date.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-background/50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Beer className="w-5 h-5 text-primary" />
              <h1 className="font-semibold text-foreground">Comanda Digital</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tabData.restaurant.name} • {tabData.restaurant.table}
            </p>
          </div>
          <button className="p-2.5 rounded-full bg-primary/10 text-primary">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Happy Hour Banner */}
        {happyHour.active && (
          <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{happyHour.name}</p>
                <p className="text-xs text-muted-foreground">{happyHour.discount} • Até {happyHour.endsAt}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Stats */}
        <div className="grid grid-cols-3 gap-3 px-4 pb-4">
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground">Tempo</p>
            <p className="font-semibold text-foreground">{formatTime(tabData.createdAt)}</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground">Pessoas</p>
            <p className="font-semibold text-foreground">{tabData.members.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground">Itens</p>
            <p className="font-semibold text-foreground">{tabData.items.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveSection('items')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeSection === 'items'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          Itens ({tabData.items.length})
        </button>
        <button
          onClick={() => setActiveSection('members')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeSection === 'members'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          Participantes ({tabData.members.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-48">
        {activeSection === 'items' ? (
          <div className="space-y-3">
            {tabData.items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-card border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {item.quantity}
                      </span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pedido por {item.orderedBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="mt-1">{getStatusBadge(item.status)}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Repeat Round Button */}
            <button
              onClick={() => navigate('repeat-round')}
              className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Repetir Última Rodada</span>
            </button>

            {/* Add Item Button */}
            <button
              onClick={() => navigate('restaurant-detail')}
              className="w-full p-4 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Adicionar Item</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tabData.members.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {member.isHost && (
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary">
                        <Crown className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{member.name}</span>
                      {member.isHost && (
                        <span className="text-xs text-primary">Host</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.itemsOrdered} itens • R$ {member.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))}

            {/* Invite Button */}
            <button className="w-full p-4 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Convidar Pessoas</span>
            </button>
          </div>
        )}

        {/* Credits Info */}
        {tabData.credits.total > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">Créditos Disponíveis</p>
                <p className="text-xs text-muted-foreground">
                  Entrada convertida em consumação
                </p>
              </div>
              <span className="font-bold text-success">
                - R$ {tabData.credits.total.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Pre-auth Notice */}
        {tabData.preauth.enabled && (
          <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">Pré-autorização</p>
                <p className="text-xs text-muted-foreground">
                  R$ {tabData.preauth.amount.toFixed(2)} reservado no cartão
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8">
        {/* Quick Actions */}
        <div className="flex gap-3 px-4 mb-3">
          <button
            onClick={() => navigate('call-waiter')}
            className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-foreground hover:bg-muted transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Chamar Garçom</span>
          </button>
          <button
            onClick={() => navigate('tab-split')}
            className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-foreground hover:bg-muted transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span className="text-sm font-medium">Dividir</span>
          </button>
        </div>

        {/* Total & Pay */}
        <div className="p-4 bg-card border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Total da Comanda</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  R$ {tabData.balanceDue.toFixed(2)}
                </span>
                {tabData.credits.total > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {tabData.total.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('tab-payment')}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Fechar Comanda
          </button>
        </div>
      </div>
    </div>
  );
}
