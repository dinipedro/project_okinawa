import { 
  ChevronLeft, Users, Calendar, Clock, MapPin, Check, X,
  Phone, Mail, Crown, AlertCircle, CheckCircle2, UserPlus,
  Scan, QrCode, ChevronRight, Bell, Eye
} from "lucide-react";

const reservation = {
  id: "res-123",
  customer: {
    name: "Carlos Mendes",
    phone: "(11) 99999-1234",
    email: "carlos@email.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
    loyalty_tier: "gold",
    total_visits: 15,
  },
  date: "15 Dez 2024",
  time: "19:30",
  party_size: 4,
  status: "confirmed",
  table: "Mesa 8",
  occasion: "Aniversário",
  seating_preference: "Área externa",
  special_requests: "Mesa com vista para o jardim",
  confirmation_code: "RSV-XK7M2",
  created_at: "10 Dez 2024 14:32",
};

const guests = [
  {
    id: "g1",
    name: "Carlos Mendes",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
    is_host: true,
    status: "accepted",
    has_arrived: true,
    arrived_at: "19:25",
  },
  {
    id: "g2",
    name: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    is_host: false,
    status: "accepted",
    has_arrived: true,
    arrived_at: "19:28",
  },
  {
    id: "g3",
    name: "João Santos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    is_host: false,
    status: "accepted",
    has_arrived: false,
    arrived_at: null,
  },
  {
    id: "g4",
    name: "Ana Costa",
    phone: "(11) 98888-5678",
    avatar: null,
    is_host: false,
    status: "pending",
    has_arrived: false,
    arrived_at: null,
  },
];

const upcomingReservations = [
  {
    id: "r1",
    customer: "Pedro Lima",
    time: "19:00",
    party_size: 2,
    table: "Mesa 5",
    status: "confirmed",
    guests_arrived: 0,
  },
  {
    id: "r2",
    customer: "Julia Ferreira",
    time: "20:00",
    party_size: 6,
    table: "Mesa 12",
    status: "pending",
    guests_arrived: 0,
  },
  {
    id: "r3",
    customer: "Roberto Alves",
    time: "20:30",
    party_size: 4,
    table: "Mesa 3",
    status: "confirmed",
    guests_arrived: 0,
  },
];

export const RestaurantReservationsScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-xl font-bold">Reservas</h1>
            <p className="text-sm text-muted-foreground">Hoje, 15 Dez 2024</p>
          </div>
          <button className="p-3 rounded-full bg-primary text-primary-foreground">
            <Scan className="h-5 w-5" />
          </button>
        </div>
        
        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 p-3 rounded-xl bg-success/10 text-center">
            <p className="text-lg font-bold text-success">8</p>
            <p className="text-xs text-muted-foreground">Confirmadas</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-warning/10 text-center">
            <p className="text-lg font-bold text-warning">3</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-primary/10 text-center">
            <p className="text-lg font-bold text-primary">32</p>
            <p className="text-xs text-muted-foreground">Pessoas</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {/* Current Reservation Detail */}
        <div className="p-4 rounded-2xl bg-primary/5 border-2 border-primary mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={reservation.customer.avatar}
                alt={reservation.customer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{reservation.customer.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600 text-xs font-medium flex items-center gap-0.5">
                    <Crown className="h-3 w-3" />
                    Gold
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{reservation.customer.total_visits} visitas anteriores</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-success text-success-foreground text-xs font-medium">
              Confirmada
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{reservation.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{reservation.party_size} pessoas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{reservation.table}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <QrCode className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs">{reservation.confirmation_code}</span>
            </div>
          </div>
          
          {reservation.occasion && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                🎂 {reservation.occasion}
              </span>
              <span className="px-2 py-1 rounded-full bg-muted text-xs">
                {reservation.seating_preference}
              </span>
            </div>
          )}
          
          {reservation.special_requests && (
            <p className="text-xs text-muted-foreground mb-3">
              📝 {reservation.special_requests}
            </p>
          )}
          
          {/* Guest Tracking */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Convidados ({guests.filter(g => g.has_arrived).length}/{guests.length})</span>
              <button className="text-xs text-primary font-medium">Ver todos</button>
            </div>
            
            <div className="flex -space-x-2 mb-3">
              {guests.map((guest) => (
                <div key={guest.id} className="relative">
                  {guest.avatar ? (
                    <img
                      src={guest.avatar}
                      alt={guest.name}
                      className={`w-10 h-10 rounded-full object-cover border-2 border-background ${
                        !guest.has_arrived && 'opacity-50 grayscale'
                      }`}
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm font-medium ${
                      !guest.has_arrived && 'opacity-50'
                    }`}>
                      {guest.name[0]}
                    </div>
                  )}
                  {guest.has_arrived && (
                    <div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-success">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  {guest.is_host && (
                    <div className="absolute -top-0.5 -right-0.5 p-0.5 rounded-full bg-primary">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Guests List */}
            <div className="space-y-2">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className={`p-2 rounded-xl flex items-center gap-2 ${
                    guest.has_arrived ? 'bg-success/10' : 'bg-muted/50'
                  }`}
                >
                  <span className="text-sm flex-1 truncate">{guest.name}</span>
                  {guest.has_arrived ? (
                    <span className="text-xs text-success flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {guest.arrived_at}
                    </span>
                  ) : guest.status === 'pending' ? (
                    <span className="text-xs text-warning flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Pendente
                    </span>
                  ) : (
                    <button className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-lg font-medium">
                      Check-in
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2.5 rounded-xl bg-muted text-sm font-medium flex items-center justify-center gap-1.5">
              <Phone className="h-4 w-4" />
              Ligar
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-1.5">
              <Check className="h-4 w-4" />
              Sentar Mesa
            </button>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <h2 className="font-semibold text-sm text-muted-foreground mb-3">Próximas</h2>
        <div className="space-y-2">
          {upcomingReservations.map((res) => (
            <div
              key={res.id}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{res.customer}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      res.status === 'confirmed' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {res.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {res.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {res.party_size}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {res.table}
                    </span>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-muted">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
