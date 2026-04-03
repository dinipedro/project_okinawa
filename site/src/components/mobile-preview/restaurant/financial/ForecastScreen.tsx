import { FC, useState } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown, Calendar, AlertCircle, CloudRain, Sun, Users, DollarSign, BarChart3 } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

export const ForecastScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [view, setView] = useState<'weekly' | 'monthly' | 'seasonal'>('weekly');

  const weeklyData = [
    { day: 'Seg', prev: 3200, actual: 3450, occ: 65, weather: 'sun' },
    { day: 'Ter', prev: 2800, actual: 2650, occ: 55, weather: 'sun' },
    { day: 'Qua', prev: 3500, actual: 3720, occ: 70, weather: 'rain' },
    { day: 'Qui', prev: 4100, actual: null, occ: 78, weather: 'sun' },
    { day: 'Sex', prev: 5800, actual: null, occ: 92, weather: 'sun' },
    { day: 'Sáb', prev: 6200, actual: null, occ: 95, weather: 'rain' },
    { day: 'Dom', prev: 4500, actual: null, occ: 80, weather: 'sun' },
  ];

  const monthlyForecast = [
    { month: 'Abr', prev: 285000, trend: '+6%', season: 'Alta' },
    { month: 'Mai', prev: 262000, trend: '+2%', season: 'Normal' },
    { month: 'Jun', prev: 310000, trend: '+15%', season: 'Junina' },
    { month: 'Jul', prev: 298000, trend: '+8%', season: 'Férias' },
  ];

  const seasonalInsights = [
    { title: 'Dia dos Namorados', date: '12 Jun', impact: '+45%', prep: 'Reservar estoque extra de vinhos e sobremesas' },
    { title: 'Festa Junina', date: '24 Jun', impact: '+30%', prep: 'Adicionar menu temático e decoração' },
    { title: 'Férias Escolares', date: '01-31 Jul', impact: '+20%', prep: 'Ativar Modo Família e combos kids' },
  ];

  const totalPrevWeek = weeklyData.reduce((s, d) => s + d.prev, 0);
  const maxPrev = Math.max(...weeklyData.map(d => d.prev));

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Previsão & Forecast</h1>
            <p className="text-xs text-muted-foreground">Projeções baseadas em IA</p>
          </div>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([['weekly', 'Semanal'], ['monthly', 'Mensal'], ['seasonal', 'Sazonalidade']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k as any)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${view === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {view === 'weekly' && (
          <>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-4">
              <p className="text-xs text-muted-foreground">Receita Prevista (Semana)</p>
              <p className="text-3xl font-bold text-foreground">R$ {totalPrevWeek.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-success mt-1">Baseado na tendência atual (+6.1%)</p>
            </div>

            {/* Visual chart */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground text-sm mb-4">Previsto vs Realizado</h3>
              <div className="flex items-end gap-2 h-32">
                {weeklyData.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-0.5" style={{ height: '100%', alignItems: 'flex-end' }}>
                      <div className="flex-1 bg-primary/30 rounded-t-sm" style={{ height: `${(d.prev / maxPrev) * 100}%` }} />
                      {d.actual !== null && (
                        <div className={`flex-1 rounded-t-sm ${d.actual >= d.prev ? 'bg-success' : 'bg-warning'}`} style={{ height: `${(d.actual / maxPrev) * 100}%` }} />
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {d.weather === 'rain' ? <CloudRain className="w-2.5 h-2.5 text-info" /> : <Sun className="w-2.5 h-2.5 text-warning" />}
                      <span className="text-[9px] text-muted-foreground">{d.day}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-primary/30" /> Previsto</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-success" /> Realizado</div>
              </div>
            </div>

            {/* Day details */}
            {weeklyData.map(d => {
              const diff = d.actual !== null ? ((d.actual - d.prev) / d.prev * 100) : null;
              return (
                <div key={d.day} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                  <div className="w-10 text-center">
                    <p className="text-sm font-bold text-foreground">{d.day}</p>
                    {d.weather === 'rain' ? <CloudRain className="w-4 h-4 text-info mx-auto" /> : <Sun className="w-4 h-4 text-warning mx-auto" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Previsto: R$ {d.prev.toLocaleString('pt-BR')}</span>
                      {d.actual !== null && <span className={diff! >= 0 ? 'text-success' : 'text-destructive'}>Real: R$ {d.actual.toLocaleString('pt-BR')}</span>}
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                      <div className="h-full bg-primary/40 rounded-full" style={{ width: `${d.occ}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground">{d.occ}%</span>
                    </div>
                    {diff !== null && (
                      <span className={`text-[10px] font-medium ${diff >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {view === 'monthly' && (
          <>
            {monthlyForecast.map(m => (
              <div key={m.month} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-lg font-bold text-foreground">{m.month}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{m.season}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">R$ {(m.prev / 1000).toFixed(0)}K</p>
                    <span className={`text-xs font-medium ${m.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{m.trend}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(m.prev / 310000) * 100}%` }} />
                </div>
              </div>
            ))}
          </>
        )}

        {view === 'seasonal' && (
          <>
            <div className="p-3 rounded-2xl bg-info/10 border border-info/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
              <p className="text-xs text-info">Eventos sazonais próximos que podem impactar sua operação.</p>
            </div>
            {seasonalInsights.map(s => (
              <div key={s.title} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.title}</p>
                    <div className="flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{s.date}</span></div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-bold">{s.impact}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted mt-2">
                  <p className="text-xs text-muted-foreground">💡 <b className="text-foreground">Preparação:</b> {s.prep}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};