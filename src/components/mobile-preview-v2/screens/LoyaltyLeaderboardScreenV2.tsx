import { FC } from 'react';
import { ChevronLeft, Crown, Medal, Trophy, Star, ChevronRight, Flame, User, Briefcase, Code, Palette, FlaskConical, Rocket, Music, Stethoscope, GraduationCap, Award, Gem, CircleDollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface LoyaltyLeaderboardScreenV2Props {
  onNavigate: (screen: string) => void;
}

const avatarIcons: { icon: LucideIcon; gradient: string }[] = [
  { icon: Briefcase, gradient: "from-info to-info/80" },
  { icon: Code, gradient: "from-success to-success/80" },
  { icon: Palette, gradient: "from-destructive to-destructive/80" },
  { icon: FlaskConical, gradient: "from-accent to-primary" },
  { icon: Rocket, gradient: "from-primary to-accent" },
  { icon: Music, gradient: "from-info to-info/80" },
  { icon: Stethoscope, gradient: "from-destructive to-destructive/80" },
  { icon: GraduationCap, gradient: "from-warning to-warning/80" },
];

const leaderboard = [
  { rank: 1, name: "Carlos Silva", points: 12450, level: "Diamante", avatarIdx: 0, change: 0 },
  { rank: 2, name: "Ana Rodrigues", points: 11200, level: "Diamante", avatarIdx: 1, change: 2 },
  { rank: 3, name: "Pedro Santos", points: 10850, level: "Platina", avatarIdx: 2, change: -1 },
  { rank: 4, name: "Mariana Costa", points: 9500, level: "Platina", avatarIdx: 3, change: 1 },
  { rank: 5, name: "João Oliveira", points: 8200, level: "Ouro", avatarIdx: 4, change: 0, isYou: true },
  { rank: 6, name: "Fernanda Lima", points: 7800, level: "Ouro", avatarIdx: 5, change: -2 },
  { rank: 7, name: "Lucas Mendes", points: 6500, level: "Ouro", avatarIdx: 6, change: 3 },
  { rank: 8, name: "Beatriz Souza", points: 5200, level: "Prata", avatarIdx: 7, change: 0 },
];

const tiers: { name: string; minPoints: number; icon: LucideIcon; gradient: string }[] = [
  { name: "Bronze", minPoints: 0, icon: Medal, gradient: "from-primary/80 to-accent" },
  { name: "Prata", minPoints: 1000, icon: Award, gradient: "from-muted-foreground to-muted-foreground/80" },
  { name: "Ouro", minPoints: 5000, icon: Trophy, gradient: "from-warning to-warning/80" },
  { name: "Platina", minPoints: 10000, icon: Gem, gradient: "from-secondary to-secondary/80" },
  { name: "Diamante", minPoints: 15000, icon: Crown, gradient: "from-info to-info/80" },
];

const LoyaltyLeaderboardScreenV2: FC<LoyaltyLeaderboardScreenV2Props> = ({ onNavigate }) => {
  const myRank = leaderboard.find(u => u.isYou);
  
  const getRankChange = (change: number) => {
    if (change > 0) return <span className="text-xs text-success">↑{change}</span>;
    if (change < 0) return <span className="text-xs text-destructive">↓{Math.abs(change)}</span>;
    return <span className="text-xs text-muted-foreground">-</span>;
  };
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => onNavigate('loyalty-v2')}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Leaderboard
          </h1>
        </div>
        
        {/* My Position Card */}
        {myRank && (() => {
          const MyAvatarIcon = avatarIcons[myRank.avatarIdx].icon;
          const myGradient = avatarIcons[myRank.avatarIdx].gradient;
          return (
            <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${myGradient} flex items-center justify-center`}>
                  <MyAvatarIcon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{myRank.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                      {myRank.level}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">{myRank.points.toLocaleString()} pontos</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">#{myRank.rank}</div>
                  <p className="text-xs text-white/80">sua posição</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-sm text-white/80">Próximo nível: Platina</span>
                <span className="text-sm font-bold">1.800 pts restantes</span>
              </div>
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-white rounded-full" />
              </div>
            </div>
          );
        })()}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        {/* Top 3 Podium */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            Top 3 do Mês
          </h2>
          
          <div className="flex items-end justify-center gap-2">
            {/* 2nd Place */}
            {(() => {
              const Icon2 = avatarIcons[leaderboard[1].avatarIdx].icon;
              const grad2 = avatarIcons[leaderboard[1].avatarIdx].gradient;
              return (
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad2} flex items-center justify-center mb-2 border-2 border-border`}>
                    <Icon2 className="h-8 w-8 text-white" />
                  </div>
                  <div className="w-20 h-16 bg-muted rounded-t-xl flex flex-col items-center justify-center">
                    <Medal className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground">2º</span>
                  </div>
                  <p className="text-xs font-medium mt-1 text-foreground">{leaderboard[1].name.split(' ')[0]}</p>
                  <p className="text-xs text-muted-foreground">{(leaderboard[1].points / 1000).toFixed(1)}k</p>
                </div>
              );
            })()}
            
            {/* 1st Place */}
            {(() => {
              const Icon1 = avatarIcons[leaderboard[0].avatarIdx].icon;
              const grad1 = avatarIcons[leaderboard[0].avatarIdx].gradient;
              return (
                <div className="flex flex-col items-center -mt-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${grad1} flex items-center justify-center mb-2 border-2 border-warning relative`}>
                    <Icon1 className="h-10 w-10 text-white" />
                    <div className="absolute -top-3 -right-1">
                      <Crown className="w-6 h-6 text-warning" />
                    </div>
                  </div>
                  <div className="w-24 h-20 bg-gradient-to-b from-warning to-warning/80 rounded-t-xl flex flex-col items-center justify-center">
                    <Trophy className="w-6 h-6 text-warning-foreground" />
                    <span className="text-sm font-bold text-warning-foreground">1º</span>
                  </div>
                  <p className="text-xs font-medium mt-1 text-foreground">{leaderboard[0].name.split(' ')[0]}</p>
                  <p className="text-xs text-muted-foreground">{(leaderboard[0].points / 1000).toFixed(1)}k</p>
                </div>
              );
            })()}
            
            {/* 3rd Place */}
            {(() => {
              const Icon3 = avatarIcons[leaderboard[2].avatarIdx].icon;
              const grad3 = avatarIcons[leaderboard[2].avatarIdx].gradient;
              return (
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad3} flex items-center justify-center mb-2 border-2 border-primary/50`}>
                    <Icon3 className="h-8 w-8 text-white" />
                  </div>
                  <div className="w-20 h-12 bg-primary/20 rounded-t-xl flex flex-col items-center justify-center">
                    <Medal className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold text-primary">3º</span>
                  </div>
                  <p className="text-xs font-medium mt-1 text-foreground">{leaderboard[2].name.split(' ')[0]}</p>
                  <p className="text-xs text-muted-foreground">{(leaderboard[2].points / 1000).toFixed(1)}k</p>
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Full Leaderboard */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-foreground mb-3">Ranking Completo</h2>
          <div className="space-y-2">
            {leaderboard.slice(3).map(user => {
              const UserIcon = avatarIcons[user.avatarIdx].icon;
              const userGrad = avatarIcons[user.avatarIdx].gradient;
              return (
                <div 
                  key={user.rank}
                  className={`p-3 rounded-2xl flex items-center gap-3 ${
                    user.isYou ? 'bg-primary/10 border-2 border-primary' : 'bg-card border border-border'
                  }`}
                >
                  <div className="w-8 flex items-center justify-center">
                    <span className="text-sm font-bold text-muted-foreground">#{user.rank}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${userGrad} flex items-center justify-center`}>
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {user.name}
                        {user.isYou && <span className="text-primary ml-1">(você)</span>}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">{user.points.toLocaleString()}</p>
                    {getRankChange(user.change)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Tiers Info */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-foreground">Níveis & Benefícios</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todos
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tiers.map(tier => {
              const TierIcon = tier.icon;
              return (
                <div 
                  key={tier.name}
                  className={`flex-shrink-0 w-28 p-3 rounded-2xl border ${
                    tier.name === 'Ouro' ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-1`}>
                    <TierIcon className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{tier.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {tier.minPoints.toLocaleString()}+ pts
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyLeaderboardScreenV2;
