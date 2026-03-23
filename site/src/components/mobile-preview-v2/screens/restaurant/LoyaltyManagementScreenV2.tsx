import { Award, Users, TrendingUp, Gift, Star } from "lucide-react";

export const LoyaltyManagementScreenV2 = () => {
  const stats = { totalMembers: 1247, activeThisMonth: 342, pointsIssued: "45.2K", redemptions: 89 };

  return (
    <div className="h-full bg-gradient-to-b from-muted to-background p-4 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-primary flex items-center justify-center">
          <Award className="h-5 w-5 text-warning-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Fidelidade</h1>
          <p className="text-xs text-muted-foreground">Gestão do programa</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Membros", value: stats.totalMembers, icon: Users, color: "from-info to-info/80" },
          { label: "Ativos", value: stats.activeThisMonth, icon: TrendingUp, color: "from-success to-secondary" },
          { label: "Pontos", value: stats.pointsIssued, icon: Star, color: "from-warning to-primary" },
          { label: "Resgates", value: stats.redemptions, icon: Gift, color: "from-destructive to-destructive/80" },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground font-semibold">
        Configurar Recompensas
      </button>
    </div>
  );
};

export default LoyaltyManagementScreenV2;
