import { BarChart3, TrendingUp, Users, Clock, Download } from "lucide-react";

export const ReportsScreenV2 = () => {
  return (
    <div className="h-full bg-gradient-to-b from-muted to-background p-4 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-info/80 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-info-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Relatórios</h1>
          <p className="text-xs text-muted-foreground">Análises e métricas</p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { title: "Vendas por Período", icon: TrendingUp, color: "from-success to-secondary" },
          { title: "Clientes Atendidos", icon: Users, color: "from-info to-info/80" },
          { title: "Tempo de Atendimento", icon: Clock, color: "from-warning to-primary" },
          { title: "Exportar Dados", icon: Download, color: "from-secondary to-secondary-light" },
        ].map((report, i) => (
          <button key={i} className="w-full p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center`}>
              <report.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">{report.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportsScreenV2;
