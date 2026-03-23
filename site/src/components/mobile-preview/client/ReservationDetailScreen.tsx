import { 
  Calendar, Clock, Users, MapPin, ChevronLeft, Share2, 
  UserPlus, Check, X, MessageSquare, Phone, Mail, Link2,
  QrCode, Bell, Crown, CheckCircle, AlertCircle
} from "lucide-react";

const reservationData = {
  id: "res-123",
  restaurant: {
    name: "Sakura Ramen",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=200&fit=crop",
    address: "Av. Paulista, 1000 - São Paulo",
    phone: "(11) 99999-9999",
  },
  date: "15 Dez 2024",
  time: "19:30",
  party_size: 4,
  status: "confirmed",
  seating_preference: "Área externa",
  occasion: "Aniversário",
  special_requests: "Mesa com vista para o jardim",
  confirmation_code: "RSV-XK7M2",
};

const guests = [
  {
    id: "g1",
    name: "Você",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
    is_host: true,
    status: "accepted",
    has_arrived: false,
    invite_method: "app",
  },
  {
    id: "g2",
    name: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    is_host: false,
    status: "accepted",
    has_arrived: false,
    invite_method: "app",
    responded_at: "12/12/2024",
  },
  {
    id: "g3",
    name: "João Santos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    is_host: false,
    status: "pending",
    has_arrived: false,
    invite_method: "sms",
    requires_host_approval: false,
  },
  {
    id: "g4",
    name: "Ana Costa",
    avatar: null,
    email: "ana@email.com",
    is_host: false,
    status: "declined",
    has_arrived: false,
    invite_method: "email",
    responded_at: "11/12/2024",
  },
];

const pendingInviteFromOthers = {
  id: "inv-456",
  restaurant: "La Trattoria",
  host: "Carlos Mendes",
  date: "20 Dez 2024",
  time: "20:00",
  party_size: 6,
};

export const ReservationDetailScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Image */}
      <div className="relative">
        <img
          src={reservationData.restaurant.image}
          alt={reservationData.restaurant.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <button className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <Share2 className="h-5 w-5" />
        </button>
        
        {/* Confirmation Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                {reservationData.restaurant.name}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {reservationData.restaurant.address}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-success text-success-foreground text-xs font-semibold flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Confirmada
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-32">
        {/* Reservation Info Card */}
        <div className="p-4 rounded-2xl bg-card border border-border mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-semibold text-sm">{reservationData.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary/10">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Horário</p>
                <p className="font-semibold text-sm">{reservationData.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pessoas</p>
                <p className="font-semibold text-sm">{reservationData.party_size} convidados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted">
                <QrCode className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Código</p>
                <p className="font-semibold text-sm font-mono">{reservationData.confirmation_code}</p>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          {(reservationData.occasion || reservationData.seating_preference) && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {reservationData.occasion && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    🎂 {reservationData.occasion}
                  </span>
                )}
                {reservationData.seating_preference && (
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    {reservationData.seating_preference}
                  </span>
                )}
              </div>
              {reservationData.special_requests && (
                <p className="mt-2 text-xs text-muted-foreground">
                  📝 {reservationData.special_requests}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Guests Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Convidados ({guests.length})</h2>
            <button className="flex items-center gap-1.5 text-primary text-sm font-medium">
              <UserPlus className="h-4 w-4" />
              Convidar
            </button>
          </div>
          
          <div className="space-y-2">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className={`p-3 rounded-xl border ${
                  guest.is_host 
                    ? 'bg-primary/5 border-primary/20' 
                    : guest.status === 'declined'
                    ? 'bg-destructive/5 border-destructive/20 opacity-60'
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  {guest.avatar ? (
                    <img
                      src={guest.avatar}
                      alt={guest.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                      {guest.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{guest.name}</span>
                      {guest.is_host && (
                        <span className="flex items-center gap-0.5 text-xs text-primary">
                          <Crown className="h-3 w-3" />
                          Host
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs flex items-center gap-1 ${
                        guest.status === 'accepted' ? 'text-success' :
                        guest.status === 'pending' ? 'text-warning' :
                        'text-destructive'
                      }`}>
                        {guest.status === 'accepted' && <Check className="h-3 w-3" />}
                        {guest.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                        {guest.status === 'declined' && <X className="h-3 w-3" />}
                        {guest.status === 'accepted' ? 'Confirmado' :
                         guest.status === 'pending' ? 'Aguardando' : 'Recusou'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {guest.invite_method === 'app' && <Bell className="h-3 w-3" />}
                        {guest.invite_method === 'sms' && <Phone className="h-3 w-3" />}
                        {guest.invite_method === 'email' && <Mail className="h-3 w-3" />}
                        {guest.invite_method === 'link' && <Link2 className="h-3 w-3" />}
                        via {guest.invite_method.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {guest.status === 'pending' && !guest.is_host && (
                    <button className="text-xs text-muted-foreground">
                      Reenviar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Invite Methods */}
          <div className="mt-3 p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Convidar via:</p>
            <div className="flex gap-2">
              <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-background border border-border">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-xs">App</span>
              </button>
              <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-background border border-border">
                <Phone className="h-4 w-4 text-secondary" />
                <span className="text-xs">SMS</span>
              </button>
              <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-background border border-border">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-xs">Email</span>
              </button>
              <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-background border border-border">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pending Invite From Others */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-full bg-secondary/20">
              <Bell className="h-4 w-4 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Convite Pendente</h3>
              <p className="text-xs text-muted-foreground">
                {pendingInviteFromOthers.host} te convidou para uma reserva
              </p>
            </div>
          </div>
          <div className="mb-3 text-sm">
            <p className="font-medium">{pendingInviteFromOthers.restaurant}</p>
            <p className="text-xs text-muted-foreground">
              {pendingInviteFromOthers.date} às {pendingInviteFromOthers.time} • {pendingInviteFromOthers.party_size} pessoas
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive font-medium text-sm flex items-center justify-center gap-1.5">
              <X className="h-4 w-4" />
              Recusar
            </button>
            <button className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm flex items-center justify-center gap-1.5">
              <Check className="h-4 w-4" />
              Aceitar
            </button>
          </div>
        </div>

        {/* Contact Restaurant */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-sm mb-3">Contato do Restaurante</h3>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-muted flex items-center justify-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4" />
              Ligar
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-muted flex items-center justify-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <div className="flex gap-3">
          <button className="flex-1 py-3.5 rounded-2xl bg-muted font-semibold">
            Alterar Reserva
          </button>
          <button className="flex-1 py-3.5 rounded-2xl bg-destructive/10 text-destructive font-semibold">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
