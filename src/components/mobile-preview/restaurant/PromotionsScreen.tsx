import { Percent, Plus, Calendar, Users, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const promotions = [
  {
    id: 1,
    name: "Happy Hour",
    description: "50% off em drinks das 17h às 19h",
    discount: "50%",
    active: true,
    views: 1234,
    uses: 456,
    period: "17:00 - 19:00"
  },
  {
    id: 2,
    name: "Combo Família",
    description: "Ramen + 2 acompanhamentos por R$ 79,90",
    discount: "25%",
    active: true,
    views: 890,
    uses: 234,
    period: "Sáb e Dom"
  },
  {
    id: 3,
    name: "Primeira Compra",
    description: "15% de desconto no primeiro pedido",
    discount: "15%",
    active: false,
    views: 2345,
    uses: 567,
    period: "Sempre"
  },
];

const quickStats = [
  { label: "Promoções Ativas", value: "2" },
  { label: "Clientes Alcançados", value: "4.5k" },
  { label: "Vendas via Promoção", value: "R$ 12.3k" },
];

export const PromotionsScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-accent to-primary text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Percent className="h-8 w-8" />
            <div>
              <h1 className="font-display text-xl font-bold">Promoções</h1>
              <p className="text-sm opacity-80">Gerencie suas ofertas</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="flex-1 p-3 rounded-xl bg-white/10 text-center">
              <div className="font-bold">{stat.value}</div>
              <div className="text-xs opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotions List */}
      <div className="flex-1 px-5 py-4 space-y-4">
        {promotions.map((promo) => (
          <div key={promo.id} className={`p-4 rounded-2xl border-2 ${
            promo.active ? 'bg-card border-primary/30' : 'bg-muted/50 border-border'
          }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold ${
                  promo.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {promo.discount}
                </div>
                <div>
                  <p className="font-semibold">{promo.name}</p>
                  <p className="text-xs text-muted-foreground">{promo.description}</p>
                </div>
              </div>
              <button>
                {promo.active ? (
                  <ToggleRight className="h-6 w-6 text-primary" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{promo.period}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{promo.views}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{promo.uses} usaram</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <button className="flex-1 py-2 rounded-lg bg-secondary/10 text-secondary text-sm font-medium flex items-center justify-center gap-1">
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button className="py-2 px-4 rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        <button className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Promoção
        </button>
      </div>
    </div>
  );
};
