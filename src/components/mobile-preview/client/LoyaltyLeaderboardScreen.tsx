import { 
  ChevronLeft, Crown, Medal, Trophy, Star, 
  TrendingUp, Gift, ChevronRight, Flame
} from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const leaderboard = [
  { rank: 1, name: "Carlos Silva", points: 12450, level: "Diamante", avatar: "👨‍💼", change: 0, isYou: false },
  { rank: 2, name: "Ana Rodrigues", points: 11200, level: "Diamante", avatar: "👩‍💻", change: 2, isYou: false },
  { rank: 3, name: "Pedro Santos", points: 10850, level: "Platina", avatar: "👨‍🎨", change: -1, isYou: false },
  { rank: 4, name: "Mariana Costa", points: 9500, level: "Platina", avatar: "👩‍🔬", change: 1, isYou: false },
  { rank: 5, name: "João Oliveira", points: 8200, level: "Ouro", avatar: "👨‍🚀", change: 0, isYou: true },
  { rank: 6, name: "Fernanda Lima", points: 7800, level: "Ouro", avatar: "👩‍🎤", change: -2, isYou: false },
  { rank: 7, name: "Lucas Mendes", points: 6500, level: "Ouro", avatar: "👨‍🏫", change: 3, isYou: false },
  { rank: 8, name: "Beatriz Souza", points: 5200, level: "Prata", avatar: "👩‍⚕️", change: 0, isYou: false },
];

const tiers = [
  { name: "Bronze", minPoints: 0, icon: "🥉", color: "amber-600", benefits: ["1x pontos"] },
  { name: "Prata", minPoints: 1000, icon: "🥈", color: "slate-400", benefits: ["1.5x pontos", "Prioridade fila"] },
  { name: "Ouro", minPoints: 5000, icon: "🥇", color: "yellow-500", benefits: ["2x pontos", "Reserva VIP", "Desconto 10%"] },
  { name: "Platina", minPoints: 10000, icon: "💎", color: "cyan-400", benefits: ["2.5x pontos", "Acesso exclusivo", "Desconto 15%"] },
  { name: "Diamante", minPoints: 15000, icon: "👑", color: "purple-400", benefits: ["3x pontos", "Tudo Platina", "Chef's Table grátis"] },
];

const achievements = [
  { id: 1, name: "Primeira Visita", icon: "🎉", unlocked: true, date: "Jan 2024" },
  { id: 2, name: "Foodie Explorer", icon: "🗺️", unlocked: true, date: "Mar 2024", desc: "Visitou 10 restaurantes" },
  { id: 3, name: "Madrugador", icon: "🌅", unlocked: true, date: "Abr 2024", desc: "5 reservas matinais" },
  { id: 4, name: "Amigo Referência", icon: "🤝", unlocked: false, progress: "3/5", desc: "Indique 5 amigos" },
  { id: 5, name: "Colecionador", icon: "⭐", unlocked: false, progress: "8/10", desc: "Resgate 10 recompensas" },
];

export const LoyaltyLeaderboardScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const myRank = leaderboard.find(u => u.isYou);
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };
  
  const getRankChange = (change: number) => {
    if (change > 0) return <span className="text-xs text-success flex items-center">↑{change}</span>;
    if (change < 0) return <span className="text-xs text-destructive flex items-center">↓{Math.abs(change)}</span>;
    return <span className="text-xs text-muted-foreground">-</span>;
  };
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-background/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Leaderboard
          </h1>
        </div>
        
        {/* My Position Card */}
        {myRank && (
          <div className="p-4 rounded-2xl bg-background/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-background/20 flex items-center justify-center text-3xl">
                {myRank.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{myRank.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-background/20 text-xs">
                    {myRank.level}
                  </span>
                </div>
                <p className="text-sm opacity-80">{myRank.points.toLocaleString()} pontos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">#{myRank.rank}</div>
                <p className="text-xs opacity-80">sua posição</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-background/20 flex items-center justify-between">
              <span className="text-sm opacity-80">Próximo nível: Platina</span>
              <span className="text-sm font-bold">1.800 pts restantes</span>
            </div>
            <div className="mt-2 h-2 bg-background/20 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-accent-foreground rounded-full" />
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {/* Top 3 Podium */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent" />
            Top 3 do Mês
          </h2>
          
          <div className="flex items-end justify-center gap-2">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-2 border-2 border-slate-300">
                {leaderboard[1].avatar}
              </div>
              <div className="w-20 h-16 bg-slate-200 dark:bg-slate-700 rounded-t-xl flex flex-col items-center justify-center">
                <Medal className="h-5 w-5 text-slate-400" />
                <span className="text-xs font-bold">2º</span>
              </div>
              <p className="text-xs font-medium mt-1 text-center truncate w-20">{leaderboard[1].name.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground">{(leaderboard[1].points / 1000).toFixed(1)}k</p>
            </div>
            
            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-4">
              <div className="w-20 h-20 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-4xl mb-2 border-2 border-yellow-400 relative">
                {leaderboard[0].avatar}
                <div className="absolute -top-3 -right-1">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="w-24 h-20 bg-yellow-200 dark:bg-yellow-900/50 rounded-t-xl flex flex-col items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-sm font-bold">1º</span>
              </div>
              <p className="text-xs font-medium mt-1 text-center truncate w-24">{leaderboard[0].name.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground">{(leaderboard[0].points / 1000).toFixed(1)}k</p>
            </div>
            
            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl mb-2 border-2 border-amber-400">
                {leaderboard[2].avatar}
              </div>
              <div className="w-20 h-12 bg-amber-200 dark:bg-amber-900/50 rounded-t-xl flex flex-col items-center justify-center">
                <Medal className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-bold">3º</span>
              </div>
              <p className="text-xs font-medium mt-1 text-center truncate w-20">{leaderboard[2].name.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground">{(leaderboard[2].points / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>
        
        {/* Full Leaderboard */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Ranking Completo</h2>
          <div className="space-y-2">
            {leaderboard.slice(3).map(user => (
              <div 
                key={user.rank}
                className={`p-3 rounded-2xl flex items-center gap-3 ${
                  user.isYou ? 'bg-primary/10 border-2 border-primary' : 'bg-card border border-border'
                }`}
              >
                <div className="w-8 flex items-center justify-center">
                  {getRankIcon(user.rank)}
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {user.name}
                      {user.isYou && <span className="text-primary ml-1">(você)</span>}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{user.points.toLocaleString()}</p>
                  {getRankChange(user.change)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tiers Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Níveis & Benefícios</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
            {tiers.map(tier => (
              <div 
                key={tier.name}
                className={`flex-shrink-0 w-28 p-3 rounded-2xl border ${
                  tier.name === 'Ouro' ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                }`}
              >
                <div className="text-2xl mb-1">{tier.icon}</div>
                <h4 className="font-semibold text-sm">{tier.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {tier.minPoints.toLocaleString()}+ pts
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Achievements */}
        <div>
          <h2 className="font-semibold text-sm mb-3">Conquistas</h2>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`p-3 rounded-2xl text-center ${
                  achievement.unlocked 
                    ? 'bg-card border border-border' 
                    : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <h4 className="font-medium text-xs leading-tight">{achievement.name}</h4>
                {achievement.unlocked ? (
                  <p className="text-xs text-success mt-1">✓ {achievement.date}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">{achievement.progress}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
