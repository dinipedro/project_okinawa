import { 
  ChevronLeft, Trophy, Star, Gift, Users, TrendingUp,
  ChevronRight, Award, Crown, Zap, Download, Filter,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";

const loyaltySummary = {
  total_members: 1247,
  active_members: 892,
  points_issued: 45280,
  rewards_redeemed: 156,
  new_members_month: 48,
  comparison: {
    members: { value: 8.5, direction: "up" },
    points: { value: 12.3, direction: "up" },
    rewards: { value: -3.2, direction: "down" },
  },
};

const tierDistribution = [
  { tier: "Bronze", count: 645, percentage: 52, color: "amber" },
  { tier: "Silver", count: 380, percentage: 30, color: "slate" },
  { tier: "Gold", count: 178, percentage: 14, color: "yellow" },
  { tier: "Platinum", count: 44, percentage: 4, color: "purple" },
];

const topMembers = [
  {
    id: "m1",
    name: "Carlos Mendes",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
    tier: "platinum",
    points: 8450,
    total_spent: 12580.00,
    visits: 47,
  },
  {
    id: "m2",
    name: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    tier: "gold",
    points: 3280,
    total_spent: 5420.00,
    visits: 28,
  },
  {
    id: "m3",
    name: "João Santos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    tier: "gold",
    points: 2890,
    total_spent: 4780.00,
    visits: 24,
  },
];

const recentRewards = [
  { id: "r1", member: "Ana Costa", reward: "Sobremesa Grátis", points: 100, time: "Há 2h" },
  { id: "r2", member: "Pedro Lima", reward: "Desconto 10%", points: 200, time: "Há 4h" },
  { id: "r3", member: "Julia Ferreira", reward: "Bebida Grátis", points: 80, time: "Há 6h" },
];

export const LoyaltyManagementScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold">Programa Fidelidade</h1>
            <p className="text-xs text-muted-foreground">Gestão de membros e recompensas</p>
          </div>
          <button className="p-2 rounded-full bg-muted">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className={`text-xs font-medium flex items-center gap-0.5 ${
                loyaltySummary.comparison.members.direction === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                {loyaltySummary.comparison.members.direction === 'up' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {loyaltySummary.comparison.members.value}%
              </span>
            </div>
            <p className="text-2xl font-bold">{loyaltySummary.total_members.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Membros totais</p>
          </div>
          
          <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-secondary" />
              <span className="text-xs font-medium text-success flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                {loyaltySummary.comparison.points.value}%
              </span>
            </div>
            <p className="text-2xl font-bold">{loyaltySummary.points_issued.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Pontos emitidos</p>
          </div>
          
          <div className="p-4 rounded-2xl bg-card border border-border">
            <Gift className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{loyaltySummary.rewards_redeemed}</p>
            <p className="text-xs text-muted-foreground">Recompensas resgatadas</p>
          </div>
          
          <div className="p-4 rounded-2xl bg-card border border-border">
            <TrendingUp className="h-5 w-5 text-success mb-2" />
            <p className="text-2xl font-bold">+{loyaltySummary.new_members_month}</p>
            <p className="text-xs text-muted-foreground">Novos este mês</p>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="p-4 rounded-2xl bg-card border border-border mb-4">
          <h2 className="font-semibold text-sm mb-3">Distribuição por Tier</h2>
          <div className="space-y-3">
            {tierDistribution.map((tier) => (
              <div key={tier.tier}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {tier.tier === 'Platinum' && <Crown className="h-4 w-4 text-purple-500" />}
                    {tier.tier === 'Gold' && <Trophy className="h-4 w-4 text-yellow-500" />}
                    {tier.tier === 'Silver' && <Star className="h-4 w-4 text-slate-400" />}
                    {tier.tier === 'Bronze' && <Award className="h-4 w-4 text-amber-600" />}
                    <span className="text-sm font-medium">{tier.tier}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {tier.count} ({tier.percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      tier.tier === 'Platinum' ? 'bg-purple-500' :
                      tier.tier === 'Gold' ? 'bg-yellow-500' :
                      tier.tier === 'Silver' ? 'bg-slate-400' :
                      'bg-amber-600'
                    }`}
                    style={{ width: `${tier.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Members */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Top Membros</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {topMembers.map((member, index) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-slate-400 text-white' :
                      'bg-amber-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{member.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        member.tier === 'platinum' ? 'bg-purple-500/20 text-purple-500' :
                        member.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-slate-400/20 text-slate-500'
                      }`}>
                        {member.tier.charAt(0).toUpperCase() + member.tier.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{member.points.toLocaleString()} pts</span>
                      <span>{member.visits} visitas</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">R$ {member.total_spent.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">gasto total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Rewards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Resgates Recentes</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {recentRewards.map((reward) => (
              <div
                key={reward.id}
                className="p-3 rounded-xl bg-card border border-border flex items-center gap-3"
              >
                <div className="p-2 rounded-full bg-secondary/10">
                  <Gift className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{reward.member}</p>
                  <p className="text-xs text-muted-foreground">{reward.reward} • -{reward.points} pts</p>
                </div>
                <span className="text-xs text-muted-foreground">{reward.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
