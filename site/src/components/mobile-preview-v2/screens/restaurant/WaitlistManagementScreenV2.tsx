import { useState } from "react";
import { Users, Clock, Bell, Phone, ChevronRight, Check, X, Wine } from "lucide-react";

interface WaitlistCustomer {
  id: string;
  name: string;
  partySize: number;
  waitTime: number;
  phone: string;
  hasAdvanceOrder: boolean;
  notes?: string;
}

export const WaitlistManagementScreenV2 = () => {
  const [waitlist, setWaitlist] = useState<WaitlistCustomer[]>([
    { id: "1", name: "João Silva", partySize: 4, waitTime: 25, phone: "11999999999", hasAdvanceOrder: true },
    { id: "2", name: "Maria Santos", partySize: 2, waitTime: 18, phone: "11988888888", hasAdvanceOrder: false },
    { id: "3", name: "Pedro Costa", partySize: 6, waitTime: 12, phone: "11977777777", hasAdvanceOrder: true, notes: "Aniversário" },
    { id: "4", name: "Ana Oliveira", partySize: 3, waitTime: 5, phone: "11966666666", hasAdvanceOrder: false },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const callNextCustomer = (id: string) => {
    // Notify customer via push/SMS
    setWaitlist((prev) => prev.filter((c) => c.id !== id));
    setSelectedCustomer(null);
  };

  const removeFromWaitlist = (id: string) => {
    setWaitlist((prev) => prev.filter((c) => c.id !== id));
    setSelectedCustomer(null);
  };

  const totalWaiting = waitlist.length;
  const avgWaitTime = Math.round(waitlist.reduce((sum, c) => sum + c.waitTime, 0) / waitlist.length);

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background p-4">
        <h1 className="text-lg font-bold text-foreground mb-4">Lista de Espera</h1>
        
        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Na fila</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalWaiting}</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Tempo médio</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgWaitTime} min</p>
          </div>
        </div>
      </div>

      {/* Waitlist */}
      <div className="flex-1 overflow-y-auto p-4">
        {waitlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhum cliente na fila</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitlist.map((customer, index) => (
              <div
                key={customer.id}
                className={`bg-card rounded-2xl border transition-all ${
                  selectedCustomer === customer.id
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                <button
                  onClick={() => setSelectedCustomer(
                    selectedCustomer === customer.id ? null : customer.id
                  )}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.partySize} pessoas • {customer.waitTime} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.hasAdvanceOrder && (
                        <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
                          <Wine className="h-3 w-3 text-warning" />
                        </div>
                      )}
                      <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                        selectedCustomer === customer.id ? "rotate-90" : ""
                      }`} />
                    </div>
                  </div>
                  {customer.notes && (
                    <div className="bg-muted/50 rounded-lg px-3 py-1 inline-block">
                      <span className="text-xs text-muted-foreground">{customer.notes}</span>
                    </div>
                  )}
                </button>

                {/* Expanded Actions */}
                {selectedCustomer === customer.id && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => callNextCustomer(customer.id)}
                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
                      >
                        <Bell className="h-4 w-4" />
                        Chamar Cliente
                      </button>
                      <button
                        onClick={() => {}}
                        className="py-3 px-4 rounded-xl bg-muted text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromWaitlist(customer.id)}
                      className="w-full py-3 rounded-xl border border-destructive/30 text-destructive font-medium flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remover da Fila
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Button */}
      <div className="p-4 border-t border-border">
        <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
          + Adicionar à Fila
        </button>
      </div>
    </div>
  );
};

export default WaitlistManagementScreenV2;
