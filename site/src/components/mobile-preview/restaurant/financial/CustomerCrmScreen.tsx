import { FC, useState } from 'react';
import { ChevronLeft, Search, Users, Star, TrendingUp, Calendar, Gift, ChevronRight, Phone, Mail, Heart, ShoppingBag, Clock, Filter, MessageSquare } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  totalSpent: number;
  avgTicket: number;
  lastVisit: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  favorite: string;
  birthday?: string;
  allergies?: string[];
  notes?: string;
  visitHistory: { date: string; spent: number; items: string[] }[];
}

const customers: Customer[] = [
  {
    id: '1', name: 'Ana Costa', phone: '(11) 99999-1111', email: 'ana@email.com',
    visits: 23, totalSpent: 4780, avgTicket: 207.80, lastVisit: '1 dia', tier: 'Platinum',
    favorite: 'Omakase Selection', birthday: '15/06', allergies: ['Glúten'],
    notes: 'Prefere mesa próxima à janela',
    visitHistory: [
      { date: '12/04', spent: 320, items: ['Omakase', 'Sake Premium'] },
      { date: '08/04', spent: 245, items: ['Wagyu Tataki', 'Vinho Tinto'] },
      { date: '01/04', spent: 180, items: ['Ramen', 'Edamame'] },
    ]
  },
  {
    id: '2', name: 'Maria Silva', phone: '(11) 99999-2222', email: 'maria@email.com',
    visits: 12, totalSpent: 2340, avgTicket: 195.00, lastVisit: '2 dias', tier: 'Gold',
    favorite: 'Risoto Funghi', birthday: '22/09',
    visitHistory: [
      { date: '10/04', spent: 195, items: ['Risoto Funghi', 'Tiramisù'] },
      { date: '03/04', spent: 210, items: ['Filé Mignon', 'Bruschetta'] },
    ]
  },
  {
    id: '3', name: 'João Santos', phone: '(11) 99999-3333', email: 'joao@email.com',
    visits: 8, totalSpent: 1560, avgTicket: 195.00, lastVisit: '5 dias', tier: 'Silver',
    favorite: 'Filé Mignon',
    visitHistory: [
      { date: '07/04', spent: 280, items: ['Filé Mignon', 'Gin Tônica', 'Sobremesa'] },
    ]
  },
  {
    id: '4', name: 'Carlos Mendes', phone: '(11) 99999-4444', email: 'carlos@email.com',
    visits: 31, totalSpent: 6200, avgTicket: 200.00, lastVisit: '3 dias', tier: 'Platinum',
    favorite: 'Sashimi Mix', birthday: '08/05', allergies: ['Lactose'],
    notes: 'Cliente VIP - sempre agendar mesa reservada',
    visitHistory: [
      { date: '09/04', spent: 450, items: ['Sashimi Mix', 'Sake Premium', 'Omakase'] },
      { date: '05/04', spent: 380, items: ['Chef\'s Table Menu'] },
    ]
  },
  {
    id: '5', name: 'Pedro Lima', phone: '(11) 99999-5555', email: 'pedro@email.com',
    visits: 3, totalSpent: 450, avgTicket: 150.00, lastVisit: '2 sem', tier: 'Bronze',
    favorite: 'Ramen Tonkotsu',
    visitHistory: [
      { date: '28/03', spent: 150, items: ['Ramen Tonkotsu', 'Gyoza'] },
    ]
  },
];

const tierConfig: Record<string, { bg: string; text: string; border: string }> = {
  Platinum: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
  Gold: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  Silver: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  Bronze: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
};

export const CustomerCrmScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'history'>('profile');

  const filtered = customers
    .filter(c => filterTier === 'all' || c.tier === filterTier)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgVisits = customers.reduce((s, c) => s + c.visits, 0) / customers.length;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">CRM Clientes</h1>
            <p className="text-xs text-muted-foreground">{totalCustomers} clientes · R$ {(totalRevenue / 1000).toFixed(1)}K receita</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-center">
            <p className="text-sm font-bold text-primary">{totalCustomers}</p>
            <p className="text-[9px] text-muted-foreground">Clientes</p>
          </div>
          <div className="p-2 rounded-xl bg-success/10 text-center">
            <p className="text-sm font-bold text-success">{avgVisits.toFixed(0)}</p>
            <p className="text-[9px] text-muted-foreground">Méd. Visitas</p>
          </div>
          <div className="p-2 rounded-xl bg-warning/10 text-center">
            <p className="text-sm font-bold text-warning">{customers.filter(c => c.birthday).length}</p>
            <p className="text-[9px] text-muted-foreground">Aniv. Próx.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-muted text-sm text-foreground" />
        </div>

        {/* Tier filter */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {['all', 'Platinum', 'Gold', 'Silver', 'Bronze'].map(t => (
            <button key={t} onClick={() => setFilterTier(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              filterTier === t ? 'bg-primary text-primary-foreground' :
              t === 'all' ? 'bg-muted text-muted-foreground' :
              `${tierConfig[t].bg} ${tierConfig[t].text}`
            }`}>
              {t === 'all' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map(c => {
          const tc = tierConfig[c.tier];
          const isExpanded = expandedCustomer === c.id;

          return (
            <div key={c.id} className={`bg-card rounded-2xl border overflow-hidden ${isExpanded ? tc.border : 'border-border'}`}>
              <button onClick={() => { setExpandedCustomer(isExpanded ? null : c.id); setActiveSubTab('profile'); }} className="w-full p-3 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${tc.bg} ${tc.text}`}>{c.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${tc.bg} ${tc.text}`}>{c.tier}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.visits} visitas · R$ {c.totalSpent.toLocaleString('pt-BR')} · Últ: {c.lastVisit}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
                  {/* Sub-tabs */}
                  <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                    <button onClick={() => setActiveSubTab('profile')} className={`flex-1 py-1.5 rounded-md text-xs font-medium ${activeSubTab === 'profile' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>Perfil</button>
                    <button onClick={() => setActiveSubTab('history')} className={`flex-1 py-1.5 rounded-md text-xs font-medium ${activeSubTab === 'history' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>Histórico</button>
                  </div>

                  {activeSubTab === 'profile' && (
                    <>
                      {/* Contact */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs"><Phone className="w-3 h-3 text-muted-foreground" /><span className="text-foreground">{c.phone}</span></div>
                        <div className="flex items-center gap-2 text-xs"><Mail className="w-3 h-3 text-muted-foreground" /><span className="text-foreground">{c.email}</span></div>
                        {c.birthday && <div className="flex items-center gap-2 text-xs"><Gift className="w-3 h-3 text-muted-foreground" /><span className="text-foreground">Aniversário: {c.birthday}</span></div>}
                        <div className="flex items-center gap-2 text-xs"><Heart className="w-3 h-3 text-muted-foreground" /><span className="text-foreground">Favorito: {c.favorite}</span></div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-muted text-center">
                          <p className="text-xs font-bold text-foreground">{c.visits}</p>
                          <p className="text-[9px] text-muted-foreground">Visitas</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted text-center">
                          <p className="text-xs font-bold text-foreground">R$ {c.avgTicket.toFixed(0)}</p>
                          <p className="text-[9px] text-muted-foreground">Ticket Méd.</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted text-center">
                          <p className="text-xs font-bold text-success">R$ {c.totalSpent.toLocaleString('pt-BR')}</p>
                          <p className="text-[9px] text-muted-foreground">Total</p>
                        </div>
                      </div>

                      {/* Allergies & Notes */}
                      {c.allergies && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">Alergias:</span>
                          {c.allergies.map(a => <span key={a} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">{a}</span>)}
                        </div>
                      )}
                      {c.notes && (
                        <div className="p-2.5 rounded-xl bg-info/5 border border-info/20">
                          <p className="text-xs text-info">📝 {c.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium flex items-center justify-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Mensagem</button>
                        <button className="flex-1 py-2 rounded-xl bg-success/10 text-success text-xs font-medium flex items-center justify-center gap-1"><Gift className="w-3.5 h-3.5" /> Cupom</button>
                        <button className="flex-1 py-2 rounded-xl bg-warning/10 text-warning text-xs font-medium flex items-center justify-center gap-1"><Calendar className="w-3.5 h-3.5" /> Reserva</button>
                      </div>
                    </>
                  )}

                  {activeSubTab === 'history' && (
                    <div className="space-y-2">
                      {c.visitHistory.map((v, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-muted">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-foreground">{v.date}</span>
                            <span className="font-bold text-foreground">R$ {v.spent.toFixed(2)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {v.items.map((item, j) => <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-card text-muted-foreground">{item}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};