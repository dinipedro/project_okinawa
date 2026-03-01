import { Percent, Gift, Clock, Plus, Tag } from "lucide-react";

export const PromotionsScreenV2 = () => {
  const promos = [
    { id: 1, title: "Happy Hour", discount: "30% OFF", time: "17h-19h", active: true },
    { id: 2, title: "Combo Família", discount: "R$ 20 OFF", time: "Fins de semana", active: true },
    { id: 3, title: "Sobremesa Grátis", discount: "Grátis", time: "Pedidos +R$100", active: false },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-muted to-background p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center">
            <Percent className="h-5 w-5 text-destructive-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Promoções</h1>
            <p className="text-xs text-muted-foreground">{promos.filter(p => p.active).length} ativas</p>
          </div>
        </div>
        <button className="p-2 rounded-xl bg-secondary text-secondary-foreground">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {promos.map((promo) => (
          <div key={promo.id} className={`p-4 rounded-2xl border ${promo.active ? "bg-card/70 border-border" : "bg-muted/50 border-border opacity-60"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{promo.title}</h3>
                  <p className="text-xs text-muted-foreground">{promo.time}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground text-sm font-bold">
                {promo.discount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionsScreenV2;
