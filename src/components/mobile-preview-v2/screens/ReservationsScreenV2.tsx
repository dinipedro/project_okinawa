import { FC, useState } from 'react';
import { Calendar, Clock, Users, MapPin, ChevronRight, Plus, Bell, Check, User, Navigation, ChevronDown } from 'lucide-react';
import LiquidGlassNav from '../components/LiquidGlassNav';

interface ReservationsScreenV2Props {
  onNavigate: (screen: string) => void;
}

type TabType = 'upcoming' | 'active' | 'past';

const reservations = {
  upcoming: [
    {
      id: 1,
      restaurant: 'Omakase Sushi',
      address: 'Rua Augusta, 1500 - Jardins',
      date: 'Amanhã',
      fullDate: '17/12/2024',
      time: '19:30',
      guests: [
        { id: 'g1', name: 'Maria Silva', status: 'accepted' },
        { id: 'g2', name: 'João Pedro', status: 'pending' },
      ],
      partySize: 4,
      tableInfo: 'Mesa 12 - Área VIP',
      status: 'confirmed',
      confirmationCode: 'OMA-2024-1712',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200',
    },
    {
      id: 2,
      restaurant: 'La Trattoria Bella',
      address: 'Al. Santos, 45 - Cerqueira César',
      date: 'Sexta, 20/12',
      fullDate: '20/12/2024',
      time: '20:00',
      guests: [],
      partySize: 2,
      tableInfo: 'Mesa 5 - Terraço',
      status: 'pending',
      confirmationCode: 'LAT-2024-2012',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
    },
  ],
  active: [
    {
      id: 3,
      restaurant: 'Tokyo Garden',
      address: 'Rua Haddock Lobo, 1200',
      date: 'Agora',
      fullDate: '16/12/2024',
      time: '12:30',
      startedAt: '12:35',
      guests: [{ id: 'g3', name: 'Ana Costa', status: 'accepted' }],
      partySize: 2,
      tableInfo: 'Mesa 8 - Janela',
      status: 'in_progress',
      confirmationCode: 'TOK-2024-1612',
      currentTotal: 'R$ 186,00',
      waiter: 'Carlos',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200',
    },
  ],
  past: [
    {
      id: 4,
      restaurant: 'Pizzaria Napoli',
      address: 'Rua Oscar Freire, 800',
      date: '10/12/2024',
      fullDate: '10/12/2024',
      time: '19:00',
      guests: [
        { id: 'g4', name: 'Pedro Santos', status: 'accepted' },
        { id: 'g5', name: 'Lucia Ferreira', status: 'accepted' },
      ],
      partySize: 4,
      tableInfo: 'Mesa 3',
      status: 'completed',
      totalPaid: 'R$ 324,00',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200',
    },
  ],
};

const ReservationsScreenV2: FC<ReservationsScreenV2Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      in_progress: 'bg-primary/10 text-primary',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    const labels: Record<string, string> = {
      confirmed: 'Confirmada',
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Próximas', count: reservations.upcoming.length },
    { id: 'active', label: 'Ativas', count: reservations.active.length },
    { id: 'past', label: 'Histórico', count: reservations.past.length },
  ];

  const currentReservations = reservations[activeTab];

  return (
    <div className="flex flex-col h-full bg-background relative pb-24">
      {/* Header */}
      <div className="bg-card px-5 pt-4 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas experiências</p>
          </div>
          <button 
            onClick={() => onNavigate('explore-v2')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-primary-foreground/25' : 'bg-background'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Active Alert */}
        {activeTab === 'upcoming' && reservations.active.length > 0 && (
          <button
            onClick={() => setActiveTab('active')}
            className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-primary">Reserva em andamento!</p>
              <p className="text-xs text-muted-foreground">Toque para ver detalhes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        )}

        {/* Reservations List */}
        <div className="space-y-4">
          {currentReservations.map((res: any) => {
            const isExpanded = expandedId === res.id;
            
            return (
              <div
                key={res.id}
                className={`bg-card rounded-3xl overflow-hidden shadow-sm transition-all ${
                  res.status === 'in_progress' 
                    ? 'border-2 border-primary shadow-primary/10' 
                    : 'border border-border'
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
                      className={`w-20 h-20 rounded-2xl object-cover ${
                        res.status === 'cancelled' ? 'opacity-50 grayscale' : ''
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{res.restaurant}</h3>
                        {getStatusBadge(res.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                        <p className="text-sm font-bold text-primary mt-2">
                          Total: {res.currentTotal}
                        </p>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="h-px bg-border mb-4" />
                    
                    {/* Location */}
                    <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-muted">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{res.address}</p>
                        {res.tableInfo && (
                          <p className="text-xs text-primary font-medium mt-0.5">{res.tableInfo}</p>
                        )}
                      </div>
                      <button className="p-2 rounded-lg bg-background border border-border">
                        <Navigation className="w-4 h-4 text-foreground" />
                      </button>
                    </div>

                    {/* Confirmation Code */}
                    {res.confirmationCode && (
                      <div className="p-3 rounded-xl bg-foreground mb-4">
                        <p className="text-xs text-muted">Código de confirmação</p>
                        <p className="font-mono font-bold text-background tracking-wider">{res.confirmationCode}</p>
                      </div>
                    )}

                    {/* Guests */}
                    {res.guests && res.guests.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-foreground">Convidados</p>
                          {res.status !== 'completed' && res.status !== 'cancelled' && (
                            <button className="text-xs text-primary font-medium">+ Adicionar</button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {res.guests.map((guest: any) => (
                            <div key={guest.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted">
                              <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm flex-1 text-foreground">{guest.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                guest.status === 'accepted' 
                                  ? 'bg-success/10 text-success'
                                  : 'bg-warning/10 text-warning'
                              }`}>
                                {guest.status === 'accepted' ? 'Confirmado' : 'Pendente'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {res.status === 'confirmed' && (
                        <>
                          <button className="flex-1 py-3 rounded-xl bg-muted font-medium text-sm text-foreground">
                            Alterar
                          </button>
                          <button 
                            onClick={() => onNavigate('restaurant-detail')}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20"
                          >
                            Ver Cardápio
                          </button>
                        </>
                      )}
                      {res.status === 'in_progress' && (
                        <>
                          <button 
                            onClick={() => onNavigate('orders')}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20"
                          >
                            Ver Pedidos
                          </button>
                          <button 
                            onClick={() => onNavigate('checkout')}
                            className="flex-1 py-3 rounded-xl bg-foreground text-background font-medium text-sm"
                          >
                            Pagar Conta
                          </button>
                        </>
                      )}
                      {res.status === 'completed' && (
                        <button 
                          onClick={() => onNavigate('explore-v2')}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20"
                        >
                          Reservar Novamente
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
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Nenhuma reserva</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === 'upcoming' && 'Você não tem reservas futuras'}
              {activeTab === 'active' && 'Nenhuma reserva em andamento'}
              {activeTab === 'past' && 'Você ainda não fez reservas'}
            </p>
            <button 
              onClick={() => onNavigate('explore-v2')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20"
            >
              Explorar Restaurantes
            </button>
          </div>
        )}

        {/* Reminder Info */}
        {activeTab === 'upcoming' && reservations.upcoming.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Lembretes Automáticos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você e seus convidados receberão uma notificação 15 minutos antes do horário da reserva.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liquid Glass Navigation */}
      <LiquidGlassNav activeTab="reservations" onNavigate={onNavigate} />
    </div>
  );
};

export default ReservationsScreenV2;
