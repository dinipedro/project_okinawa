import { Calendar, Clock, Users, MapPin, Phone, MessageSquare, QrCode, ChevronRight, User, Check, X, Send, Plus } from "lucide-react";

export const ReservationDetailScreenV2 = () => {
  const reservation = {
    id: "#RES-2847",
    restaurant: "Sushi Yassu",
    date: "Hoje, 20 de Dezembro",
    time: "19:30",
    guests: 4,
    table: "Mesa 12",
    status: "confirmed",
    address: "Rua Augusta, 1508 - Jardins",
    phone: "(11) 3456-7890",
    confirmationCode: "OKIN-2847",
  };

  const guestList = [
    { id: 1, name: "Você", status: "confirmed", isHost: true },
    { id: 2, name: "João Silva", status: "confirmed", isHost: false },
    { id: 3, name: "Maria Costa", status: "pending", isHost: false },
    { id: 4, name: "Convidado pendente", status: "pending", isHost: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "from-emerald-400 to-teal-500";
      case "pending":
        return "from-amber-400 to-orange-500";
      default:
        return "from-muted-foreground/50 to-muted-foreground/30";
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-orange-50 to-amber-50 dark:from-background dark:to-background overflow-y-auto">
      {/* Header Card */}
      <div className="p-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-medium">
                Confirmada ✓
              </span>
              <h1 className="text-xl font-bold mt-2">{reservation.restaurant}</h1>
              <p className="text-sm text-white/80">{reservation.id}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl">🍣</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <Calendar className="h-4 w-4 mb-1 text-white/80" />
              <p className="text-xs text-white/70">Data</p>
              <p className="text-sm font-semibold">20 Dez</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <Clock className="h-4 w-4 mb-1 text-white/80" />
              <p className="text-xs text-white/70">Horário</p>
              <p className="text-sm font-semibold">{reservation.time}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <Users className="h-4 w-4 mb-1 text-white/80" />
              <p className="text-xs text-white/70">Pessoas</p>
              <p className="text-sm font-semibold">{reservation.guests}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-32">
        {/* QR Code */}
        <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Código de Confirmação</p>
                <p className="text-lg font-mono font-bold text-orange-600">{reservation.confirmationCode}</p>
              </div>
            </div>
            <button className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <QrCode className="h-6 w-6 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Guest List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground">Convidados</span>
            </div>
            <button className="flex items-center gap-1 text-orange-600 text-sm font-medium">
              <Plus className="h-4 w-4" />
              Convidar
            </button>
          </div>

          <div className="space-y-2">
            {guestList.map((guest) => (
              <div
                key={guest.id}
                className="p-3 rounded-xl bg-card/70 backdrop-blur-sm border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getStatusColor(guest.status)} flex items-center justify-center text-white font-bold`}>
                    {guest.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{guest.name}</p>
                      {guest.isHost && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs">
                          Anfitrião
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {guest.status === "confirmed" ? "Confirmado" : "Pendente"}
                    </p>
                  </div>
                </div>
                {guest.status === "confirmed" ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                ) : (
                  <button className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Send className="h-4 w-4 text-orange-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">Localização</span>
          </div>

          <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border">
            <p className="text-sm text-foreground mb-3">{reservation.address}</p>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm">
                <MapPin className="h-4 w-4" />
                Ver no Mapa
              </button>
              <button className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Phone className="h-5 w-5 text-orange-600" />
              </button>
              <button className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border">
        <div className="flex gap-3">
          <button className="flex-1 py-4 rounded-2xl bg-muted text-foreground font-semibold flex items-center justify-center gap-2">
            <X className="h-5 w-5" />
            Cancelar
          </button>
          <button className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold">
            Modificar Reserva
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailScreenV2;
