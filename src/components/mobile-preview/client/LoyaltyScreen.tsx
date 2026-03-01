import { Crown, Star, Gift, ChevronRight, Zap } from "lucide-react";

const rewards = [
  { id: 1, name: "Café Grátis", points: 500, current: 320, image: "☕" },
  { id: 2, name: "10% de desconto", points: 200, current: 320, unlocked: true },
  { id: 3, name: "Sobremesa Grátis", points: 750, current: 320 },
];

const partners = [
  { id: 1, name: "Sakura Ramen", points: 180, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=60&h=60&fit=crop" },
  { id: 2, name: "Café Lumière", points: 95, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=60&h=60&fit=crop" },
  { id: 3, name: "La Trattoria", points: 45, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=60&h=60&fit=crop" },
];

export const LoyaltyScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-accent" />
          Fidelidade
        </h1>
      </div>

      {/* Points Card */}
      <div className="mx-5 p-5 rounded-3xl bg-gradient-to-br from-accent to-accent-light text-accent-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5" />
            <span className="text-sm font-medium">Seus pontos</span>
          </div>
          <p className="text-4xl font-bold mb-1">320</p>
          <p className="text-sm opacity-80">Nível Ouro • 180 pts para Platina</p>
          
          <div className="mt-4 h-2 bg-accent-foreground/20 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-accent-foreground rounded-full" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Ganhar pontos</p>
              <p className="text-xs text-muted-foreground">Escaneie QR</p>
            </div>
          </button>
          <button className="flex-1 p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Resgatar</p>
              <p className="text-xs text-muted-foreground">3 disponíveis</p>
            </div>
          </button>
        </div>

        {/* Rewards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recompensas</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todas
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`flex-shrink-0 w-32 p-3 rounded-2xl border ${
                  reward.unlocked
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-3xl mb-2">{reward.image}</div>
                <h4 className="font-semibold text-sm">{reward.name}</h4>
                {reward.unlocked ? (
                  <span className="text-xs text-primary font-medium">Disponível!</span>
                ) : (
                  <span className="text-xs text-muted-foreground">{reward.points - reward.current} pts restantes</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div>
          <h2 className="font-semibold mb-3">Pontos por parceiro</h2>
          <div className="space-y-3">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{partner.name}</h4>
                  <p className="text-xs text-muted-foreground">Acumulado</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary">{partner.points}</span>
                  <span className="text-xs text-muted-foreground ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
