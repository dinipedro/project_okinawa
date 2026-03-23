import { useState } from "react";
import { 
  QrCode, 
  UserCheck, 
  UserX, 
  Search, 
  Clock, 
  Users,
  Ticket,
  Star,
  Gift,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Camera
} from "lucide-react";

type EntryStatus = 'valid' | 'used' | 'expired' | 'invalid';
type EntryType = 'ticket' | 'guest_list' | 'vip' | 'birthday';

interface EntryValidation {
  id: string;
  customerName: string;
  type: EntryType;
  status: EntryStatus;
  ticketType?: string;
  companions?: number;
  validatedAt?: string;
  consumptionCredit?: number;
}

const recentValidations: EntryValidation[] = [
  {
    id: "entry_001",
    customerName: "João Silva",
    type: 'ticket',
    status: 'valid',
    ticketType: "Open Bar",
    companions: 0,
    validatedAt: "23:45",
    consumptionCredit: 100
  },
  {
    id: "entry_002",
    customerName: "Maria Santos",
    type: 'guest_list',
    status: 'valid',
    companions: 2,
    validatedAt: "23:42"
  },
  {
    id: "entry_003",
    customerName: "Pedro Costa",
    type: 'vip',
    status: 'valid',
    ticketType: "Camarote Premium",
    companions: 5,
    validatedAt: "23:38",
    consumptionCredit: 500
  },
  {
    id: "entry_004",
    customerName: "Ana Ferreira",
    type: 'birthday',
    status: 'valid',
    companions: 3,
    validatedAt: "23:35"
  },
];

const entryTypeConfig: Record<EntryType, { label: string; icon: any; color: string }> = {
  ticket: { 
    label: "Ingresso", 
    icon: Ticket, 
    color: "bg-primary/10 text-primary border-primary/20" 
  },
  guest_list: { 
    label: "Lista", 
    icon: Users, 
    color: "bg-accent/10 text-accent border-accent/20" 
  },
  vip: { 
    label: "VIP", 
    icon: Star, 
    color: "bg-warning/10 text-warning border-warning/20" 
  },
  birthday: { 
    label: "Aniversário", 
    icon: Gift, 
    color: "bg-success/10 text-success border-success/20" 
  },
};

export const DoorControlScreen = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastScan, setLastScan] = useState<EntryValidation | null>(null);

  const todayStats = {
    total: 342,
    vip: 28,
    guestList: 45,
    tickets: 269
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScan({
        id: "scan_new",
        customerName: "Lucas Mendes",
        type: 'ticket',
        status: 'valid',
        ticketType: "Pista + 1 Drink",
        consumptionCredit: 50
      });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-80">Controle de</p>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Entrada
            </h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{todayStats.total}</p>
            <p className="text-xs opacity-80">entradas hoje</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{todayStats.vip}</p>
            <p className="text-[10px] opacity-80">VIP</p>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{todayStats.guestList}</p>
            <p className="text-[10px] opacity-80">Lista</p>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{todayStats.tickets}</p>
            <p className="text-[10px] opacity-80">Ingressos</p>
          </div>
        </div>
      </div>

      {/* QR Scanner Area */}
      <div className="px-5 py-4">
        <button
          onClick={simulateScan}
          disabled={isScanning}
          className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
            isScanning 
              ? 'bg-primary/10 border-primary animate-pulse' 
              : 'bg-muted/30 border-border hover:border-primary hover:bg-primary/5'
          }`}
        >
          {isScanning ? (
            <>
              <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Escaneando...</p>
            </>
          ) : (
            <>
              <Camera className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Toque para escanear QR Code</p>
            </>
          )}
        </button>

        {/* Last Scan Result */}
        {lastScan && (
          <div className={`mt-3 p-4 rounded-2xl border-2 ${
            lastScan.status === 'valid' 
              ? 'bg-success/10 border-success' 
              : 'bg-destructive/10 border-destructive'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {lastScan.status === 'valid' ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
                <span className={`font-bold ${
                  lastScan.status === 'valid' ? 'text-success' : 'text-destructive'
                }`}>
                  {lastScan.status === 'valid' ? 'ENTRADA AUTORIZADA' : 'ENTRADA NEGADA'}
                </span>
              </div>
              <button onClick={() => setLastScan(null)} className="text-muted-foreground">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <p className="font-semibold">{lastScan.customerName}</p>
            <p className="text-sm text-muted-foreground">{lastScan.ticketType}</p>
            {lastScan.consumptionCredit && (
              <p className="text-xs mt-1">
                Crédito: <span className="font-bold">R$ {lastScan.consumptionCredit}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Recent Validations */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Últimas Entradas</h3>
        <div className="space-y-2">
          {recentValidations.map((entry) => {
            const config = entryTypeConfig[entry.type];
            const TypeIcon = config.icon;
            
            return (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-card border border-border flex items-center gap-3"
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.color.split(' ')[0]}`}>
                  <TypeIcon className={`h-5 w-5 ${config.color.split(' ')[1]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.customerName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{config.label}</span>
                    {entry.companions !== undefined && entry.companions > 0 && (
                      <>
                        <span>•</span>
                        <span>+{entry.companions}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{entry.validatedAt}</p>
                  {entry.consumptionCredit && (
                    <p className="text-xs font-medium text-success">R$ {entry.consumptionCredit}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Entry */}
      <div className="px-5 py-4 bg-card border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 py-3 rounded-xl bg-success text-success-foreground font-medium text-sm flex items-center justify-center gap-2">
            <UserCheck className="h-5 w-5" />
            Entrada Manual
          </button>
          <button className="flex-1 py-3 rounded-xl bg-destructive/10 text-destructive font-medium text-sm flex items-center justify-center gap-2">
            <UserX className="h-5 w-5" />
            Negar Entrada
          </button>
        </div>
      </div>
    </div>
  );
};
