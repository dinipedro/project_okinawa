import { useState } from "react";
import { 
  Crown, 
  Users, 
  DollarSign, 
  Clock, 
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Receipt,
  Sparkles,
  MapPin
} from "lucide-react";

type VipStatus = 'reserved' | 'occupied' | 'available' | 'closing';

interface VipTable {
  id: string;
  name: string;
  location: string;
  capacity: number;
  minimumSpend: number;
  currentSpend: number;
  status: VipStatus;
  reservation?: {
    customerName: string;
    partySize: number;
    arrivalTime?: string;
    depositPaid: number;
  };
}

const mockTables: VipTable[] = [
  {
    id: "vip_001",
    name: "Camarote 01",
    location: "Área VIP - Frente Palco",
    capacity: 10,
    minimumSpend: 3000,
    currentSpend: 2450,
    status: 'occupied',
    reservation: {
      customerName: "Ricardo Mendes",
      partySize: 8,
      arrivalTime: "23:30",
      depositPaid: 1000
    }
  },
  {
    id: "vip_002",
    name: "Camarote 02",
    location: "Área VIP - Lateral",
    capacity: 8,
    minimumSpend: 2000,
    currentSpend: 0,
    status: 'reserved',
    reservation: {
      customerName: "Fernanda Oliveira",
      partySize: 6,
      depositPaid: 800
    }
  },
  {
    id: "vip_003",
    name: "Camarote 03",
    location: "Área VIP - Mezanino",
    capacity: 12,
    minimumSpend: 5000,
    currentSpend: 4800,
    status: 'closing',
    reservation: {
      customerName: "Carlos Alberto",
      partySize: 10,
      arrivalTime: "22:00",
      depositPaid: 2000
    }
  },
  {
    id: "vip_004",
    name: "Camarote 04",
    location: "Área VIP - Frente Palco",
    capacity: 8,
    minimumSpend: 2500,
    currentSpend: 0,
    status: 'available'
  },
];

const statusConfig: Record<VipStatus, { label: string; color: string; bgColor: string }> = {
  available: { 
    label: "Disponível", 
    color: "text-success",
    bgColor: "bg-success/10 border-success/20"
  },
  reserved: { 
    label: "Reservado", 
    color: "text-warning",
    bgColor: "bg-warning/10 border-warning/20"
  },
  occupied: { 
    label: "Ocupado", 
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20"
  },
  closing: { 
    label: "Fechando", 
    color: "text-accent",
    bgColor: "bg-accent/10 border-accent/20"
  },
};

export const VipTableManagementScreen = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [filter, setFilter] = useState<VipStatus | 'all'>('all');

  const filteredTables = mockTables.filter(t => 
    filter === 'all' || t.status === filter
  );

  const totalRevenue = mockTables.reduce((s, t) => s + t.currentSpend, 0);
  const occupiedCount = mockTables.filter(t => t.status === 'occupied').length;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-br from-warning via-warning to-accent text-warning-foreground">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-80">Gestão de</p>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Camarotes
            </h1>
          </div>
          <button className="p-2 rounded-xl bg-warning-foreground/10 backdrop-blur-sm">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-warning-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{occupiedCount}/{mockTables.length}</p>
            <p className="text-[10px] opacity-80">Ocupados</p>
          </div>
          <div className="p-2 rounded-xl bg-warning-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">R$ {(totalRevenue / 1000).toFixed(1)}k</p>
            <p className="text-[10px] opacity-80">Consumo</p>
          </div>
          <div className="p-2 rounded-xl bg-warning-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">
              {mockTables.reduce((s, t) => s + (t.reservation?.partySize || 0), 0)}
            </p>
            <p className="text-[10px] opacity-80">Pessoas</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-3 border-b border-border bg-card/50">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(['all', 'occupied', 'reserved', 'available', 'closing'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {status === 'all' ? 'Todos' : statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-3">
        <div className="space-y-3">
          {filteredTables.map((table) => {
            const config = statusConfig[table.status];
            const isSelected = selectedTable === table.id;
            const spendProgress = (table.currentSpend / table.minimumSpend) * 100;
            const remainingSpend = Math.max(0, table.minimumSpend - table.currentSpend);
            const hasMetMinimum = table.currentSpend >= table.minimumSpend;
            
            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(isSelected ? null : table.id)}
                className={`p-4 rounded-2xl bg-card border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-primary shadow-lg' : `border-border ${config.bgColor}`
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-warning to-accent flex items-center justify-center">
                      <Crown className="h-6 w-6 text-warning-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {table.name}
                        {table.status === 'closing' && (
                          <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{table.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${config.bgColor} ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {/* Reservation Info */}
                {table.reservation && (
                  <div className="mb-3 p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{table.reservation.customerName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{table.reservation.partySize}/{table.capacity}</span>
                          {table.reservation.arrivalTime && (
                            <>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{table.reservation.arrivalTime}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Depósito</p>
                        <p className="text-sm font-bold text-success">R$ {table.reservation.depositPaid}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Minimum Spend Progress */}
                {(table.status === 'occupied' || table.status === 'closing') && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Consumo Mínimo</span>
                      <span className={hasMetMinimum ? 'text-success font-medium' : 'text-muted-foreground'}>
                        R$ {table.currentSpend.toLocaleString()} / R$ {table.minimumSpend.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          hasMetMinimum ? 'bg-success' : spendProgress > 70 ? 'bg-warning' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(spendProgress, 100)}%` }}
                      />
                    </div>
                    {!hasMetMinimum && (
                      <p className="text-xs text-warning mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Faltam R$ {remainingSpend.toLocaleString()} para atingir o mínimo
                      </p>
                    )}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Capacidade: {table.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Mín. R$ {table.minimumSpend.toLocaleString()}</span>
                  </div>
                </div>

                {/* Expanded Actions */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
                    {table.status === 'available' ? (
                      <button className="col-span-3 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Reserva
                      </button>
                    ) : table.status === 'reserved' ? (
                      <>
                        <button className="col-span-2 py-2 rounded-xl bg-success text-success-foreground font-medium text-sm flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Check-in
                        </button>
                        <button className="py-2 rounded-xl bg-destructive/10 text-destructive font-medium text-sm flex items-center justify-center gap-2">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm flex items-center justify-center gap-2">
                          <Plus className="h-4 w-4" />
                          Item
                        </button>
                        <button className="py-2 rounded-xl bg-accent/10 text-accent font-medium text-sm flex items-center justify-center gap-2">
                          <Receipt className="h-4 w-4" />
                          Conta
                        </button>
                        <button className="py-2 rounded-xl bg-success/10 text-success font-medium text-sm flex items-center justify-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Fechar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="px-5 py-4 bg-card border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Faturamento Camarotes</p>
            <p className="text-xl font-bold text-warning">
              R$ {totalRevenue.toLocaleString()}
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-warning text-warning-foreground font-medium text-sm flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Nova Reserva
          </button>
        </div>
      </div>
    </div>
  );
};
