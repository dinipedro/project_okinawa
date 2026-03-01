import { useState } from 'react';
import { 
  ChevronLeft, Users, Clock, Check, X, Phone, 
  Calendar, Search, UserPlus, AlertCircle, MapPin,
  ChevronRight, Star, MessageSquare
} from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

type TabType = 'reservations' | 'queue' | 'checkin';

interface Reservation {
  id: string;
  name: string;
  phone: string;
  guests: number;
  time: string;
  date: string;
  status: 'confirmed' | 'pending' | 'arrived' | 'seated' | 'noshow';
  table?: string;
  notes?: string;
  vip?: boolean;
  loyaltyTier?: string;
}

interface QueueEntry {
  id: string;
  name: string;
  phone: string;
  guests: number;
  waitTime: string;
  position: number;
  status: 'waiting' | 'called' | 'seated';
  addedAt: string;
}

const mockReservations: Reservation[] = [
  { id: "R001", name: "Carlos Silva", phone: "(11) 99999-1234", guests: 4, time: "19:00", date: "Hoje", status: "confirmed", table: "Mesa 5", vip: true, loyaltyTier: "Diamante" },
  { id: "R002", name: "Ana Santos", phone: "(11) 98888-5678", guests: 2, time: "19:30", date: "Hoje", status: "pending", notes: "Aniversário" },
  { id: "R003", name: "Pedro Costa", phone: "(11) 97777-9012", guests: 6, time: "20:00", date: "Hoje", status: "arrived" },
  { id: "R004", name: "Maria Oliveira", phone: "(11) 96666-3456", guests: 3, time: "20:30", date: "Hoje", status: "confirmed", vip: true, loyaltyTier: "Platina" },
  { id: "R005", name: "João Lima", phone: "(11) 95555-7890", guests: 2, time: "21:00", date: "Hoje", status: "confirmed" },
];

const mockQueue: QueueEntry[] = [
  { id: "Q001", name: "Fernanda Souza", phone: "(11) 94444-1111", guests: 2, waitTime: "15 min", position: 1, status: "called", addedAt: "18:45" },
  { id: "Q002", name: "Lucas Mendes", phone: "(11) 93333-2222", guests: 4, waitTime: "25 min", position: 2, status: "waiting", addedAt: "18:50" },
  { id: "Q003", name: "Beatriz Alves", phone: "(11) 92222-3333", guests: 3, waitTime: "35 min", position: 3, status: "waiting", addedAt: "18:55" },
];

export const MaitreScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [activeTab, setActiveTab] = useState<TabType>('reservations');
  const [reservations, setReservations] = useState(mockReservations);
  const [queue, setQueue] = useState(mockQueue);
  const [searchQuery, setSearchQuery] = useState('');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary/10 text-primary';
      case 'pending': return 'bg-accent/10 text-accent';
      case 'arrived': return 'bg-success/10 text-success';
      case 'seated': return 'bg-secondary/10 text-secondary';
      case 'noshow': return 'bg-destructive/10 text-destructive';
      case 'waiting': return 'bg-accent/10 text-accent';
      case 'called': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'arrived': return 'Chegou';
      case 'seated': return 'Sentado';
      case 'noshow': return 'No-show';
      case 'waiting': return 'Aguardando';
      case 'called': return 'Chamado';
      default: return status;
    }
  };
  
  const markArrived = (id: string) => {
    setReservations(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'arrived' as const } : r
    ));
  };
  
  const seatGuest = (id: string, isQueue: boolean = false) => {
    if (isQueue) {
      setQueue(prev => prev.map(q => 
        q.id === id ? { ...q, status: 'seated' as const } : q
      ));
    } else {
      setReservations(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'seated' as const } : r
      ));
    }
  };
  
  const callFromQueue = (id: string) => {
    setQueue(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'called' as const } : q
    ));
  };
  
  const upcomingReservations = reservations.filter(r => ['confirmed', 'pending'].includes(r.status));
  const arrivedReservations = reservations.filter(r => r.status === 'arrived');
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold">Painel do Maitre</h1>
            <p className="text-sm opacity-80">Gestão de reservas e fila</p>
          </div>
          <button className="p-2 rounded-full bg-primary-foreground/10">
            <UserPlus className="h-5 w-5" />
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-xl bg-primary-foreground/10 text-center">
            <div className="text-lg font-bold">{upcomingReservations.length}</div>
            <div className="text-xs opacity-80">Reservas</div>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 text-center">
            <div className="text-lg font-bold">{arrivedReservations.length}</div>
            <div className="text-xs opacity-80">Chegaram</div>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 text-center">
            <div className="text-lg font-bold">{queue.filter(q => q.status !== 'seated').length}</div>
            <div className="text-xs opacity-80">Na Fila</div>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 text-center">
            <div className="text-lg font-bold">~20min</div>
            <div className="text-xs opacity-80">Espera</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'reservations', label: 'Reservas', count: reservations.length },
          { id: 'queue', label: 'Fila', count: queue.filter(q => q.status !== 'seated').length },
          { id: 'checkin', label: 'Check-in', count: arrivedReservations.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
      
      {/* Search */}
      <div className="px-5 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-20">
        {activeTab === 'reservations' && (
          <div className="space-y-3">
            {reservations.filter(r => !['seated'].includes(r.status)).map(reservation => (
              <div 
                key={reservation.id}
                className={`p-4 rounded-2xl border ${
                  reservation.vip ? 'bg-accent/5 border-accent' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{reservation.name}</span>
                      {reservation.vip && <Star className="h-4 w-4 text-accent fill-accent" />}
                    </div>
                    {reservation.loyaltyTier && (
                      <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs">
                        {reservation.loyaltyTier}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                    {getStatusLabel(reservation.status)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {reservation.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {reservation.guests} pessoas
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {reservation.phone}
                  </span>
                  {reservation.table && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {reservation.table}
                    </span>
                  )}
                </div>
                
                {reservation.notes && (
                  <div className="p-2 rounded-lg bg-accent/10 text-xs text-accent mb-3 flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {reservation.notes}
                  </div>
                )}
                
                <div className="flex gap-2">
                  {reservation.status === 'pending' && (
                    <button className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                      Confirmar
                    </button>
                  )}
                  {reservation.status === 'confirmed' && (
                    <button 
                      onClick={() => markArrived(reservation.id)}
                      className="flex-1 py-2 rounded-xl bg-success text-success-foreground text-sm font-medium"
                    >
                      Marcar Chegada
                    </button>
                  )}
                  {reservation.status === 'arrived' && (
                    <button 
                      onClick={() => seatGuest(reservation.id)}
                      className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
                    >
                      Alocar Mesa
                    </button>
                  )}
                  <button className="p-2 rounded-xl border border-border">
                    <Phone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'queue' && (
          <div className="space-y-3">
            {queue.filter(q => q.status !== 'seated').map(entry => (
              <div 
                key={entry.id}
                className={`p-4 rounded-2xl border ${
                  entry.status === 'called' ? 'bg-primary/5 border-primary' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                      #{entry.position}
                    </div>
                    <div>
                      <span className="font-semibold">{entry.name}</span>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        {entry.guests} pessoas
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                    {getStatusLabel(entry.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>Entrou às {entry.addedAt}</span>
                  <span className="font-medium">Espera: ~{entry.waitTime}</span>
                </div>
                
                <div className="flex gap-2">
                  {entry.status === 'waiting' && (
                    <button 
                      onClick={() => callFromQueue(entry.id)}
                      className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                    >
                      Chamar
                    </button>
                  )}
                  {entry.status === 'called' && (
                    <button 
                      onClick={() => seatGuest(entry.id, true)}
                      className="flex-1 py-2 rounded-xl bg-success text-success-foreground text-sm font-medium"
                    >
                      Alocar Mesa
                    </button>
                  )}
                  <button className="p-2 rounded-xl border border-border">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-xl border border-destructive/30 text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add to Queue Button */}
            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar à Fila
            </button>
          </div>
        )}
        
        {activeTab === 'checkin' && (
          <div className="space-y-3">
            {arrivedReservations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum cliente aguardando</p>
              </div>
            ) : (
              arrivedReservations.map(reservation => (
                <div 
                  key={reservation.id}
                  className="p-4 rounded-2xl bg-success/5 border-2 border-success"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{reservation.name}</span>
                        {reservation.vip && <Star className="h-4 w-4 text-accent fill-accent" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reserva {reservation.time} • {reservation.guests} pessoas
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => seatGuest(reservation.id)}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Alocar Mesa
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
