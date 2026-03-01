import { useState } from "react";
import { 
  Users, 
  Clock, 
  UserPlus, 
  UserMinus, 
  Bell,
  Star,
  Gift,
  AlertTriangle,
  ChevronRight,
  Timer,
  CheckCircle2,
  Phone
} from "lucide-react";

type QueuePriority = 'vip' | 'guest_list' | 'birthday' | 'general';
type QueueStatus = 'waiting' | 'called' | 'no_show';

interface QueueEntry {
  id: string;
  customerName: string;
  phone: string;
  partySize: number;
  priority: QueuePriority;
  position: number;
  waitTime: number; // minutes
  status: QueueStatus;
  joinedAt: string;
  calledAt?: string;
}

const mockQueue: QueueEntry[] = [
  {
    id: "q_001",
    customerName: "Roberto Almeida",
    phone: "11 98765-4321",
    partySize: 4,
    priority: 'vip',
    position: 1,
    waitTime: 5,
    status: 'waiting',
    joinedAt: "23:55"
  },
  {
    id: "q_002",
    customerName: "Fernanda Lima",
    phone: "11 91234-5678",
    partySize: 2,
    priority: 'guest_list',
    position: 2,
    waitTime: 8,
    status: 'waiting',
    joinedAt: "23:52"
  },
  {
    id: "q_003",
    customerName: "Carlos Eduardo",
    phone: "11 99999-8888",
    partySize: 6,
    priority: 'birthday',
    position: 3,
    waitTime: 12,
    status: 'called',
    joinedAt: "23:48",
    calledAt: "00:00"
  },
  {
    id: "q_004",
    customerName: "Juliana Martins",
    phone: "11 97777-6666",
    partySize: 3,
    priority: 'general',
    position: 4,
    waitTime: 15,
    status: 'waiting',
    joinedAt: "23:45"
  },
  {
    id: "q_005",
    customerName: "Marcos Silva",
    phone: "11 96666-5555",
    partySize: 2,
    priority: 'general',
    position: 5,
    waitTime: 18,
    status: 'waiting',
    joinedAt: "23:42"
  },
];

const priorityConfig: Record<QueuePriority, { label: string; icon: any; color: string }> = {
  vip: { 
    label: "VIP", 
    icon: Star, 
    color: "bg-warning/10 text-warning border-warning/20" 
  },
  guest_list: { 
    label: "Lista", 
    icon: Users, 
    color: "bg-accent/10 text-accent border-accent/20" 
  },
  birthday: { 
    label: "Aniver.", 
    icon: Gift, 
    color: "bg-success/10 text-success border-success/20" 
  },
  general: { 
    label: "Geral", 
    icon: Users, 
    color: "bg-muted text-muted-foreground border-border" 
  },
};

export const QueueManagementScreen = () => {
  const [queue, setQueue] = useState(mockQueue);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const waitingCount = queue.filter(q => q.status === 'waiting').length;
  const calledCount = queue.filter(q => q.status === 'called').length;
  const avgWait = Math.round(queue.filter(q => q.status === 'waiting').reduce((s, q) => s + q.waitTime, 0) / Math.max(waitingCount, 1));

  const callNext = (id: string) => {
    setQueue(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'called' as QueueStatus, calledAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } : q
    ));
  };

  const markNoShow = (id: string) => {
    setQueue(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'no_show' as QueueStatus } : q
    ));
  };

  const admitEntry = (id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-80">Fila Virtual</p>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento
            </h1>
          </div>
          <button className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
            <UserPlus className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{waitingCount}</p>
            <p className="text-[10px] opacity-80">Aguardando</p>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{calledCount}</p>
            <p className="text-[10px] opacity-80">Chamados</p>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{avgWait}min</p>
            <p className="text-[10px] opacity-80">Espera Média</p>
          </div>
        </div>
      </div>

      {/* Called Alert */}
      {calledCount > 0 && (
        <div className="px-5 py-3 bg-warning/10 border-b border-warning/20 flex items-center gap-2">
          <Bell className="h-4 w-4 text-warning animate-pulse" />
          <span className="text-sm font-medium text-warning">
            {calledCount} {calledCount === 1 ? 'pessoa chamada' : 'pessoas chamadas'} aguardando entrada
          </span>
        </div>
      )}

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-3">
        <div className="space-y-3">
          {queue.filter(q => q.status !== 'no_show').map((entry) => {
            const config = priorityConfig[entry.priority];
            const PriorityIcon = config.icon;
            const isSelected = selectedEntry === entry.id;
            const isCalled = entry.status === 'called';
            
            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(isSelected ? null : entry.id)}
                className={`p-4 rounded-2xl bg-card border-2 transition-all cursor-pointer ${
                  isCalled ? 'border-warning bg-warning/5' :
                  isSelected ? 'border-primary shadow-lg' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                      isCalled ? 'bg-warning text-warning-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                      {entry.position}
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {entry.customerName}
                        {isCalled && (
                          <span className="text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded animate-pulse">
                            CHAMADO
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{entry.partySize} pessoas</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                    <PriorityIcon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.joinedAt}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      entry.waitTime > 15 ? 'text-destructive font-medium' : ''
                    }`}>
                      <Timer className="h-3 w-3" />
                      {entry.waitTime} min
                    </span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </div>

                {/* Expanded Actions */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{entry.phone}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {!isCalled ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); callNext(entry.id); }}
                          className="col-span-2 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <Bell className="h-4 w-4" />
                          Chamar
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); admitEntry(entry.id); }}
                          className="col-span-2 py-2 rounded-xl bg-success text-success-foreground font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Entrou
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); markNoShow(entry.id); }}
                        className="py-2 rounded-xl bg-destructive/10 text-destructive font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Call Next Footer */}
      <div className="px-5 py-4 bg-card border-t border-border">
        <button 
          onClick={() => {
            const next = queue.find(q => q.status === 'waiting');
            if (next) callNext(next.id);
          }}
          disabled={waitingCount === 0}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Bell className="h-5 w-5" />
          Chamar Próximo da Fila
        </button>
      </div>
    </div>
  );
};
