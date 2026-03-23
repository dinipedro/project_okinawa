import { FC } from 'react';
import { Award, ChevronRight, Star, Gift, TrendingUp, Crown, Users } from 'lucide-react';
import LiquidGlassNav from '../components/LiquidGlassNav';

interface LoyaltyScreenV2Props {
  onNavigate: (screen: string) => void;
}

const benefits = [
  { id: 1, name: 'Reserva prioritária', unlocked: true },
  { id: 2, name: '10% cashback', unlocked: true },
  { id: 3, name: 'Acesso antecipado', unlocked: true },
  { id: 4, name: 'Eventos exclusivos', unlocked: false },
];

const recentActivity = [
  { id: 1, action: 'Reserva concluída', restaurant: 'Omakase Sushi', points: '+120', date: 'Hoje' },
  { id: 2, action: 'Avaliação enviada', restaurant: 'La Trattoria', points: '+25', date: 'Ontem' },
  { id: 3, action: 'Indicação aceita', restaurant: '', points: '+500', date: '12/12' },
];

const leaderboard = [
  { rank: 1, name: 'Marina S.', points: 8450, avatar: 'M' },
  { rank: 2, name: 'Carlos R.', points: 7820, avatar: 'C' },
  { rank: 3, name: 'Você', points: 2450, avatar: 'R', isUser: true },
];

const LoyaltyScreenV2: FC<LoyaltyScreenV2Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background relative pb-24">
      {/* Header Card */}
      <div className="bg-foreground px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-warning" />
              <span className="text-warning font-bold text-sm">GOLD MEMBER</span>
            </div>
            <h1 className="text-background text-2xl font-bold">Okinawa Rewards</h1>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Award className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Points Display */}
        <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-muted text-sm">Pontos disponíveis</p>
              <p className="text-background text-4xl font-bold">2.450</p>
            </div>
            <button 
              onClick={() => onNavigate('rewards-store')}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              Resgatar
            </button>
          </div>
          <div className="h-2 bg-background/20 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
          </div>
          <p className="text-muted text-xs mt-2">550 pontos para Platinum</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto -mt-4 px-4">
        {/* Quick Stats */}
        <div className="bg-card rounded-2xl p-4 shadow-lg border border-border mb-4 flex gap-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-foreground">47</p>
            <p className="text-xs text-muted-foreground">Reservas</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-foreground">R$ 2.4k</p>
            <p className="text-xs text-muted-foreground">Economizado</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Indicações</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Seus benefícios Gold
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  index !== benefits.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  benefit.unlocked ? 'bg-success/10' : 'bg-muted'
                }`}>
                  {benefit.unlocked ? (
                    <Star className="w-4 h-4 text-success fill-success" />
                  ) : (
                    <Star className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className={`flex-1 font-medium ${
                  benefit.unlocked ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {benefit.name}
                </span>
                {!benefit.unlocked && (
                  <span className="text-xs text-muted-foreground">Platinum</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Ranking
            </h2>
            <button 
              onClick={() => onNavigate('leaderboard')}
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              Ver completo
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {leaderboard.map((user, index) => (
              <div
                key={user.rank}
                className={`flex items-center gap-3 px-4 py-3 ${
                  user.isUser ? 'bg-primary/10' : ''
                } ${index !== leaderboard.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className={`w-6 text-center font-bold ${
                  user.rank === 1 ? 'text-warning' : 
                  user.rank === 2 ? 'text-muted-foreground' : 
                  'text-primary'
                }`}>
                  #{user.rank}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary-foreground ${
                  user.isUser 
                    ? 'bg-gradient-to-br from-primary to-accent' 
                    : 'bg-muted-foreground/50'
                }`}>
                  {user.avatar}
                </div>
                <span className={`flex-1 font-medium ${
                  user.isUser ? 'text-primary' : 'text-foreground'
                }`}>
                  {user.name}
                </span>
                <span className="font-semibold text-muted-foreground">{user.points.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Atividade recente
          </h2>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="bg-card rounded-xl p-3 border border-border flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{activity.action}</p>
                  {activity.restaurant && (
                    <p className="text-xs text-muted-foreground">{activity.restaurant}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">{activity.points}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <LiquidGlassNav activeTab="loyalty" onNavigate={onNavigate} />
    </div>
  );
};

export default LoyaltyScreenV2;
