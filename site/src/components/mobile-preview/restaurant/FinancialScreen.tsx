import { TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

const summary = {
  today: "R$ 3.240,00",
  week: "R$ 18.450,00",
  month: "R$ 67.890,00",
  growth: "+12%"
};

const transactions = [
  { type: "income", desc: "Mesa 5 - Pagamento", value: "R$ 156,00", method: "Cartão", time: "14:30" },
  { type: "income", desc: "Delivery #1234", value: "R$ 89,50", method: "PIX", time: "14:15" },
  { type: "expense", desc: "Fornecedor - Verduras", value: "R$ 450,00", method: "Boleto", time: "13:00" },
  { type: "income", desc: "Mesa 12 - Pagamento", value: "R$ 234,00", method: "Dinheiro", time: "12:45" },
  { type: "income", desc: "Mesa 3 - Pagamento", value: "R$ 67,00", method: "Cartão", time: "12:20" },
];

const paymentMethods = [
  { name: "Cartão", value: 45, color: "primary" },
  { name: "PIX", value: 35, color: "secondary" },
  { name: "Dinheiro", value: 15, color: "accent" },
  { name: "Outros", value: 5, color: "muted" },
];

export const FinancialScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-success to-primary text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Faturamento Hoje</p>
            <h1 className="font-display text-3xl font-bold">{summary.today}</h1>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">{summary.growth}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl bg-white/10 text-center">
            <p className="text-xs opacity-80">Esta Semana</p>
            <p className="font-bold">{summary.week}</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-white/10 text-center">
            <p className="text-xs opacity-80">Este Mês</p>
            <p className="font-bold">{summary.month}</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-5 py-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Formas de Pagamento
        </h2>
        <div className="flex gap-2">
          {paymentMethods.map((method) => (
            <div key={method.name} className="flex-1 p-3 rounded-xl bg-card border border-border text-center">
              <div className={`text-xl font-bold text-${method.color}`}>{method.value}%</div>
              <div className="text-xs text-muted-foreground">{method.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-2">
        <div className="flex gap-3">
          <button className="flex-1 p-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Relatório</span>
          </button>
          <button className="flex-1 p-3 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center gap-2">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm font-medium">Despesas</span>
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5 py-4 flex-1">
        <h2 className="font-semibold mb-3">Últimas Transações</h2>
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  tx.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {tx.type === 'income' ? (
                    <ArrowUpRight className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{tx.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{tx.method}</span>
                    <span>•</span>
                    <span>{tx.time}</span>
                  </div>
                </div>
              </div>
              <span className={`font-bold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                {tx.type === 'income' ? '+' : '-'}{tx.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
