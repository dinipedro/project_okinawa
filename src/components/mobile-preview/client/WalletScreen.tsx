import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Gift, ChevronRight } from "lucide-react";

const transactions = [
  { id: 1, type: "credit", description: "Cashback - Sakura Ramen", amount: 5.90, date: "Hoje, 14:30" },
  { id: 2, type: "debit", description: "Pagamento - Café Lumière", amount: -28.50, date: "Ontem, 10:15" },
  { id: 3, type: "credit", description: "Bônus de indicação", amount: 20.00, date: "12/12, 09:00" },
];

export const WalletScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4">
        <h1 className="font-display text-2xl font-bold">Carteira</h1>
      </div>

      {/* Balance Card */}
      <div className="mx-5 p-5 rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="text-sm opacity-90">Saldo disponível</span>
          </div>
          <button className="p-2 rounded-full bg-primary-foreground/20">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-3xl font-bold mb-6">R$ 47,40</p>
        
        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-xl bg-primary-foreground/20 backdrop-blur-sm font-medium text-sm flex items-center justify-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Transferir
          </button>
          <button className="flex-1 py-3 rounded-xl bg-primary-foreground font-medium text-sm text-primary flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 px-5 py-4">
        <button className="flex-1 p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xs font-medium">Cartões</span>
        </button>
        <button className="flex-1 p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xs font-medium">Cupons</span>
        </button>
      </div>

      {/* Transactions */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Histórico</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            Ver tudo
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                tx.type === "credit" ? "bg-success/10" : "bg-muted"
              }`}>
                {tx.type === "credit" ? (
                  <ArrowDownLeft className="h-5 w-5 text-success" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
              <span className={`font-bold text-sm ${
                tx.type === "credit" ? "text-success" : "text-foreground"
              }`}>
                {tx.type === "credit" ? "+" : ""}R$ {Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
