import { 
  Settings, 
  ChevronRight, 
  Heart, 
  MapPin, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut,
  Star,
  Home,
  Compass,
  User,
  Camera
} from "lucide-react";

const menuItems = [
  { icon: Heart, label: "Favoritos", badge: "12" },
  { icon: MapPin, label: "Endereços salvos" },
  { icon: CreditCard, label: "Pagamentos" },
  { icon: Bell, label: "Notificações" },
  { icon: HelpCircle, label: "Ajuda e suporte" },
  { icon: Settings, label: "Configurações" },
];

const stats = [
  { value: "23", label: "Visitas" },
  { value: "12", label: "Favoritos" },
  { value: "8", label: "Avaliações" },
];

export const ProfileScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary to-secondary pt-6 pb-16 px-5">
        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/20">
          <Settings className="h-5 w-5 text-white" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-lg">
              <Camera className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">João Silva</h1>
            <p className="text-white/80 text-sm">@joaosilva</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-white text-sm font-medium">4.9</span>
              <span className="text-white/60 text-sm">• Membro Gold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mx-5 -mt-10 relative z-10">
        <div className="bg-card rounded-2xl shadow-lg p-4 flex items-center justify-around">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              {index < stats.length - 1 && (
                <div className="absolute h-8 w-px bg-border" style={{ left: `${(index + 1) * 33.33}%` }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 px-5 py-6 pb-24">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-destructive/10 transition-colors mt-4 text-destructive">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-medium">Sair da conta</span>
        </button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Okinawa v1.0.0
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-3">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Compass className="h-5 w-5" />
            <span className="text-xs">Explorar</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Heart className="h-5 w-5" />
            <span className="text-xs">Favoritos</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
