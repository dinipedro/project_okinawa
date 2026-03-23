import { useState } from "react";
import { 
  Bell, 
  Clock, 
  User, 
  Check, 
  X,
  MessageCircle,
  AlertTriangle,
  Coffee,
  Receipt,
  HelpCircle,
  Timer,
  CheckCircle2
} from "lucide-react";

type CallType = 'waiter' | 'bill' | 'help' | 'refill';
type CallStatus = 'pending' | 'acknowledged' | 'resolved';

interface WaiterCall {
  id: string;
  tableNumber: number;
  type: CallType;
  message?: string;
  createdAt: string;
  waitTime: number; // in minutes
  status: CallStatus;
  acknowledgedBy?: string;
  customerName?: string;
}

const mockCalls: WaiterCall[] = [
  {
    id: "call_001",
    tableNumber: 5,
    type: 'waiter',
    createdAt: "21:35",
    waitTime: 2,
    status: 'pending',
    customerName: "João S."
  },
  {
    id: "call_002",
    tableNumber: 12,
    type: 'bill',
    createdAt: "21:33",
    waitTime: 4,
    status: 'pending',
    customerName: "Maria C."
  },
  {
    id: "call_003",
    tableNumber: 8,
    type: 'help',
    message: "Preciso de guardanapos extras",
    createdAt: "21:30",
    waitTime: 7,
    status: 'acknowledged',
    acknowledgedBy: "Carlos",
    customerName: "Pedro M."
  },
  {
    id: "call_004",
    tableNumber: 3,
    type: 'refill',
    createdAt: "21:28",
    waitTime: 9,
    status: 'pending',
    customerName: "Ana L."
  },
];

const callTypeConfig: Record<CallType, { label: string; icon: any; color: string }> = {
  waiter: { 
    label: "Chamar Garçom", 
    icon: User, 
    color: "bg-primary/10 text-primary border-primary/20" 
  },
  bill: { 
    label: "Pedir Conta", 
    icon: Receipt, 
    color: "bg-success/10 text-success border-success/20" 
  },
  help: { 
    label: "Ajuda", 
    icon: HelpCircle, 
    color: "bg-warning/10 text-warning border-warning/20" 
  },
  refill: { 
    label: "Reposição", 
    icon: Coffee, 
    color: "bg-accent/10 text-accent border-accent/20" 
  },
};

export const WaiterCallsScreen = () => {
  const [calls, setCalls] = useState(mockCalls);
  const [filter, setFilter] = useState<CallStatus | 'all'>('all');

  const pendingCount = calls.filter(c => c.status === 'pending').length;
  const avgWaitTime = Math.round(
    calls.filter(c => c.status === 'pending').reduce((s, c) => s + c.waitTime, 0) / 
    Math.max(pendingCount, 1)
  );

  const handleAcknowledge = (callId: string) => {
    setCalls(prev => prev.map(c => 
      c.id === callId ? { ...c, status: 'acknowledged' as CallStatus, acknowledgedBy: "Você" } : c
    ));
  };

  const handleResolve = (callId: string) => {
    setCalls(prev => prev.map(c => 
      c.id === callId ? { ...c, status: 'resolved' as CallStatus } : c
    ));
  };

  const filteredCalls = calls.filter(c => 
    filter === 'all' ? c.status !== 'resolved' : c.status === filter
  );

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header with Alert Banner */}
      <div className="bg-primary text-primary-foreground">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-80">Central de</p>
              <h1 className="font-display text-xl font-bold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Chamados
              </h1>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-bold">{pendingCount}</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
              <p className="text-lg font-bold">{pendingCount}</p>
              <p className="text-[10px] opacity-80">Pendentes</p>
            </div>
            <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
              <p className="text-lg font-bold">{avgWaitTime}min</p>
              <p className="text-[10px] opacity-80">Tempo Médio</p>
            </div>
            <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
              <p className="text-lg font-bold">{calls.filter(c => c.status === 'resolved').length}</p>
              <p className="text-[10px] opacity-80">Resolvidos</p>
            </div>
          </div>
        </div>

        {/* Urgent Alert */}
        {calls.some(c => c.status === 'pending' && c.waitTime >= 5) && (
          <div className="px-5 py-2 bg-destructive/90 flex items-center gap-2">
            <Timer className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">
              {calls.filter(c => c.status === 'pending' && c.waitTime >= 5).length} chamados esperando há mais de 5 min
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="px-5 py-3 border-b border-border bg-card/50">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(['all', 'pending', 'acknowledged'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {status === 'all' ? 'Ativos' : status === 'pending' ? 'Pendentes' : 'Em Atendimento'}
            </button>
          ))}
        </div>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-3">
        <div className="space-y-3">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Nenhum chamado pendente</p>
              <p className="text-xs text-muted-foreground/70">Todos os clientes estão sendo atendidos</p>
            </div>
          ) : (
            filteredCalls.map((call) => {
              const config = callTypeConfig[call.type];
              const TypeIcon = config.icon;
              const isUrgent = call.status === 'pending' && call.waitTime >= 5;
              
              return (
                <div
                  key={call.id}
                  className={`p-4 rounded-2xl bg-card border-2 transition-all ${
                    isUrgent ? 'border-destructive animate-pulse' :
                    call.status === 'acknowledged' ? 'border-success/50' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        isUrgent ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        <span className={`text-lg font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
                          {call.tableNumber}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          Mesa {call.tableNumber}
                          {isUrgent && (
                            <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                              URGENTE
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground">{call.customerName}</p>
                      </div>
                    </div>
                    
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                      <TypeIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </div>

                  {call.message && (
                    <div className="mb-3 p-2 rounded-lg bg-muted/50 flex items-start gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">{call.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {call.createdAt}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${
                        call.waitTime >= 5 ? 'text-destructive' : 
                        call.waitTime >= 3 ? 'text-warning' : 'text-muted-foreground'
                      }`}>
                        <Timer className="h-3 w-3" />
                        {call.waitTime} min
                      </span>
                      {call.acknowledgedBy && (
                        <span className="flex items-center gap-1 text-success">
                          <User className="h-3 w-3" />
                          {call.acknowledgedBy}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {call.status === 'pending' && (
                        <button 
                          onClick={() => handleAcknowledge(call.id)}
                          className="p-2 rounded-lg bg-primary text-primary-foreground"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {call.status === 'acknowledged' && (
                        <button 
                          onClick={() => handleResolve(call.id)}
                          className="p-2 rounded-lg bg-success text-success-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="px-5 py-4 bg-card border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 py-3 rounded-xl bg-primary/10 text-primary font-medium text-sm flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" />
            Ver Histórico
          </button>
          <button className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
            <User className="h-4 w-4" />
            Atender Próximo
          </button>
        </div>
      </div>
    </div>
  );
};
