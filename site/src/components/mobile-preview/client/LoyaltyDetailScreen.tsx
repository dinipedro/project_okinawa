import { 
  ChevronLeft, Star, Gift, Trophy, ChevronRight,
  Sparkles, Crown, Award, Zap, Lock, Check, Timer
} from "lucide-react";

const userLoyalty = {
  restaurant: "Sakura Ramen",
  points: 1250,
  tier: "silver",
  total_visits: 23,
  total_spent: 2840.50,
  member_since: "Mar 2024",
  points_to_next_tier: 750,
  next_tier: "gold",
};

const tiers = [
  {
    id: "bronze",
    name: "Bronze",
    min_points: 0,
    max_points: 499,
    icon: Award,
    color: "amber",
    benefits: ["Acumular pontos", "Ofertas especiais"],
    discount: 0,
  },
  {
    id: "silver",
    name: "Silver",
    min_points: 500,
    max_points: 1999,
    icon: Star,
    color: "slate",
    benefits: ["5% desconto", "Aniversário especial", "Prioridade em reservas"],
    discount: 5,
  },
  {
    id: "gold",
    name: "Gold",
    min_points: 2000,
    max_points: 4999,
    icon: Trophy,
    color: "yellow",
    benefits: ["10% desconto", "Eventos exclusivos", "Upgrade gratuito", "Early access"],
    discount: 10,
  },
  {
    id: "platinum",
    name: "Platinum",
    min_points: 5000,
    max_points: null,
    icon: Crown,
    color: "purple",
    benefits: ["15% desconto", "Concierge service", "Mesa VIP", "Degustação exclusiva", "Eventos privados"],
    discount: 15,
  },
];

const rewards = [
  {
    id: "r1",
    name: "Sobremesa Grátis",
    description: "Uma sobremesa à sua escolha",
    points_cost: 100,
    type: "free_item",
    affordable: true,
  },
  {
    id: "r2",
    name: "Bebida Grátis",
    description: "Uma bebida não-alcoólica",
    points_cost: 80,
    type: "free_item",
    affordable: true,
  },
  {
    id: "r3",
    name: "Desconto 10%",
    description: "10% na próxima conta",
    points_cost: 200,
    type: "discount",
    affordable: true,
  },
  {
    id: "r4",
    name: "Entrada Grátis",
    description: "Uma entrada à sua escolha",
    points_cost: 250,
    type: "free_item",
    affordable: true,
  },
  {
    id: "r5",
    name: "Desconto 20%",
    description: "20% na próxima conta",
    points_cost: 400,
    type: "discount",
    affordable: true,
  },
  {
    id: "r6",
    name: "Upgrade Mesa VIP",
    description: "Na próxima reserva",
    points_cost: 500,
    type: "upgrade",
    affordable: true,
  },
  {
    id: "r7",
    name: "Jantar Aniversário",
    description: "Jantar especial com cortesias",
    points_cost: 1000,
    type: "special",
    affordable: true,
  },
  {
    id: "r8",
    name: "Menu Degustação",
    description: "Menu completo de 7 pratos",
    points_cost: 2000,
    type: "special",
    affordable: false,
  },
];

const recentActivity = [
  { id: "a1", description: "Pedido #8K2M - Ganhou", points: 28, date: "Hoje" },
  { id: "a2", description: "Resgatou Sobremesa Grátis", points: -100, date: "Ontem" },
  { id: "a3", description: "Pedido #7J9L - Ganhou", points: 45, date: "3 dias atrás" },
  { id: "a4", description: "Bônus Tier Silver", points: 50, date: "5 dias atrás" },
];

export const LoyaltyDetailScreen = () => {
  const currentTierIndex = tiers.findIndex(t => t.id === userLoyalty.tier);
  const progressPercent = ((userLoyalty.points - tiers[currentTierIndex].min_points) / 
    (tiers[currentTierIndex].max_points! - tiers[currentTierIndex].min_points)) * 100;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <button className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold">Programa de Fidelidade</h1>
          <p className="text-xs text-muted-foreground">{userLoyalty.restaurant}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {/* Points Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-600 to-slate-800 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-slate-300 text-slate-300" />
              <span className="font-semibold">Silver Member</span>
            </div>
            <span className="text-xs opacity-70">Desde {userLoyalty.member_since}</span>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-sm opacity-70">Seus pontos</p>
            <p className="text-4xl font-bold">{userLoyalty.points.toLocaleString()}</p>
          </div>
          
          {/* Progress to next tier */}
          <div>
            <div className="flex justify-between text-xs mb-2 opacity-70">
              <span>Silver</span>
              <span>Gold</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-slate-300 to-yellow-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-center mt-2 opacity-70">
              Faltam {userLoyalty.points_to_next_tier} pontos para Gold
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-primary">{userLoyalty.total_visits}</p>
            <p className="text-xs text-muted-foreground">Visitas</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-secondary">R$ {userLoyalty.total_spent.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Total gasto</p>
          </div>
        </div>

        {/* Tiers */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Níveis de Fidelidade</h2>
          <div className="space-y-2">
            {tiers.map((tier, index) => {
              const isCurrentTier = tier.id === userLoyalty.tier;
              const isUnlocked = index <= currentTierIndex;
              
              return (
                <div
                  key={tier.id}
                  className={`p-4 rounded-2xl border-2 ${
                    isCurrentTier 
                      ? 'bg-primary/5 border-primary' 
                      : isUnlocked
                      ? 'bg-card border-border'
                      : 'bg-muted/30 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      isCurrentTier ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      {isUnlocked ? (
                        <tier.icon className={`h-5 w-5 ${isCurrentTier ? 'text-primary' : 'text-muted-foreground'}`} />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{tier.name}</span>
                        {isCurrentTier && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tier.max_points ? `${tier.min_points} - ${tier.max_points} pts` : `${tier.min_points}+ pts`}
                      </p>
                    </div>
                    {tier.discount > 0 && (
                      <span className="text-sm font-semibold text-secondary">
                        -{tier.discount}%
                      </span>
                    )}
                  </div>
                  
                  {isCurrentTier && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Seus benefícios:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tier.benefits.map((benefit, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rewards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Resgatar Recompensas</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todas
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {rewards.slice(0, 4).map((reward) => (
              <div
                key={reward.id}
                className={`p-4 rounded-2xl border ${
                  reward.affordable 
                    ? 'bg-card border-border' 
                    : 'bg-muted/30 border-border opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${reward.affordable ? 'bg-secondary/10' : 'bg-muted'}`}>
                    <Gift className={`h-5 w-5 ${reward.affordable ? 'text-secondary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-sm">{reward.name}</span>
                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold text-sm ${reward.affordable ? 'text-primary' : 'text-muted-foreground'}`}>
                      {reward.points_cost} pts
                    </span>
                    {reward.affordable ? (
                      <button className="block text-xs text-secondary font-medium mt-0.5">
                        Resgatar
                      </button>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Bloqueado
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div>
          <h2 className="font-semibold text-sm mb-3">Atividade Recente</h2>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="p-3 rounded-xl bg-card border border-border flex items-center gap-3"
              >
                <div className={`p-2 rounded-full ${activity.points > 0 ? 'bg-success/10' : 'bg-secondary/10'}`}>
                  {activity.points > 0 ? (
                    <Zap className="h-4 w-4 text-success" />
                  ) : (
                    <Gift className="h-4 w-4 text-secondary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
                <span className={`font-semibold text-sm ${activity.points > 0 ? 'text-success' : 'text-secondary'}`}>
                  {activity.points > 0 ? '+' : ''}{activity.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
