import { useState, useEffect } from "react";
import { Clock, Users, Wine, Bell, MapPin, ChevronRight, ArrowLeft } from "lucide-react";

interface WaitlistScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

interface WaitlistEntry {
  position: number;
  estimatedWait: number;
  partySize: number;
  canOrderDrinks: boolean;
}

export const WaitlistScreenV2 = ({ onNavigate, onBack }: WaitlistScreenProps) => {
  const [entry, setEntry] = useState<WaitlistEntry>({
    position: 4,
    estimatedWait: 15,
    partySize: 4,
    canOrderDrinks: true,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Simulate position updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEntry((prev) => ({
        ...prev,
        position: Math.max(1, prev.position - 1),
        estimatedWait: Math.max(5, prev.estimatedWait - 5),
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full bg-background p-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Lista de Espera</h1>
        <p className="text-sm text-muted-foreground">Você está na fila!</p>
      </div>

      {/* Position Card */}
      <div className="bg-primary/10 rounded-3xl p-6 mb-4 text-center">
        <div className="text-6xl font-bold text-primary mb-2">
          #{entry.position}
        </div>
        <p className="text-sm text-muted-foreground">sua posição na fila</p>
      </div>

      {/* Estimated Wait */}
      <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo estimado</p>
              <p className="font-semibold text-foreground">~{entry.estimatedWait} minutos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Baseado em</p>
            <p className="text-xs text-primary">ocupação atual</p>
          </div>
        </div>
      </div>

      {/* Party Size */}
      <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tamanho do grupo</p>
            <p className="font-semibold text-foreground">{entry.partySize} pessoas</p>
          </div>
        </div>
      </div>

      {/* Section: While You Wait */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Enquanto espera</h2>
        
        {/* Order Drinks */}
        {entry.canOrderDrinks && (
          <button className="w-full bg-card rounded-2xl p-4 border border-border flex items-center justify-between mb-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Wine className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Pedir Bebidas</p>
                <p className="text-xs text-muted-foreground">Valores vão para sua comanda</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        {/* Walk Around */}
        <button 
          className="w-full bg-card rounded-2xl p-4 border border-border flex items-center justify-between hover:bg-muted/50 transition-colors"
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Passear por perto</p>
              <p className="text-xs text-muted-foreground">
                {notificationsEnabled 
                  ? "Você será notificado quando a mesa estiver próxima" 
                  : "Ative notificações para ser avisado"}
              </p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            notificationsEnabled ? "bg-primary" : "bg-muted"
          }`}>
            <Bell className={`h-3 w-3 ${notificationsEnabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
          </div>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-muted/50 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground text-center">
          💡 A estimativa de tempo é baseada na ocupação atual e tempo médio de permanência dos clientes.
        </p>
      </div>
    </div>
  );
};

export default WaitlistScreenV2;
