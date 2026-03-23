import { FC } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Gift, ChevronRight, ChevronLeft } from "lucide-react";
import LiquidGlassNav from '../components/LiquidGlassNav';

interface WalletScreenV2Props {
  onNavigate: (screen: string) => void;
}

const transactions = [
  { id: 1, type: "credit", description: "Cashback - Omakase Sushi", amount: 12.90, date: "Hoje, 14:30" },
  { id: 2, type: "debit", description: "Pagamento - Trattoria Bella", amount: -128.50, date: "Ontem, 20:15" },
  { id: 3, type: "credit", description: "Bônus de indicação", amount: 50.00, date: "12/12, 09:00" },
  { id: 4, type: "credit", description: "Cashback - Café Lumière", amount: 4.50, date: "10/12, 16:45" },
];

const WalletScreenV2: FC<WalletScreenV2Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home-v2')}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Carteira</h1>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mx-5 p-5 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground shadow-xl shadow-primary/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-sm text-primary-foreground/90">Saldo disponível</span>
            </div>
            <button className="p-2 rounded-full bg-primary-foreground/20 backdrop-blur-sm hover:bg-primary-foreground/30 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-4xl font-bold mb-6">R$ 147,40</p>
          
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl bg-primary-foreground/20 backdrop-blur-sm font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-foreground/30 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
              Transferir
            </button>
            <button className="flex-1 py-3 rounded-xl bg-primary-foreground font-medium text-sm text-primary flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 px-5 py-4">
        <button className="flex-1 p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center gap-2 hover:shadow-md hover:border-primary/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Cartões</span>
        </button>
        <button className="flex-1 p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center gap-2 hover:shadow-md hover:border-primary/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-success" />
          </div>
          <span className="text-xs font-medium text-foreground">Cupons</span>
        </button>
      </div>

      {/* Transactions */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-foreground">Histórico</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            Ver tudo
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                tx.type === "credit" 
                  ? "bg-success/10" 
                  : "bg-muted"
              }`}>
                {tx.type === "credit" ? (
                  <ArrowDownLeft className="w-5 h-5 text-success" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{tx.description}</p>
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
      
      <LiquidGlassNav activeTab="wallet" onNavigate={onNavigate} />
    </div>
  );
};

export default WalletScreenV2;
