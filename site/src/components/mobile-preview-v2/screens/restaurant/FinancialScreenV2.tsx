import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet } from "lucide-react";

export const FinancialScreenV2 = () => {
  return (
    <div className="h-full bg-gradient-to-b from-muted to-background p-4 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-secondary flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-success-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Financeiro</h1>
          <p className="text-xs text-muted-foreground">Visão geral</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-success to-secondary text-success-foreground mb-4">
        <p className="text-sm text-success-foreground/80">Faturamento Hoje</p>
        <p className="text-3xl font-bold">R$ 12.450,00</p>
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm">+18% vs ontem</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Receita Mês", value: "R$ 89.2K", icon: Wallet, color: "from-info to-info/80", trend: "+12%" },
          { label: "Ticket Médio", value: "R$ 78,50", icon: CreditCard, color: "from-secondary to-secondary-light", trend: "+5%" },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <span className="text-xs text-success">{stat.trend}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialScreenV2;
