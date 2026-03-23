import { useState } from "react";
import { Bell, MessageSquare, RefreshCw, Coffee, AlertTriangle, HelpCircle, Check, ArrowLeft } from "lucide-react";

interface CallWaiterScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

type CallReason = "order_more" | "question" | "refill" | "dessert" | "problem" | "other";

interface CallOption {
  id: CallReason;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const CallWaiterCasualScreenV2 = ({ onNavigate, onBack }: CallWaiterScreenProps) => {
  const [selectedReason, setSelectedReason] = useState<CallReason | null>(null);
  const [callSent, setCallSent] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const callOptions: CallOption[] = [
    {
      id: "order_more",
      label: "Pedir mais",
      description: "Adicionar itens ao pedido",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-primary/10 text-primary",
    },
    {
      id: "question",
      label: "Dúvida",
      description: "Perguntar sobre cardápio",
      icon: <HelpCircle className="h-5 w-5" />,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      id: "refill",
      label: "Refil",
      description: "Bebida ou acompanhamento",
      icon: <RefreshCw className="h-5 w-5" />,
      color: "bg-cyan-500/10 text-cyan-500",
    },
    {
      id: "dessert",
      label: "Sobremesa/Café",
      description: "Ver opções de sobremesa",
      icon: <Coffee className="h-5 w-5" />,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      id: "problem",
      label: "Problema",
      description: "Algo errado com o pedido",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-destructive/10 text-destructive",
    },
    {
      id: "other",
      label: "Outro",
      description: "Assistência geral",
      icon: <Bell className="h-5 w-5" />,
      color: "bg-muted text-muted-foreground",
    },
  ];

  const handleSendCall = () => {
    if (!selectedReason) return;
    setCallSent(true);
    // In production, this would send to WebSocket
    setTimeout(() => {
      setCallSent(false);
      setSelectedReason(null);
      setCustomMessage("");
    }, 5000);
  };

  if (callSent) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Chamada Enviada!</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Seu garçom foi notificado e virá em breve.
        </p>
        <div className="bg-muted/50 rounded-xl p-3 px-4">
          <p className="text-xs text-muted-foreground">
            Mesa 12 • {callOptions.find(o => o.id === selectedReason)?.label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background p-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Bell className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">Chamar Garçom</h1>
        <p className="text-sm text-muted-foreground">Por que você precisa de ajuda?</p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {callOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedReason(option.id)}
            className={`p-4 rounded-2xl border transition-all text-left ${
              selectedReason === option.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl ${option.color} flex items-center justify-center mb-2`}>
              {option.icon}
            </div>
            <p className="font-medium text-foreground text-sm">{option.label}</p>
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </button>
        ))}
      </div>

      {/* Custom Message (optional) */}
      {selectedReason && (
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">
            Mensagem adicional (opcional)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Ex: Preciso de mais guardanapos..."
            className="w-full bg-card border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-20"
          />
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSendCall}
        disabled={!selectedReason}
        className={`w-full py-4 rounded-2xl font-semibold transition-all ${
          selectedReason
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        {selectedReason ? "Chamar Garçom" : "Selecione um motivo"}
      </button>

      {/* Footer Info */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        O garçom receberá sua chamada instantaneamente no smartwatch.
      </p>
    </div>
  );
};

export default CallWaiterCasualScreenV2;
