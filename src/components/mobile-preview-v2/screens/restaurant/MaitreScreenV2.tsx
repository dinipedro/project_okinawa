import { FC } from 'react';
import { ChevronLeft, Users, Clock, CheckCircle2, XCircle } from "lucide-react";

interface MaitreScreenV2Props { onNavigate: (screen: string) => void; }

const queue = [
  { id: 1, name: "Silva", guests: 4, wait: "15 min", status: "waiting" },
  { id: 2, name: "Santos", guests: 2, wait: "5 min", status: "ready" },
  { id: 3, name: "Costa", guests: 6, wait: "25 min", status: "waiting" },
];

const MaitreScreenV2: FC<MaitreScreenV2Props> = ({ onNavigate }) => (
  <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background">
    <div className="px-5 py-4 bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('restaurant-dashboard-v2')} className="p-2 -ml-2 rounded-full hover:bg-secondary-foreground/10"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-semibold">Maitre</h1>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {queue.map(item => (
        <div key={item.id} className={`p-4 rounded-2xl border-2 ${item.status === 'ready' ? 'bg-success/10 border-success' : 'bg-card border-border'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-foreground">Família {item.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'ready' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
              {item.status === 'ready' ? 'Mesa Pronta' : 'Aguardando'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{item.guests}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{item.wait}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 rounded-xl bg-gradient-to-r from-success to-secondary text-success-foreground text-sm font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />Check-in
            </button>
            <button className="py-2 px-3 rounded-xl bg-destructive/10 text-destructive"><XCircle className="w-4 h-4" /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MaitreScreenV2;
