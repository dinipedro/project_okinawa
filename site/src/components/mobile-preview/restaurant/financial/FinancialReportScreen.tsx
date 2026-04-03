import { FC, useState } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown, DollarSign, Calendar, Download, Filter, BarChart3, PieChart, Users, ShoppingBag, Clock } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

export const FinancialReportScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [view, setView] = useState<'summary' | 'categories' | 'hourly'>('summary');

  const periodData = {
    today: { revenue: 12450, expenses: 4200, margin: 66.3, ticket: 89.50, customers: 139, orders: 156, trend: '+18%' },
    week: { revenue: 67800, expenses: 22100, margin: 67.4, ticket: 92.30, customers: 734, orders: 812, trend: '+12%' },
    month: { revenue: 287450, expenses: 98200, margin: 65.8, ticket: 87.20, customers: 3295, orders: 3640, trend: '+15.2%' },
    custom: { revenue: 287450, expenses: 98200, margin: 65.8, ticket: 87.20, customers: 3295, orders: 3640, trend: '+15.2%' },
  };

  const d = periodData[period];

  const categories = [
    { name: 'Pratos Principais', pct: 42, value: d.revenue * 0.42, trend: '+8%', items: 1245 },
    { name: 'Bebidas', pct: 26, value: d.revenue * 0.26, trend: '+15%', items: 2100 },
    { name: 'Entradas', pct: 16, value: d.revenue * 0.16, trend: '+3%', items: 890 },
    { name: 'Sobremesas', pct: 10, value: d.revenue * 0.10, trend: '+22%', items: 445 },
    { name: 'Outros', pct: 6, value: d.revenue * 0.06, trend: '-2%', items: 210 },
  ];

  const hourlyData = [
    { hour: '11h', revenue: 1200, orders: 12 },
    { hour: '12h', revenue: 4500, orders: 38 },
    { hour: '13h', revenue: 3800, orders: 32 },
    { hour: '14h', revenue: 2100, orders: 18 },
    { hour: '18h', revenue: 1800, orders: 15 },
    { hour: '19h', revenue: 5200, orders: 42 },
    { hour: '20h', revenue: 6800, orders: 52 },
    { hour: '21h', revenue: 5500, orders: 45 },
    { hour: '22h', revenue: 3200, orders: 28 },
  ];

  const maxHourlyRevenue = Math.max(...hourlyData.map(h => h.revenue));

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Relatório Financeiro</h1>
            <p className="text-xs text-muted-foreground">Análise detalhada de receitas</p>
          </div>
          <button className="p-2 rounded-xl bg-primary/10 text-primary"><Download className="w-4 h-4" /></button>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-3">
          {([['today', 'Hoje'], ['week', 'Semana'], ['month', 'Mês'], ['custom', 'Custom']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setPeriod(k)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${period === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>

        {/* View selector */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([['summary', 'Resumo', BarChart3], ['categories', 'Categorias', PieChart], ['hourly', 'Por Hora', Clock]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setView(k as any)} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium ${view === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              <Icon className="w-3.5 h-3.5" /> {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {view === 'summary' && (
          <>
            {/* Revenue card */}
            <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl border border-success/20 p-4">
              <p className="text-xs text-muted-foreground">Receita</p>
              <p className="text-3xl font-bold text-foreground">R$ {d.revenue.toLocaleString('pt-BR')}</p>
              <div className="flex items-center gap-1 mt-1"><TrendingUp className="w-3.5 h-3.5 text-success" /><span className="text-xs text-success font-medium">{d.trend} vs período anterior</span></div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: 'Ticket Médio', v: `R$ ${d.ticket.toFixed(2)}`, icon: DollarSign, trend: '+5%', trendUp: true },
                { l: 'Despesas', v: `R$ ${d.expenses.toLocaleString('pt-BR')}`, icon: TrendingDown, trend: '-3%', trendUp: false },
                { l: 'Margem', v: `${d.margin}%`, icon: TrendingUp, trend: '+2.1%', trendUp: true },
                { l: 'Clientes', v: d.customers.toLocaleString('pt-BR'), icon: Users, trend: '+8%', trendUp: true },
              ].map(m => (
                <div key={m.l} className="bg-card rounded-2xl border border-border p-3">
                  <m.icon className="w-4 h-4 text-primary mb-1" />
                  <p className="text-xl font-bold text-foreground">{m.v}</p>
                  <p className="text-[10px] text-muted-foreground">{m.l}</p>
                  <p className={`text-[10px] font-medium ${m.trendUp ? 'text-success' : 'text-destructive'}`}>{m.trend}</p>
                </div>
              ))}
            </div>

            {/* Revenue vs Expenses visual */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">Receita vs Despesas</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-foreground">Receita</span><span className="text-success font-medium">R$ {d.revenue.toLocaleString('pt-BR')}</span></div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-success rounded-full" style={{ width: '100%' }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-foreground">Despesas</span><span className="text-destructive font-medium">R$ {d.expenses.toLocaleString('pt-BR')}</span></div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-destructive rounded-full" style={{ width: `${(d.expenses / d.revenue) * 100}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-foreground font-semibold">Lucro</span><span className="text-primary font-bold">R$ {(d.revenue - d.expenses).toLocaleString('pt-BR')}</span></div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${((d.revenue - d.expenses) / d.revenue) * 100}%` }} /></div>
                </div>
              </div>
            </div>

            {/* Export options */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">Exportar Relatório</h3>
              <div className="flex gap-2">
                {['PDF', 'CSV', 'Excel'].map(format => (
                  <button key={format} className="flex-1 py-2.5 rounded-xl border border-border bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-1">
                    <Download className="w-3 h-3" /> {format}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {view === 'categories' && (
          <>
            {categories.map((cat, i) => (
              <div key={cat.name} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                    <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{cat.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${cat.pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R$ {cat.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  <span>{cat.items} vendidos</span>
                  <span className={cat.trend.startsWith('+') ? 'text-success' : 'text-destructive'}>{cat.trend}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {view === 'hourly' && (
          <>
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground text-sm mb-4">Receita por Hora</h3>
              <div className="flex items-end gap-1.5 h-36">
                {hourlyData.map(h => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] text-muted-foreground font-medium">{(h.revenue / 1000).toFixed(1)}k</span>
                    <div className="w-full bg-muted rounded-t-sm overflow-hidden" style={{ height: '100%' }}>
                      <div className="w-full bg-primary rounded-t-sm mt-auto" style={{ height: `${(h.revenue / maxHourlyRevenue) * 100}%`, marginTop: `${100 - (h.revenue / maxHourlyRevenue) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{h.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">Detalhes por Hora</h3>
              {hourlyData.map(h => (
                <div key={h.hour} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm font-medium text-foreground w-10">{h.hour}</span>
                  <div className="flex-1 mx-3 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(h.revenue / maxHourlyRevenue) * 100}%` }} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">R$ {h.revenue.toLocaleString('pt-BR')}</p>
                    <p className="text-[10px] text-muted-foreground">{h.orders} pedidos</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};