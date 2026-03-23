import { FC } from 'react';
import { 
  User, Settings, CreditCard, Heart, Bell, HelpCircle, 
  LogOut, ChevronRight, Award, Wallet, MapPin, Star, Gift
} from 'lucide-react';
import LiquidGlassNav from '../components/LiquidGlassNav';

interface ProfileScreenV2Props {
  onNavigate: (screen: string) => void;
}

const menuSections = [
  {
    title: 'Conta',
    items: [
      { id: 'wallet', icon: Wallet, label: 'Carteira', badge: 'R$ 45,00' },
      { id: 'addresses', icon: MapPin, label: 'Endereços salvos' },
      { id: 'payment', icon: CreditCard, label: 'Métodos de pagamento' },
    ]
  },
  {
    title: 'Preferências',
    items: [
      { id: 'favorites', icon: Heart, label: 'Favoritos', badge: '12' },
      { id: 'notifications', icon: Bell, label: 'Notificações' },
      { id: 'settings', icon: Settings, label: 'Configurações' },
    ]
  },
  {
    title: 'Suporte',
    items: [
      { id: 'help', icon: HelpCircle, label: 'Central de ajuda' },
    ]
  },
];

const ProfileScreenV2: FC<ProfileScreenV2Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background relative pb-24">
      {/* Header with Profile */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent px-5 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-3xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary-foreground/30">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-primary-foreground text-xl font-bold">Ricardo Silva</h1>
            <p className="text-primary-foreground/80 text-sm">ricardo.silva@email.com</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              <span className="text-primary-foreground/90 text-xs font-medium">Membro desde 2023</span>
            </div>
          </div>
          <button className="p-2.5 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-primary-foreground text-2xl font-bold">47</p>
            <p className="text-primary-foreground/80 text-xs">Reservas</p>
          </div>
          <div className="flex-1 bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-primary-foreground text-2xl font-bold">12</p>
            <p className="text-primary-foreground/80 text-xs">Favoritos</p>
          </div>
          <div className="flex-1 bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-primary-foreground text-2xl font-bold">4.9</p>
            <p className="text-primary-foreground/80 text-xs">Avaliação</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto -mt-4">
        {/* Loyalty Card */}
        <div className="mx-4 mb-4">
          <button
            onClick={() => onNavigate('loyalty')}
            className="w-full bg-foreground rounded-3xl p-4 flex items-center gap-4 shadow-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Award className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-background font-bold">Okinawa Rewards</p>
                <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs font-bold rounded-full">GOLD</span>
              </div>
              <p className="text-muted text-sm">2.450 pontos disponíveis</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Promo Banner */}
        <div className="mx-4 mb-4">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">Indique e ganhe!</p>
              <p className="text-xs text-muted-foreground">Ganhe R$25 para cada amigo indicado</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Menu Sections */}
        <div className="px-4 pb-8">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {section.title}
              </h2>
              <div className="bg-card rounded-2xl overflow-hidden border border-border">
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${
                        index !== section.items.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                      {item.badge && (
                        <span className="text-sm text-primary font-semibold">{item.badge}</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout */}
          <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-destructive/10 text-destructive font-medium mt-4">
            <LogOut className="w-5 h-5" />
            Sair da conta
          </button>

          {/* Version */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Okinawa v2.1.0
          </p>
        </div>
      </div>

      {/* Liquid Glass Navigation */}
      <LiquidGlassNav activeTab="profile" onNavigate={onNavigate} />
    </div>
  );
};

export default ProfileScreenV2;
