import React, { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { 
  Calendar, Clock, Users, MapPin, ChevronRight, Plus,
  Bell, Check, X, User, Phone, Share2, MoreVertical,
  Navigation, AlertCircle
} from "lucide-react";

type TabType = 'upcoming' | 'active' | 'past';

const reservations = {
  upcoming: [
    {
      id: 1,
      restaurant: "Sakura Ramen",
      address: "Rua Augusta, 1500 - Jardins",
      date: "Amanhã",
      fullDate: "17/12/2024",
      time: "19:30",
      guests: [
        { id: 'g1', name: 'Maria Silva', status: 'accepted', isMain: false },
        { id: 'g2', name: 'João Pedro', status: 'pending', isMain: false },
      ],
      partySize: 4,
      tableInfo: "Mesa 12 - Área Interna",
      status: "confirmed",
      paymentMode: 'shared',
      confirmationCode: "SAK-2024-1712",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      restaurant: "La Trattoria",
      address: "Al. Santos, 45 - Cerqueira César",
      date: "Sexta, 20/12",
      fullDate: "20/12/2024",
      time: "20:00",
      guests: [],
      partySize: 2,
      tableInfo: "Mesa 5 - Terraço",
      status: "pending",
      paymentMode: 'individual',
      confirmationCode: "LAT-2024-2012",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop",
    },
  ],
  active: [
    {
      id: 3,
      restaurant: "Tokyo Garden",
      address: "Rua Haddock Lobo, 1200",
      date: "Hoje",
      fullDate: "16/12/2024",
      time: "12:30",
      startedAt: "12:35",
      guests: [
        { id: 'g3', name: 'Ana Costa', status: 'accepted', isMain: false },
      ],
      partySize: 2,
      tableInfo: "Mesa 8 - Janela",
      status: "in_progress",
      paymentMode: 'shared',
      confirmationCode: "TOK-2024-1612",
      currentTotal: "R$ 186,00",
      waiter: "Carlos",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100&h=100&fit=crop",
    },
  ],
  past: [
    {
      id: 4,
      restaurant: "Pizzaria Napoli",
      address: "Rua Oscar Freire, 800",
      date: "10/12/2024",
      fullDate: "10/12/2024",
      time: "19:00",
      guests: [
        { id: 'g4', name: 'Pedro Santos', status: 'accepted', isMain: false },
        { id: 'g5', name: 'Lucia Ferreira', status: 'accepted', isMain: false },
      ],
      partySize: 4,
      tableInfo: "Mesa 3",
      status: "completed",
      paymentMode: 'shared',
      totalPaid: "R$ 324,00",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop",
    },
    {
      id: 5,
      restaurant: "Sushi House",
      address: "Av. Paulista, 1000",
      date: "05/12/2024",
      fullDate: "05/12/2024",
      time: "20:30",
      guests: [],
      partySize: 2,
      status: "cancelled",
      paymentMode: 'individual',
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop",
    },
  ],
};

export const ReservationsScreen = () => {
  const { navigate } = useMobilePreview();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full font-medium">Confirmada</span>;
      case 'pending':
        return <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-1 rounded-full font-medium">Pendente</span>;
      case 'in_progress':
        return <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium animate-pulse">Em Andamento</span>;
      case 'completed':
        return <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-medium">Concluída</span>;
      case 'cancelled':
        return <span className="text-xs bg-red-500/20 text-red-600 px-2 py-1 rounded-full font-medium">Cancelada</span>;
      default:
        return null;
    }
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Próximas', count: reservations.upcoming.length },
    { id: 'active', label: 'Ativas', count: reservations.active.length },
    { id: 'past', label: 'Histórico', count: reservations.past.length },
  ];

  const currentReservations = reservations[activeTab];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Minhas Reservas</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas experiências</p>
        </div>
        <button 
          onClick={() => navigate('explore')}
          className="p-3 rounded-full bg-primary text-primary-foreground"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-primary-foreground/20' 
                    : 'bg-background'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {/* Active Alert */}
        {activeTab === 'upcoming' && reservations.active.length > 0 && (
          <div 
            onClick={() => setActiveTab('active')}
            className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-primary">Reserva em andamento!</p>
              <p className="text-xs text-muted-foreground">Toque para ver detalhes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        )}

        {/* Reservations List */}
        <div className="space-y-4">
          {currentReservations.map((res: any) => {
            const isExpanded = expandedId === res.id;
            
            return (
              <div
                key={res.id}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  res.status === 'in_progress' 
                    ? 'bg-primary/5 border-primary' 
                    : 'bg-card border-border'
                }`}
              >
                {/* Main Card */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : res.id)}
                >
                  <div className="flex gap-3">
                    <img
                      src={res.image}
                      alt={res.restaurant}
                      className={`w-16 h-16 rounded-xl object-cover ${
                        res.status === 'cancelled' ? 'opacity-50 grayscale' : ''
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">{res.restaurant}</h3>
                        {getStatusBadge(res.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {res.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {res.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {res.partySize}
                        </span>
                      </div>
                      {res.status === 'in_progress' && (
                        <p className="text-sm font-medium text-primary mt-1">
                          Total atual: {res.currentTotal}
                        </p>
                      )}
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="h-px bg-border mb-4" />
                    
                    {/* Location */}
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">{res.address}</p>
                        {res.tableInfo && (
                          <p className="text-xs text-primary font-medium mt-0.5">{res.tableInfo}</p>
                        )}
                      </div>
                      <button className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Confirmation Code */}
                    {res.confirmationCode && (
                      <div className="p-3 rounded-xl bg-muted/50 mb-4">
                        <p className="text-xs text-muted-foreground">Código de confirmação</p>
                        <p className="font-mono font-bold text-foreground">{res.confirmationCode}</p>
                      </div>
                    )}

                    {/* Guests */}
                    {res.guests && res.guests.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Convidados</p>
                          {res.status !== 'completed' && res.status !== 'cancelled' && (
                            <button className="text-xs text-primary">+ Adicionar</button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {res.guests.map((guest: any) => (
                            <div key={guest.id} className="flex items-center gap-2 p-2 rounded-lg bg-accent">
                              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm flex-1">{guest.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                guest.status === 'accepted' 
                                  ? 'bg-green-500/20 text-green-600'
                                  : 'bg-amber-500/20 text-amber-600'
                              }`}>
                                {guest.status === 'accepted' ? 'Confirmado' : 'Pendente'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Mode */}
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <span className="text-muted-foreground">Tipo de comanda:</span>
                      <span className="font-medium">
                        {res.paymentMode === 'shared' ? 'Conjunta' : 'Individual'}
                      </span>
                    </div>

                    {/* Waiter Info (for active) */}
                    {res.waiter && (
                      <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/30 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Garçom responsável</p>
                            <p className="font-medium">{res.waiter}</p>
                          </div>
                          <button className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                            Chamar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {res.status === 'confirmed' && (
                        <>
                          <button className="flex-1 py-2.5 rounded-xl bg-muted font-medium text-sm">
                            Alterar
                          </button>
                          <button 
                            onClick={() => navigate('reservation-detail', { reservation: res })}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
                          >
                            Ver Cardápio
                          </button>
                        </>
                      )}
                      {res.status === 'in_progress' && (
                        <>
                          <button 
                            onClick={() => navigate('shared-order', { reservation: res })}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
                          >
                            Ver Pedidos
                          </button>
                          <button 
                            onClick={() => navigate('split-payment')}
                            className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm"
                          >
                            Pagar Conta
                          </button>
                        </>
                      )}
                      {res.status === 'completed' && (
                        <button 
                          onClick={() => navigate('explore')}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
                        >
                          Reservar Novamente
                        </button>
                      )}
                      {res.status === 'pending' && (
                        <button className="flex-1 py-2.5 rounded-xl bg-destructive/10 text-destructive font-medium text-sm">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {currentReservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Nenhuma reserva</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === 'upcoming' && 'Você não tem reservas futuras'}
              {activeTab === 'active' && 'Nenhuma reserva em andamento'}
              {activeTab === 'past' && 'Você ainda não fez reservas'}
            </p>
            <button 
              onClick={() => navigate('explore')}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
            >
              Explorar Restaurantes
            </button>
          </div>
        )}

        {/* Reminder Info */}
        {activeTab === 'upcoming' && reservations.upcoming.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Lembretes Automáticos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você e seus convidados receberão uma notificação 15 minutos antes do horário da reserva.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};