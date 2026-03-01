import { FC } from 'react';
import { ChevronLeft, Plus, User, Star } from "lucide-react";

interface StaffManagementScreenV2Props { onNavigate: (screen: string) => void; }

const staff = [
  { id: 1, name: 'Carlos Silva', role: 'Garçom', rating: 4.9, status: 'active' },
  { id: 2, name: 'Ana Santos', role: 'Chef', rating: 4.8, status: 'active' },
  { id: 3, name: 'Pedro Costa', role: 'Barman', rating: 4.7, status: 'break' },
];

const StaffManagementScreenV2: FC<StaffManagementScreenV2Props> = ({ onNavigate }) => (
  <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background">
    <div className="px-5 py-4 bg-card border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('restaurant-dashboard-v2')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Equipe</h1>
        </div>
        <button className="p-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground"><Plus className="w-5 h-5" /></button>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {staff.map(member => (
        <div key={member.id} className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-foreground">{member.name}</span>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-warning text-warning" /><span className="font-semibold text-foreground">{member.rating}</span></div>
              <span className={`text-xs ${member.status === 'active' ? 'text-success' : 'text-warning'}`}>{member.status === 'active' ? 'Ativo' : 'Pausa'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default StaffManagementScreenV2;
