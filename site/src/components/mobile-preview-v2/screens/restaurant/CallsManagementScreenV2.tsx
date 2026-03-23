import { useState } from "react";
import { ArrowLeft, Bell, Clock, User, MessageSquare, AlertTriangle, Check, Filter } from "lucide-react";

interface CallsManagementScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

interface WaiterCall {
  id: string;
  tableNumber: string;
  reason: "order_more" | "question" | "refill" | "dessert" | "problem" | "other";
  reasonLabel: string;
  message?: string;
  timestamp: Date;
  status: "pending" | "acknowledged" | "resolved";
  waiterName?: string;
}

const reasonConfig = {
  order_more: { label: "Pedir mais", icon: MessageSquare, color: "bg-primary/10 text-primary" },
  question: { label: "Dúvida", icon: Bell, color: "bg-info/10 text-info" },
  refill: { label: "Refil", icon: Bell, color: "bg-secondary/10 text-secondary" },
  dessert: { label: "Sobremesa/Café", icon: Bell, color: "bg-warning/10 text-warning" },
  problem: { label: "Problema", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  other: { label: "Outro", icon: Bell, color: "bg-muted text-muted-foreground" },
};

export const CallsManagementScreenV2 = ({ onNavigate, onBack }: CallsManagementScreenProps) => {
  const [filter, setFilter] = useState<"all" | "pending" | "acknowledged">("pending");

  const [calls, setCalls] = useState<WaiterCall[]>([
    {
      id: "1",
      tableNumber: "12",
      reason: "refill",
      reasonLabel: "Refil",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: "pending",
    },
    {
      id: "2",
      tableNumber: "8",
      reason: "order_more",
      reasonLabel: "Pedir mais",
      message: "Mais uma porção de batata frita",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "pending",
    },
    {
      id: "3",
      tableNumber: "15",
      reason: "problem",
      reasonLabel: "Problema",
      message: "Prato veio frio",
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      status: "acknowledged",
      waiterName: "Carlos",
    },
    {
      id: "4",
      tableNumber: "3",
      reason: "dessert",
      reasonLabel: "Sobremesa/Café",
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      status: "resolved",
      waiterName: "Ana",
    },
  ]);

  const filteredCalls = calls.filter((call) => {
    if (filter === "all") return true;
    return call.status === filter;
  });

  const pendingCount = calls.filter((c) => c.status === "pending").length;
  const acknowledgedCount = calls.filter((c) => c.status === "acknowledged").length;

  const handleAcknowledge = (callId: string) => {
    setCalls((prev) =>
      prev.map((c) =>
        c.id === callId ? { ...c, status: "acknowledged" as const, waiterName: "Você" } : c
      )
    );
  };

  const handleResolve = (callId: string) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: "resolved" as const } : c))
    );
  };

  const formatTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}min`;
    return `${Math.floor(minutes / 60)}h`;
  };

  const getStatusBadge = (status: WaiterCall["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
            Pendente
          </span>
        );
      case "acknowledged":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">
            Em andamento
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
            Resolvido
          </span>
        );
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Chamadas de Garçom</h1>
            <p className="text-xs text-muted-foreground">
              {pendingCount} pendentes • {acknowledgedCount} em andamento
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { id: "pending", label: "Pendentes", count: pendingCount },
            { id: "acknowledged", label: "Em Andamento", count: acknowledgedCount },
            { id: "all", label: "Todas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhuma chamada {filter === "pending" ? "pendente" : ""}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCalls.map((call) => {
              const config = reasonConfig[call.reason];
              const Icon = config.icon;

              return (
                <div
                  key={call.id}
                  className={`bg-card rounded-2xl border p-4 transition-all ${
                    call.status === "pending" ? "border-destructive/30" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">Mesa {call.tableNumber}</span>
                          <span className="text-sm text-muted-foreground">• {config.label}</span>
                        </div>
                        {getStatusBadge(call.status)}
                      </div>

                      {call.message && (
                        <p className="text-sm text-foreground mb-2">"{call.message}"</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(call.timestamp)}
                        </div>
                        {call.waiterName && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {call.waiterName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {call.status !== "resolved" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      {call.status === "pending" && (
                        <button
                          onClick={() => handleAcknowledge(call.id)}
                          className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Aceitar
                        </button>
                      )}
                      {call.status === "acknowledged" && (
                        <button
                          onClick={() => handleResolve(call.id)}
                          className="flex-1 py-2 rounded-xl bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors"
                        >
                          Marcar como Resolvido
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate("tables")}
                        className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                      >
                        Ver Mesa
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{calls.length}</p>
            <p className="text-xs text-muted-foreground">Total hoje</p>
          </div>
          <div>
            <p className="text-lg font-bold text-primary">2.5min</p>
            <p className="text-xs text-muted-foreground">Tempo médio</p>
          </div>
          <div>
            <p className="text-lg font-bold text-success">92%</p>
            <p className="text-xs text-muted-foreground">Resolvidos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallsManagementScreenV2;
