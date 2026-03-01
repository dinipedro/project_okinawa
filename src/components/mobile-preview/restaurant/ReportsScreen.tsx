import { BarChart3, TrendingUp, Calendar, Download, Filter, ChevronDown } from "lucide-react";

const weekData = [
  { day: "Seg", value: 65 },
  { day: "Ter", value: 80 },
  { day: "Qua", value: 55 },
  { day: "Qui", value: 90 },
  { day: "Sex", value: 100 },
  { day: "Sáb", value: 95 },
  { day: "Dom", value: 70 },
];

const topItems = [
  { name: "Ramen Tonkotsu", qty: 156, revenue: "R$ 6.240" },
  { name: "Gyoza (6un)", qty: 134, revenue: "R$ 2.680" },
  { name: "Yakissoba", qty: 98, revenue: "R$ 3.430" },
  { name: "Temaki Salmão", qty: 87, revenue: "R$ 2.610" },
  { name: "Hot Roll", qty: 76, revenue: "R$ 1.520" },
];

const metrics = [
  { label: "Ticket Médio", value: "R$ 68,50", change: "+5%" },
  { label: "Taxa de Retorno", value: "34%", change: "+2%" },
  { label: "Avaliação Média", value: "4.8", change: "+0.1" },
  { label: "Tempo de Atendimento", value: "18min", change: "-2min" },
];

export const ReportsScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-xl font-bold">Relatórios</h1>
          <button className="p-2 rounded-lg bg-primary/10 text-primary">
            <Download className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-muted text-sm">
            <Calendar className="h-4 w-4" />
            Esta Semana
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-lg bg-muted">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 py-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Vendas da Semana
        </h2>
        <div className="h-32 flex items-end justify-between gap-2 p-4 rounded-xl bg-card border border-border">
          {weekData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg transition-all"
                style={{ height: `${d.value}%` }}
              />
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="px-5 py-2">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="p-3 rounded-xl bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{metric.value}</span>
                <span className="text-xs text-success font-medium">{metric.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items */}
      <div className="px-5 py-4 flex-1">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-secondary" />
          Itens Mais Vendidos
        </h2>
        <div className="space-y-2">
          {topItems.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                i === 0 ? 'bg-primary text-primary-foreground' : 
                i === 1 ? 'bg-secondary text-secondary-foreground' :
                i === 2 ? 'bg-accent text-accent-foreground' : 'bg-muted'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.qty} vendidos</p>
              </div>
              <span className="font-bold text-sm">{item.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
