import { FC } from 'react';
import { 
  User, Bell, CreditCard, MapPin, Shield, HelpCircle, LogOut, ChevronRight,
  Moon, Globe, ChevronLeft
} from "lucide-react";

interface SettingsScreenV2Props {
  onNavigate: (screen: string) => void;
}

const settingsGroups = [
  {
    title: "Conta",
    items: [
      { icon: User, label: "Dados pessoais", subtitle: "Nome, email, telefone", color: "from-primary to-accent" },
      { icon: MapPin, label: "Endereços", subtitle: "3 endereços salvos", color: "from-secondary to-success" },
      { icon: CreditCard, label: "Pagamentos", subtitle: "Cartões e PIX", color: "from-secondary to-secondary/80" },
    ],
  },
  {
    title: "Preferências",
    items: [
      { icon: Bell, label: "Notificações", subtitle: "Push, email, SMS", color: "from-destructive to-destructive/80" },
      { icon: Moon, label: "Aparência", subtitle: "Tema escuro", color: "from-muted-foreground to-muted-foreground/80" },
      { icon: Globe, label: "Idioma", subtitle: "Português (BR)", color: "from-info to-info/80" },
    ],
  },
  {
    title: "Suporte",
    items: [
      { icon: Shield, label: "Privacidade", subtitle: "Dados e permissões", color: "from-success to-success/80" },
      { icon: HelpCircle, label: "Ajuda", subtitle: "FAQ e suporte", color: "from-warning to-warning/80" },
    ],
  },
];

const SettingsScreenV2: FC<SettingsScreenV2Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 bg-card border-b border-border">
        <button 
          onClick={() => onNavigate('profile-v2')}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        {settingsGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h2>
            <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              {group.items.map((item, index) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors ${
                    index !== group.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center shadow-lg">
            <LogOut className="w-5 h-5 text-destructive-foreground" />
          </div>
          <span className="font-medium text-sm text-destructive">Sair da conta</span>
        </button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Versão 2.0.0 • Okinawa App
        </p>
      </div>
    </div>
  );
};

export default SettingsScreenV2;
