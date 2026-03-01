import { useState } from 'react';
import { 
  ChevronLeft, Users, Plus, Search, Clock, Calendar,
  CheckCircle, XCircle, Star, TrendingUp, ChevronRight,
  Phone, Mail, MoreVertical
} from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

type TabType = 'team' | 'schedule' | 'attendance';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'active' | 'break' | 'off';
  rating: number;
  sales: number;
  tips: number;
  shift?: string;
}

const mockStaff: StaffMember[] = [
  { id: "1", name: "Carlos Santos", role: "Garçom", avatar: "👨‍🍳", phone: "(11) 99999-1111", email: "carlos@email.com", status: "active", rating: 4.8, sales: 2450, tips: 367, shift: "18:00 - 23:00" },
  { id: "2", name: "Ana Silva", role: "Garçom", avatar: "👩‍🍳", phone: "(11) 99999-2222", email: "ana@email.com", status: "active", rating: 4.9, sales: 3200, tips: 480, shift: "18:00 - 23:00" },
  { id: "3", name: "Pedro Lima", role: "Barman", avatar: "🧑‍🍳", phone: "(11) 99999-3333", email: "pedro@email.com", status: "break", rating: 4.7, sales: 1800, tips: 270 },
  { id: "4", name: "Maria Costa", role: "Chef", avatar: "👩‍🍳", phone: "(11) 99999-4444", email: "maria@email.com", status: "active", rating: 4.9, sales: 0, tips: 0, shift: "16:00 - 23:00" },
  { id: "5", name: "João Oliveira", role: "Maitre", avatar: "🧑‍💼", phone: "(11) 99999-5555", email: "joao@email.com", status: "off", rating: 4.6, sales: 0, tips: 0 },
];

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

export const StaffManagementScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [activeTab, setActiveTab] = useState<TabType>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [staff] = useState(mockStaff);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success';
      case 'break': return 'bg-accent text-accent';
      case 'off': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'break': return 'Pausa';
      case 'off': return 'Folga';
      default: return status;
    }
  };
  
  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold">Equipe</h1>
            <p className="text-xs text-muted-foreground">{staff.length} colaboradores</p>
          </div>
          <button className="p-2 rounded-full bg-primary text-primary-foreground">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'team', label: 'Equipe' },
          { id: 'schedule', label: 'Escalas' },
          { id: 'attendance', label: 'Ponto' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-3 text-sm font-medium relative ${
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-20">
        {activeTab === 'team' && (
          <div className="space-y-3">
            {/* Active Now */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Em Serviço</h3>
              <span className="text-xs text-success font-medium">
                {staff.filter(s => s.status === 'active').length} ativos
              </span>
            </div>
            
            {filteredStaff.map(member => (
              <div 
                key={member.id}
                className="p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{member.name}</span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status).split(' ')[0]}`} />
                      </div>
                      <button className="p-1">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    
                    {member.shift && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {member.shift}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                        <span className="text-xs font-medium">{member.rating}</span>
                      </div>
                      {member.sales > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-success" />
                          <span className="text-xs">R$ {member.sales.toLocaleString()}</span>
                        </div>
                      )}
                      {member.tips > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Gorjetas: R$ {member.tips}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button className="flex-1 py-2 rounded-xl bg-muted text-sm flex items-center justify-center gap-1">
                    <Phone className="h-4 w-4" />
                    Ligar
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-muted text-sm flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4" />
                    Mensagem
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {/* Week View */}
            <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-2">
              {weekDays.map((day, i) => (
                <div 
                  key={day}
                  className={`flex-1 min-w-[45px] p-2 rounded-xl text-center ${
                    i === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <p className="text-xs font-medium">{day}</p>
                  <p className="text-lg font-bold">{16 + i}</p>
                </div>
              ))}
            </div>
            
            {/* Schedule Grid */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Quinta-feira, 19 Dez</h3>
              
              {[
                { shift: 'Almoço', time: '11:00 - 15:00', staff: ['Carlos', 'Ana'] },
                { shift: 'Jantar', time: '18:00 - 23:00', staff: ['Carlos', 'Ana', 'Pedro', 'Maria'] },
              ].map(schedule => (
                <div key={schedule.shift} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{schedule.shift}</span>
                    <span className="text-sm text-muted-foreground">{schedule.time}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {schedule.staff.map(name => (
                      <span key={name} className="px-3 py-1 rounded-full bg-muted text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              <button className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground flex items-center justify-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Turno
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            {/* Today Summary */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
              <h3 className="font-semibold mb-2">Hoje - 19 Dez</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-success">4</div>
                  <p className="text-xs text-muted-foreground">Presentes</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">1</div>
                  <p className="text-xs text-muted-foreground">Pausa</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">1</div>
                  <p className="text-xs text-muted-foreground">Folga</p>
                </div>
              </div>
            </div>
            
            {/* Attendance List */}
            <div className="space-y-2">
              {staff.map(member => (
                <div 
                  key={member.id}
                  className="p-3 rounded-xl bg-card border border-border flex items-center gap-3"
                >
                  <div className="text-xl">{member.avatar}</div>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{member.name}</span>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'active' && (
                      <>
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="text-xs text-success">18:02</span>
                      </>
                    )}
                    {member.status === 'break' && (
                      <>
                        <Clock className="h-5 w-5 text-accent" />
                        <span className="text-xs text-accent">Pausa</span>
                      </>
                    )}
                    {member.status === 'off' && (
                      <>
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Folga</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
