import { FC } from 'react';
import { ChevronLeft, Bell, CreditCard, Plus } from "lucide-react";

interface WaiterScreenV2Props { onNavigate: (screen: string) => void; }

const tables = [
  { id: 5, status: 'needs_attention', message: 'Solicitação pendente' },
  { id: 12, status: 'payment', message: 'Aguardando pagamento' },
  { id: 3, status: 'new_order', message: 'Novo pedido' },
];

const WaiterScreenV2: FC<WaiterScreenV2Props> = ({ onNavigate }) => (
  <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background">
    <div className="px-5 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('restaurant-dashboard-v2')} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-semibold">Garçom</h1>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {tables.map(table => (
        <div key={table.id} className={`p-4 rounded-2xl border-2 ${
          table.status === 'needs_attention' ? 'bg-destructive/10 border-destructive' :
          table.status === 'payment' ? 'bg-secondary/10 border-secondary' : 'bg-primary/10 border-primary'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-lg text-foreground">Mesa {table.id}</span>
              <p className="text-sm text-muted-foreground">{table.message}</p>
            </div>
            <div className={`p-3 rounded-xl text-primary-foreground ${
              table.status === 'needs_attention' ? 'bg-destructive' :
              table.status === 'payment' ? 'bg-secondary' : 'bg-primary'
            }`}>
              {table.status === 'needs_attention' && <Bell className="w-5 h-5" />}
              {table.status === 'payment' && <CreditCard className="w-5 h-5" />}
              {table.status === 'new_order' && <Plus className="w-5 h-5" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default WaiterScreenV2;
