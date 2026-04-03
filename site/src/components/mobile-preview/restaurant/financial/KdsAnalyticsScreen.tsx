import { FC, useState } from 'react';
import { ChevronLeft, Clock, AlertTriangle, CheckCircle2, TrendingUp, Users, ChefHat, Flame, GlassWater, Snowflake, BarChart3 } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

export const KdsAnalyticsScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [view, setView] = useState<'overview' | 'stations' | 'staff'>('overview');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const stations = [
    { name: 'Grelha', icon: Flame, avg: 14, target: 15, orders: 42, onTime: 38, late: 4, status: 'ok' as const },
    { name: 'Frios', icon: Snowflake, avg: 5, target: 8, orders: 28, onTime: 28, late: 0, status: 'excellent' as const },
    { name: 'Massas', icon: ChefHat, avg: 18, target: 20, orders: 35, onTime: 30, late: 5, status: 'ok' as const },
    { name: 'Bar', icon: GlassWater, avg: 4, target: 5, orders: 65, onTime: 60, late: 5, status: 'ok' as const },
    { name: 'Sobremesas', icon: ChefHat, avg: 12, target: 10, orders: 18, onTime: 10, late: 8, status: 'warning' as const },
  ];

  const staffPerformance = [
    { name: 'Chef Rafael', role: 'Chef', station: 'Grelha', avgTime: 13, orders: 22, rating: 4.8 },
    { name: 'Ana Paula', role: 'Cozinheira', station: 'Frios', avgTime: 4, orders: 28, rating: 4.9 },
    { name: 'Lucas Barman', role: 'Barman', station: 'Bar', avgTime: 3, orders: 45, rating: 4.7 },
    { name: 'Pedro Cook', role: 'Cozinheiro', station: 'Massas', avgTime: 19, orders: 18, rating: 4.2 },
    { name: 'Maria Santos', role: 'Confeiteira', station: 'Sobremesas', avgTime: 14, orders: 12, rating: 4.5 },
  ];

  const hourlyThroughput = [
    { hour: '11h', orders: 8 }, { hour: '12h', orders: 22 }, { hour: '13h', orders: 28 },
    { hour: '14h', orders: 15 }, { hour: '18h', orders: 10 }, { hour: '19h', orders: 32 },
    { hour: '20h', orders: 38 }, { hour: '21h', orders: 30 }, { hour: '22h', orders: 18 },
  ];

  const totalOrders = stations.reduce((s, st) => s + st.orders, 0);
  const totalLate = stations.reduce((s, st) => s + st.late, 0);
  const avgTime = stations.reduce((s, st) => s + st.avg * st.orders, 0) / totalOrders;
  const slaPercent = ((totalOrders - totalLate) / totalOrders * 100);
  const maxHourly = Math.max(...hourlyThroughput.map(h => h.orders));

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Analytics KDS</h1>
            <p className="text-xs text-muted-foreground">Performance da cozinha</p>
          </div>
        </div>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-3">
          {([['today', 'Hoje'], ['week', 'Semana'], ['month', 'Mês']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setPeriod(k as any)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${period === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>

        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([['overview', 'Visão Geral'], ['stations', 'Estações'], ['staff', 'Equipe']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k as any)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${view === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {view === 'overview' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-card rounded-2xl border border-border p-3">
                <Clock className="w-4 h-4 text-primary mb-1" />
                <p className="text-2xl font-bold text-foreground">{avgTime.toFixed(0)}min</p>
                <p className="text-[10px] text-muted-foreground">Tempo Médio</p>
                <p className="text-[10px] text-success">-2min vs ontem</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-3">
                <BarChart3 className="w-4 h-4 text-primary mb-1" />
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                <p className="text-[10px] text-muted-foreground">Pedidos</p>
                <p className="text-[10px] text-success">+15% vs ontem</p>
              </div>
              <div className={`rounded-2xl border p-3 ${slaPercent >= 85 ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
                <CheckCircle2 className={`w-4 h-4 mb-1 ${slaPercent >= 85 ? 'text-success' : 'text-warning'}`} />
                <p className={`text-2xl font-bold ${slaPercent >= 85 ? 'text-success' : 'text-warning'}`}>{slaPercent.toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground">SLA Atingido</p>
              </div>
              <div className={`rounded-2xl border p-3 ${totalLate === 0 ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                <AlertTriangle className={`w-4 h-4 mb-1 ${totalLate === 0 ? 'text-success' : 'text-destructive'}`} />
                <p className={`text-2xl font-bold ${totalLate === 0 ? 'text-success' : 'text-destructive'}`}>{totalLate}</p>
                <p className="text-[10px] text-muted-foreground">Atrasados</p>
              </div>
            </div>

            {/* Throughput chart */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground text-sm mb-4">Pedidos por Hora</h3>
              <div className="flex items-end gap-1.5 h-28">
                {hourlyThroughput.map(h => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] text-muted-foreground">{h.orders}</span>
                    <div className="w-full bg-muted rounded-t-sm" style={{ height: `${(h.orders / maxHourly) * 100}%` }}>
                      <div className="w-full h-full bg-primary rounded-t-sm" />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{h.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottleneck alert */}
            {stations.filter(s => s.status === 'warning').length > 0 && (
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <p className="text-xs font-bold text-foreground">Gargalos Detectados</p>
                </div>
                {stations.filter(s => s.status === 'warning').map(s => (
                  <div key={s.name} className="flex justify-between text-xs mt-1">
                    <span className="text-foreground">{s.name}</span>
                    <span className="text-destructive">{s.avg}min avg (meta: {s.target}min) · {s.late} atrasados</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'stations' && (
          <>
            {stations.map(st => {
              const Icon = st.icon;
              const pctOnTime = (st.onTime / st.orders) * 100;
              return (
                <div key={st.name} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      st.status === 'excellent' ? 'bg-success/10' : st.status === 'warning' ? 'bg-destructive/10' : 'bg-primary/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        st.status === 'excellent' ? 'text-success' : st.status === 'warning' ? 'text-destructive' : 'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{st.name}</p>
                      <p className="text-xs text-muted-foreground">{st.orders} pedidos</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${st.avg <= st.target ? 'text-success' : 'text-destructive'}`}>{st.avg}min</p>
                      <p className="text-[10px] text-muted-foreground">Meta: {st.target}min</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-muted text-center">
                      <p className="text-xs font-bold text-success">{st.onTime}</p>
                      <p className="text-[9px] text-muted-foreground">No prazo</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted text-center">
                      <p className="text-xs font-bold text-destructive">{st.late}</p>
                      <p className="text-[9px] text-muted-foreground">Atrasados</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted text-center">
                      <p className={`text-xs font-bold ${pctOnTime >= 85 ? 'text-success' : 'text-warning'}`}>{pctOnTime.toFixed(0)}%</p>
                      <p className="text-[9px] text-muted-foreground">SLA</p>
                    </div>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${st.avg <= st.target ? 'bg-success' : 'bg-destructive'}`} style={{ width: `${Math.min((st.avg / (st.target * 1.5)) * 100, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </>
        )}

        {view === 'staff' && (
          <>
            {staffPerformance.sort((a, b) => a.avgTime - b.avgTime).map((s, i) => (
              <div key={s.name} className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{s.name[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{s.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.role}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.station} · {s.orders} pedidos</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${s.avgTime <= 10 ? 'text-success' : s.avgTime <= 15 ? 'text-foreground' : 'text-warning'}`}>{s.avgTime}min</p>
                  <div className="flex items-center gap-0.5 justify-end">
                    <span className="text-[10px] text-warning">★</span>
                    <span className="text-[10px] text-muted-foreground">{s.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};