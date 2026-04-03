import { FC, useState } from 'react';
import { ChevronLeft, Percent, Plus, Calendar, Users, Eye, Edit, Trash2, ToggleLeft, ToggleRight, ChevronRight, Clock, Target, Hash, BarChart3, TrendingUp, Gift, Copy } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

interface Promotion {
  id: number;
  name: string;
  description: string;
  discount: string;
  type: 'percentage' | 'fixed' | 'freebie';
  active: boolean;
  views: number;
  uses: number;
  conversions: number;
  revenue: number;
  period: string;
  schedule: { days: string[]; hours: string };
  targeting: string[];
  limit: { total: number; perCustomer: number; used: number };
  couponCode?: string;
  startDate: string;
  endDate: string;
}

const promotions: Promotion[] = [
  {
    id: 1, name: 'Happy Hour', description: '50% off em drinks das 17h às 19h', discount: '50%', type: 'percentage',
    active: true, views: 1234, uses: 456, conversions: 37, revenue: 8920, period: '17:00 - 19:00',
    schedule: { days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], hours: '17:00-19:00' },
    targeting: ['Todos os clientes'], limit: { total: 500, perCustomer: 2, used: 456 },
    couponCode: 'HAPPY50', startDate: '01/04', endDate: '30/04'
  },
  {
    id: 2, name: 'Combo Família', description: 'Ramen + 2 acompanhamentos por R$ 79,90', discount: '25%', type: 'percentage',
    active: true, views: 890, uses: 234, conversions: 26, revenue: 18696, period: 'Sáb e Dom',
    schedule: { days: ['Sáb', 'Dom'], hours: '11:00-16:00' },
    targeting: ['Modo Família', 'Grupos 3+'], limit: { total: 300, perCustomer: 5, used: 234 },
    startDate: '01/04', endDate: '31/05'
  },
  {
    id: 3, name: 'Primeira Compra', description: '15% de desconto no primeiro pedido', discount: '15%', type: 'percentage',
    active: false, views: 2345, uses: 567, conversions: 24, revenue: 12450, period: 'Sempre',
    schedule: { days: ['Todos'], hours: 'Integral' },
    targeting: ['Novos clientes', '1ª compra'], limit: { total: 1000, perCustomer: 1, used: 567 },
    couponCode: 'WELCOME15', startDate: '01/03', endDate: '30/06'
  },
  {
    id: 4, name: 'Sobremesa Grátis', description: 'Tiramisù grátis em pedidos acima de R$150', discount: 'Grátis', type: 'freebie',
    active: true, views: 650, uses: 89, conversions: 14, revenue: 15320, period: 'Pedidos +R$150',
    schedule: { days: ['Todos'], hours: '18:00-22:00' },
    targeting: ['Pedido mín. R$150'], limit: { total: 200, perCustomer: 3, used: 89 },
    startDate: '10/04', endDate: '30/04'
  },
];

export const PromotionsScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [view, setView] = useState<'list' | 'analytics' | 'calendar'>('list');
  const [expandedPromo, setExpandedPromo] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'rules' | 'stats'>('details');

  const activeCount = promotions.filter(p => p.active).length;
  const totalUses = promotions.reduce((s, p) => s + p.uses, 0);
  const totalRevenue = promotions.reduce((s, p) => s + p.revenue, 0);
  const avgConversion = promotions.reduce((s, p) => s + p.conversions, 0) / promotions.length;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-white/10"><ChevronLeft className="w-5 h-5" /></button>
            <div>
              <h1 className="text-lg font-bold">Promoções</h1>
              <p className="text-xs opacity-80">{activeCount} ativas de {promotions.length}</p>
            </div>
          </div>
          <button className="p-2 rounded-xl bg-white/20"><Plus className="w-5 h-5" /></button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-white/10 text-center"><p className="text-sm font-bold">{totalUses.toLocaleString()}</p><p className="text-[10px] opacity-80">Usos</p></div>
          <div className="p-2.5 rounded-xl bg-white/10 text-center"><p className="text-sm font-bold">R$ {(totalRevenue / 1000).toFixed(1)}K</p><p className="text-[10px] opacity-80">Receita</p></div>
          <div className="p-2.5 rounded-xl bg-white/10 text-center"><p className="text-sm font-bold">{avgConversion.toFixed(0)}%</p><p className="text-[10px] opacity-80">Conversão</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 bg-card border-b border-border">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([['list', 'Promoções'], ['analytics', 'Analytics'], ['calendar', 'Calendário']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k as any)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${view === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'list' && (
          <div className="p-4 space-y-3">
            {promotions.map(promo => {
              const isExpanded = expandedPromo === promo.id;
              const usagePct = (promo.limit.used / promo.limit.total) * 100;
              return (
                <div key={promo.id} className={`rounded-2xl border-2 overflow-hidden ${promo.active ? 'bg-card border-primary/30' : 'bg-muted/50 border-border opacity-70'}`}>
                  <button onClick={() => { setExpandedPromo(isExpanded ? null : promo.id); setActiveSubTab('details'); }} className="w-full p-4 flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xs ${promo.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{promo.discount}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2"><p className="font-semibold text-foreground">{promo.name}</p></div>
                      <p className="text-xs text-muted-foreground">{promo.description}</p>
                      <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {promo.views}</span>
                        <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {promo.uses}</span>
                        <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {promo.period}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {promo.active ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-3">
                      <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                        {(['details', 'rules', 'stats'] as const).map(t => (
                          <button key={t} onClick={() => setActiveSubTab(t)} className={`flex-1 py-1.5 rounded-md text-[10px] font-medium ${activeSubTab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                            {t === 'details' ? 'Detalhes' : t === 'rules' ? 'Regras' : 'Analytics'}
                          </button>
                        ))}
                      </div>

                      {activeSubTab === 'details' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-muted"><p className="text-[10px] text-muted-foreground">Início</p><p className="text-xs font-bold text-foreground">{promo.startDate}</p></div>
                            <div className="p-2 rounded-lg bg-muted"><p className="text-[10px] text-muted-foreground">Fim</p><p className="text-xs font-bold text-foreground">{promo.endDate}</p></div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted"><p className="text-[10px] text-muted-foreground">Horários</p><p className="text-xs font-medium text-foreground">{promo.schedule.days.join(', ')} · {promo.schedule.hours}</p></div>
                          {promo.couponCode && (
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
                              <Hash className="w-4 h-4 text-primary" />
                              <span className="text-sm font-mono font-bold text-primary">{promo.couponCode}</span>
                              <button className="ml-auto p-1 rounded bg-primary/10"><Copy className="w-3 h-3 text-primary" /></button>
                            </div>
                          )}
                          {/* Usage bar */}
                          <div>
                            <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Uso</span><span className="text-foreground font-medium">{promo.limit.used}/{promo.limit.total}</span></div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${usagePct > 90 ? 'bg-destructive' : usagePct > 70 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${usagePct}%` }} /></div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 rounded-lg bg-secondary/10 text-secondary text-xs font-medium flex items-center justify-center gap-1"><Edit className="h-3.5 w-3.5" /> Editar</button>
                            <button className="py-2 px-4 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </>
                      )}

                      {activeSubTab === 'rules' && (
                        <>
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-lg bg-muted flex items-center gap-2"><Target className="w-4 h-4 text-primary" /><div><p className="text-xs font-medium text-foreground">Targeting</p><p className="text-[10px] text-muted-foreground">{promo.targeting.join(', ')}</p></div></div>
                            <div className="p-2.5 rounded-lg bg-muted flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><div><p className="text-xs font-medium text-foreground">Limite por cliente</p><p className="text-[10px] text-muted-foreground">{promo.limit.perCustomer}x por cliente</p></div></div>
                            <div className="p-2.5 rounded-lg bg-muted flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><div><p className="text-xs font-medium text-foreground">Dias</p><p className="text-[10px] text-muted-foreground">{promo.schedule.days.join(', ')}</p></div></div>
                          </div>
                          <div className="p-3 rounded-xl bg-info/5 border border-info/20">
                            <p className="text-xs text-info font-medium">👁️ Preview do Cliente</p>
                            <div className="mt-2 p-3 rounded-xl bg-card border border-border">
                              <div className="flex items-center gap-2 mb-1"><Gift className="w-4 h-4 text-primary" /><span className="text-xs font-bold text-foreground">{promo.name}</span></div>
                              <p className="text-[10px] text-muted-foreground">{promo.description}</p>
                              <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{promo.discount}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {activeSubTab === 'stats' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-xl bg-primary/10 text-center"><p className="text-lg font-bold text-primary">{promo.conversions}%</p><p className="text-[10px] text-muted-foreground">Conversão</p></div>
                            <div className="p-3 rounded-xl bg-success/10 text-center"><p className="text-lg font-bold text-success">R$ {promo.revenue.toLocaleString('pt-BR')}</p><p className="text-[10px] text-muted-foreground">Receita</p></div>
                          </div>
                          <div className="bg-muted rounded-xl p-3 space-y-1.5">
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visualizações</span><span className="text-foreground font-medium">{promo.views.toLocaleString()}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Usos</span><span className="text-foreground font-medium">{promo.uses}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-muted-foreground">ROI Estimado</span><span className="text-success font-bold">+{((promo.revenue / (promo.uses * 10)) * 100).toFixed(0)}%</span></div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {view === 'analytics' && (
          <div className="p-4 space-y-3">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-4">
              <p className="text-xs text-muted-foreground">Receita via Promoções</p>
              <p className="text-3xl font-bold text-foreground">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-success mt-1"><TrendingUp className="w-3 h-3 inline" /> +22% vs mês anterior</p>
            </div>
            {promotions.sort((a, b) => b.revenue - a.revenue).map((p, i) => (
              <div key={p.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.uses} usos · {p.conversions}% conv.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">R$ {p.revenue.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-muted-foreground">{((p.revenue / totalRevenue) * 100).toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'calendar' && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Abril 2025</p>
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => {
              const dayPromos = promotions.filter(p => p.active && (p.schedule.days.includes(day) || p.schedule.days.includes('Todos')));
              return (
                <div key={day} className="bg-card rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-foreground">{day}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{dayPromos.length} ativas</span>
                  </div>
                  {dayPromos.length > 0 ? (
                    <div className="space-y-1">
                      {dayPromos.map(p => (
                        <div key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted">
                          <div className="w-1.5 h-6 rounded-full bg-primary" />
                          <div className="flex-1">
                            <p className="text-[11px] font-medium text-foreground">{p.name}</p>
                            <p className="text-[9px] text-muted-foreground">{p.schedule.hours}</p>
                          </div>
                          <span className="text-[10px] font-bold text-primary">{p.discount}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem promoções</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsScreen;