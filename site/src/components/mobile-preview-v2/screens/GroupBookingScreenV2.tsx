import { useState } from "react";
import { ArrowLeft, Users, Calendar, Clock, ChevronRight, Plus, Minus, Check } from "lucide-react";

interface GroupBookingScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export const GroupBookingScreenV2 = ({ onNavigate, onBack }: GroupBookingScreenProps) => {
  const [partySize, setPartySize] = useState(6);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [needsReservation, setNeedsReservation] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");

  const groupThreshold = 8; // Groups >= 8 require reservation

  // Check if reservation is required based on party size
  const reservationRequired = partySize >= groupThreshold;

  const availableDates = [
    { date: "Hoje", value: "today" },
    { date: "Amanhã", value: "tomorrow" },
    { date: "Sáb, 1 Fev", value: "2026-02-01" },
    { date: "Dom, 2 Fev", value: "2026-02-02" },
  ];

  const availableTimes = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

  const handleSubmit = () => {
    if (reservationRequired && (!selectedDate || !selectedTime)) {
      return;
    }
    // Navigate to confirmation or waitlist based on reservation status
    onNavigate(reservationRequired ? "reservation-detail" : "waitlist");
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Reserva de Grupo</h1>
            <p className="text-xs text-muted-foreground">Casual Dining • Grupos bem-vindos</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Party Size Selector */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Quantas pessoas?</h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPartySize(Math.max(2, partySize - 1))}
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus className="h-5 w-5 text-foreground" />
              </button>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-4xl font-bold text-foreground">{partySize}</span>
                </div>
                <p className="text-sm text-muted-foreground">pessoas</p>
              </div>
              <button
                onClick={() => setPartySize(Math.min(20, partySize + 1))}
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Plus className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* Reservation Notice */}
            {reservationRequired && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  ⚠️ Grupos com {groupThreshold}+ pessoas precisam de reserva antecipada.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Date Selection (required for large groups) */}
        {reservationRequired && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Escolha a data <span className="text-destructive">*</span>
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDate(d.value)}
                  className={`px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                    selectedDate === d.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {d.date}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Selection (required for large groups) */}
        {reservationRequired && selectedDate && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Escolha o horário <span className="text-destructive">*</span>
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedTime === time
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Walk-in Option (for smaller groups) */}
        {!reservationRequired && (
          <div className="mb-6">
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">Walk-in disponível!</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Grupos com até {groupThreshold - 1} pessoas podem ir direto para a fila de espera.
                  </p>
                  <button
                    onClick={() => onNavigate("waitlist")}
                    className="flex items-center gap-2 text-sm text-primary font-medium"
                  >
                    Entrar na fila agora <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => setNeedsReservation(true)}
              className="w-full mt-4 p-4 bg-card rounded-2xl border border-border flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-foreground">Prefiro fazer reserva antecipada</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Special Requests */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Pedidos especiais (opcional)</h2>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Ex: Mesas juntas, cadeirões para crianças, aniversário..."
            className="w-full bg-card border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24"
          />
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Divisão de conta facilitada</p>
              <p className="text-xs text-muted-foreground">
                Cada pessoa pode pagar sua parte pelo app
              </p>
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Pedidos individuais</p>
              <p className="text-xs text-muted-foreground">
                Cada convidado pode fazer seu pedido no app
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t border-border bg-background">
        <button
          onClick={handleSubmit}
          disabled={reservationRequired && (!selectedDate || !selectedTime)}
          className={`w-full py-4 rounded-2xl font-semibold transition-all ${
            reservationRequired && (!selectedDate || !selectedTime)
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {reservationRequired
            ? selectedDate && selectedTime
              ? "Confirmar Reserva"
              : "Selecione data e horário"
            : "Entrar na Lista de Espera"}
        </button>
      </div>
    </div>
  );
};

export default GroupBookingScreenV2;
