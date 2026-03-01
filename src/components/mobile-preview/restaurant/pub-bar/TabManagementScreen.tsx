import { useState } from "react";
import { 
  CreditCard, 
  Users, 
  Clock, 
  DollarSign, 
  Plus, 
  Minus, 
  Search,
  MoreVertical,
  Receipt,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Beer,
  Coffee
} from "lucide-react";

type TabStatus = 'active' | 'pending_payment' | 'closed';

interface TabData {
  id: string;
  tableNumber: number;
  members: number;
  total: number;
  openedAt: string;
  status: TabStatus;
  preAuthAmount: number;
  lastItem?: string;
  items: number;
}

const mockTabs: TabData[] = [
  { 
    id: "tab_001", 
    tableNumber: 5, 
    members: 4, 
    total: 245.80, 
    openedAt: "19:30",
    status: 'active',
    preAuthAmount: 300,
    lastItem: "Chopp Pilsen 500ml",
    items: 12
  },
  { 
    id: "tab_002", 
    tableNumber: 12, 
    members: 2, 
    total: 89.90, 
    openedAt: "20:15",
    status: 'active',
    preAuthAmount: 150,
    lastItem: "Gin Tônica",
    items: 4
  },
  { 
    id: "tab_003", 
    tableNumber: 8, 
    members: 6, 
    total: 520.00, 
    openedAt: "18:45",
    status: 'pending_payment',
    preAuthAmount: 500,
    lastItem: "Whisky 12 anos",
    items: 18
  },
  { 
    id: "tab_004", 
    tableNumber: 3, 
    members: 3, 
    total: 156.50, 
    openedAt: "21:00",
    status: 'active',
    preAuthAmount: 200,
    lastItem: "Espresso Martini",
    items: 7
  },
];

const statusConfig: Record<TabStatus, { label: string; color: string; icon: any }> = {
  active: { 
    label: "Ativa", 
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2
  },
  pending_payment: { 
    label: "Aguardando Pgto", 
    color: "bg-warning/10 text-warning border-warning/20",
    icon: AlertCircle
  },
  closed: { 
    label: "Fechada", 
    color: "bg-muted/50 text-muted-foreground border-border",
    icon: XCircle
  },
};

export const TabManagementScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TabStatus | 'all'>('all');

  const filteredTabs = mockTabs.filter(tab => {
    const matchesSearch = tab.tableNumber.toString().includes(searchQuery) ||
      tab.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tab.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalActive = mockTabs.filter(t => t.status === 'active').length;
  const totalRevenue = mockTabs.reduce((sum, t) => sum + t.total, 0);
  const avgTicket = totalRevenue / mockTabs.length;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm opacity-80">Gerenciamento</p>
            <h1 className="font-display text-xl font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Comandas
            </h1>
          </div>
          <button className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{totalActive}</p>
            <p className="text-[10px] opacity-80">Ativas</p>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">R$ {totalRevenue.toFixed(0)}</p>
            <p className="text-[10px] opacity-80">Total</p>
          </div>
          <div className="p-2 rounded-xl bg-primary-foreground/10 backdrop-blur-sm text-center">
            <p className="text-lg font-bold">R$ {avgTicket.toFixed(0)}</p>
            <p className="text-[10px] opacity-80">Ticket Médio</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-5 py-3 border-b border-border bg-card/50">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar mesa ou comanda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(['all', 'active', 'pending_payment', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {status === 'all' ? 'Todas' : statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-3">
        <div className="space-y-3">
          {filteredTabs.map((tab) => {
            const config = statusConfig[tab.status];
            const StatusIcon = config.icon;
            const usagePercent = (tab.total / tab.preAuthAmount) * 100;
            
            return (
              <div
                key={tab.id}
                onClick={() => setSelectedTab(selectedTab === tab.id ? null : tab.id)}
                className={`p-4 rounded-2xl bg-card border-2 transition-all cursor-pointer ${
                  selectedTab === tab.id ? 'border-primary shadow-lg' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{tab.tableNumber}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Mesa {tab.tableNumber}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{tab.members} pessoas</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{tab.openedAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                    <button className="p-1 rounded-lg hover:bg-muted/50">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Pre-auth usage bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{tab.items} itens</span>
                    <span className={usagePercent > 80 ? 'text-warning font-medium' : 'text-muted-foreground'}>
                      {usagePercent.toFixed(0)}% do limite
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 100 ? 'bg-destructive' :
                        usagePercent > 80 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Beer className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{tab.lastItem}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ {tab.total.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Pré-auth: R$ {tab.preAuthAmount}
                    </p>
                  </div>
                </div>

                {/* Expanded Actions */}
                {selectedTab === tab.id && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-primary/10 text-primary">
                      <Plus className="h-4 w-4" />
                      <span className="text-[10px] font-medium">Adicionar</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-accent/10 text-accent">
                      <Receipt className="h-4 w-4" />
                      <span className="text-[10px] font-medium">Ver Conta</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-success/10 text-success">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-[10px] font-medium">Fechar</span>
                    </button>
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
            <p className="text-sm text-muted-foreground">Total em Comandas Ativas</p>
            <p className="text-xl font-bold text-primary">
              R$ {mockTabs.filter(t => t.status === 'active').reduce((s, t) => s + t.total, 0).toFixed(2)}
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Nova Comanda
          </button>
        </div>
      </div>
    </div>
  );
};
