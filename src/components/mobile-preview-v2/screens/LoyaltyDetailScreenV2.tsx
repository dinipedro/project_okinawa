import { Award, Star, Gift, TrendingUp, Clock, Sparkles, Crown, Zap } from "lucide-react";
import sushiIcon from "@/assets/icons/sushi.png";

export const LoyaltyDetailScreenV2 = () => {
  const restaurant = {
    name: "Sushi Yassu",
    tier: "Gold",
    points: 2450,
    nextTier: "Platinum",
    pointsToNext: 550,
    totalVisits: 24,
    memberSince: "Mar 2024",
  };

  const rewards = [
    { id: 1, name: "Sobremesa Grátis", points: 500, available: true },
    { id: 2, name: "10% OFF no Pedido", points: 1000, available: true },
    { id: 3, name: "Entrada Grátis", points: 1500, available: true },
    { id: 4, name: "Jantar para 2", points: 5000, available: false },
  ];

  const history = [
    { id: 1, action: "Visita", points: "+150", date: "Hoje", type: "earn" },
    { id: 2, action: "Avaliação", points: "+50", date: "Ontem", type: "earn" },
    { id: 3, action: "Sobremesa Grátis", points: "-500", date: "15 Dez", type: "redeem" },
    { id: 4, action: "Visita", points: "+150", date: "10 Dez", type: "earn" },
  ];

  const tierColors = {
    Bronze: "from-primary/80 to-accent",
    Silver: "from-muted-foreground to-muted-foreground/80",
    Gold: "from-warning to-warning/80",
    Platinum: "from-secondary to-secondary/80",
    Diamond: "from-info to-info/80",
  };

  return (
    <div className="h-full bg-gradient-to-b from-muted to-background overflow-y-auto">
      {/* Header Card */}
      <div className="p-4">
        <div className={`p-5 rounded-3xl bg-gradient-to-br ${tierColors[restaurant.tier as keyof typeof tierColors]} text-white shadow-xl relative overflow-hidden`}>
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
                  <img src={sushiIcon} alt="Restaurant" className="w-12 h-12 object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{restaurant.name}</h1>
                  <div className="flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">{restaurant.tier} Member</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-white/70">Seus Pontos</p>
                  <p className="text-3xl font-bold">{restaurant.points.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">Próximo nível</p>
                  <p className="text-sm font-semibold">{restaurant.nextTier}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${((restaurant.points % 3000) / 3000) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-white/70">
                  Faltam {restaurant.pointsToNext} pontos para {restaurant.nextTier}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card backdrop-blur-sm border border-border">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-info to-info/80 flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-info-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{restaurant.totalVisits}</p>
            <p className="text-xs text-muted-foreground">Visitas</p>
          </div>
          <div className="p-4 rounded-2xl bg-card backdrop-blur-sm border border-border">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-destructive-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{restaurant.memberSince}</p>
            <p className="text-xs text-muted-foreground">Membro desde</p>
          </div>
        </div>

        {/* Rewards */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Gift className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Recompensas</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`p-4 rounded-2xl border ${
                  reward.available
                    ? "bg-card border-border"
                    : "bg-muted/50 border-border opacity-60"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{reward.name}</h4>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span className="text-xs font-medium text-muted-foreground">{reward.points} pts</span>
                </div>
                {reward.available && restaurant.points >= reward.points && (
                  <button className="mt-2 w-full py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-medium">
                    Resgatar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-success to-success/80 flex items-center justify-center">
              <Zap className="h-3 w-3 text-success-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Histórico</span>
          </div>

          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-card backdrop-blur-sm border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === "earn"
                      ? "bg-success/10"
                      : "bg-primary/10"
                  }`}>
                    {item.type === "earn" ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <Gift className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  item.type === "earn" ? "text-success" : "text-primary"
                }`}>
                  {item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDetailScreenV2;
