import { 
  ArrowLeft, 
  User, 
  Bell, 
  CreditCard, 
  MapPin, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Moon,
  Globe
} from "lucide-react";

const settingsGroups = [
  {
    title: "Conta",
    items: [
      { icon: User, label: "Dados pessoais", subtitle: "Nome, email, telefone" },
      { icon: MapPin, label: "Endereços", subtitle: "3 endereços salvos" },
      { icon: CreditCard, label: "Pagamentos", subtitle: "Cartões e PIX" },
    ],
  },
  {
    title: "Preferências",
    items: [
      { icon: Bell, label: "Notificações", subtitle: "Push, email, SMS" },
      { icon: Moon, label: "Aparência", subtitle: "Tema escuro" },
      { icon: Globe, label: "Idioma", subtitle: "Português (BR)" },
    ],
  },
  {
    title: "Suporte",
    items: [
      { icon: Shield, label: "Privacidade", subtitle: "Dados e permissões" },
      { icon: HelpCircle, label: "Ajuda", subtitle: "FAQ e suporte" },
    ],
  },
];

export const SettingsScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
        <button className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Configurações</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        {settingsGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </h2>
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              {group.items.map((item, index) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors ${
                    index !== group.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-medium text-sm">Sair da conta</span>
        </button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Versão 1.0.0 • Okinawa App
        </p>
      </div>
    </div>
  );
};
