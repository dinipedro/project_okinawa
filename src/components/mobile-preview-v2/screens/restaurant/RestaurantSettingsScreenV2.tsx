import { FC } from 'react';
import { ChevronLeft, Store, Clock, Bell, CreditCard, ChevronRight } from "lucide-react";

interface RestaurantSettingsScreenV2Props { onNavigate: (screen: string) => void; }

const settings = [
  { icon: Store, label: 'Dados do Restaurante', subtitle: 'Nome, endereço, CNPJ' },
  { icon: Clock, label: 'Horário de Funcionamento', subtitle: 'Seg-Dom, 11h-23h' },
  { icon: Bell, label: 'Notificações', subtitle: 'Alertas e avisos' },
  { icon: CreditCard, label: 'Pagamentos', subtitle: 'Métodos aceitos' },
];

const RestaurantSettingsScreenV2: FC<RestaurantSettingsScreenV2Props> = ({ onNavigate }) => (
  <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background">
    <div className="px-5 py-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('restaurant-dashboard-v2')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
        <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-5">
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {settings.map((item, i) => (
          <button key={item.label} className={`w-full flex items-center gap-3 p-4 hover:bg-muted ${i !== settings.length - 1 ? 'border-b border-border' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default RestaurantSettingsScreenV2;
