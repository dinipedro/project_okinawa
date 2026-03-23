import { FC } from 'react';
import { ChevronLeft, Heart, DollarSign, TrendingUp } from "lucide-react";

interface TipsManagementScreenV2Props { onNavigate: (screen: string) => void; }

const tips = [
  { id: 1, staff: 'Carlos Silva', amount: 145.50, period: 'Hoje' },
  { id: 2, staff: 'Ana Santos', amount: 89.00, period: 'Hoje' },
  { id: 3, staff: 'Equipe', amount: 234.00, period: 'Hoje' },
];

const TipsManagementScreenV2: FC<TipsManagementScreenV2Props> = ({ onNavigate }) => (
  <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background">
    <div className="px-5 py-4 bg-gradient-to-r from-success to-secondary text-success-foreground">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => onNavigate('restaurant-dashboard-v2')} className="p-2 -ml-2 rounded-full hover:bg-success-foreground/10"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-semibold">Gorjetas</h1>
      </div>
      <div className="p-4 rounded-2xl bg-success-foreground/15 backdrop-blur-sm">
        <p className="text-sm text-success-foreground/80">Total de Hoje</p>
        <p className="text-3xl font-bold">R$ 468,50</p>
        <p className="text-sm text-success-foreground/80 flex items-center gap-1 mt-1"><TrendingUp className="w-4 h-4" />+12% vs ontem</p>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {tips.map(tip => (
        <div key={tip.id} className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-success/20 to-secondary/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-success" />
              </div>
              <div>
                <span className="font-semibold text-foreground">{tip.staff}</span>
                <p className="text-xs text-muted-foreground">{tip.period}</p>
              </div>
            </div>
            <span className="font-bold text-success">R$ {tip.amount.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TipsManagementScreenV2;
