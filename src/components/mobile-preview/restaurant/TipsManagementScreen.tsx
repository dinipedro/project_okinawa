import { 
  ChevronLeft, DollarSign, TrendingUp, Users, Clock,
  Heart, PieChart, Download, ChevronRight, ArrowUpRight,
  ArrowDownRight, Filter
} from "lucide-react";

const summary = {
  total_tips: 1847.50,
  tips_count: 42,
  average_tip: 43.99,
  pending_distribution: 285.00,
  comparison: {
    value: 12.5,
    direction: "up",
  },
};

const staffTips = [
  {
    id: "s1",
    name: "Carlos Silva",
    role: "Garçom",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    total_tips: 485.50,
    tips_count: 12,
    average_rating: 4.9,
  },
  {
    id: "s2",
    name: "Ana Santos",
    role: "Garçonete",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    total_tips: 420.00,
    tips_count: 10,
    average_rating: 4.8,
  },
  {
    id: "s3",
    name: "Roberto Lima",
    role: "Garçom",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
    total_tips: 380.00,
    tips_count: 9,
    average_rating: 4.7,
  },
  {
    id: "s4",
    name: "Equipe da Cozinha",
    role: "Cozinha",
    avatar: null,
    total_tips: 562.00,
    tips_count: 11,
    average_rating: 4.8,
  },
];

const recentTips = [
  {
    id: "t1",
    customer: "Pedro Alves",
    staff: "Carlos Silva",
    amount: 35.00,
    time: "14:32",
    message: "Excelente atendimento!",
  },
  {
    id: "t2",
    customer: "Maria Costa",
    staff: "Equipe",
    amount: 50.00,
    time: "13:45",
    message: null,
  },
  {
    id: "t3",
    customer: "João Ferreira",
    staff: "Ana Santos",
    amount: 25.00,
    time: "12:20",
    message: "Muito atenciosa",
  },
];

const distributionMethods = [
  { id: "equal", name: "Dividir Igual", description: "Entre todos os funcionários" },
  { id: "weighted", name: "Por Função", description: "Pesos definidos por cargo" },
  { id: "individual", name: "Individual", description: "Quem recebeu, fica" },
];

export const TipsManagementScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold">Gorjetas</h1>
            <p className="text-xs text-muted-foreground">Dezembro 2024</p>
          </div>
          <button className="p-2 rounded-full bg-muted">
            <Filter className="h-5 w-5" />
          </button>
        </div>
        
        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total do período</span>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              summary.comparison.direction === 'up' ? 'text-success' : 'text-destructive'
            }`}>
              {summary.comparison.direction === 'up' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {summary.comparison.value}%
            </span>
          </div>
          <p className="text-3xl font-bold mb-4">R$ {summary.total_tips.toFixed(2)}</p>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-semibold">{summary.tips_count}</p>
              <p className="text-xs text-muted-foreground">Gorjetas</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-lg font-semibold">R$ {summary.average_tip.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Média</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-warning">R$ {summary.pending_distribution.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Pendente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-32">
        {/* Pending Distribution Alert */}
        <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-warning/20">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Gorjetas pendentes</p>
              <p className="text-xs text-muted-foreground">5 gorjetas aguardando distribuição</p>
            </div>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-warning text-warning-foreground font-semibold text-sm">
            Distribuir R$ {summary.pending_distribution.toFixed(2)}
          </button>
        </div>

        {/* Staff Rankings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Por Funcionário</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Relatório
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {staffTips.map((staff, index) => (
              <div
                key={staff.id}
                className="p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {staff.avatar ? (
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    {index < 3 && (
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-slate-400 text-white' :
                        'bg-amber-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{staff.name}</span>
                      <span className="text-xs text-muted-foreground">• {staff.role}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{staff.tips_count} gorjetas</span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3 fill-destructive text-destructive" />
                        {staff.average_rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">R$ {staff.total_tips.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution Method */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Método de Distribuição</h2>
          <div className="space-y-2">
            {distributionMethods.map((method) => (
              <button
                key={method.id}
                className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 ${
                  method.id === 'equal'
                    ? 'bg-primary/5 border-primary'
                    : 'bg-card border-border'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  method.id === 'equal' ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {method.id === 'equal' && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-sm">{method.name}</span>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tips */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Gorjetas Recentes</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Ver todas
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {recentTips.map((tip) => (
              <div
                key={tip.id}
                className="p-3 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{tip.customer}</span>
                  <span className="font-bold text-sm text-success">R$ {tip.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Para: {tip.staff} • {tip.time}
                  </span>
                </div>
                {tip.message && (
                  <p className="text-xs text-muted-foreground mt-1 italic">"{tip.message}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
          <PieChart className="h-5 w-5" />
          Ver Relatório Completo
        </button>
      </div>
    </div>
  );
};
