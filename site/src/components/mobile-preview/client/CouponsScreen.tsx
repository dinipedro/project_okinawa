import { Ticket, Copy, Clock, Check, Sparkles } from "lucide-react";

const coupons = [
  {
    id: 1,
    code: "OKINAWA20",
    discount: "20% OFF",
    description: "Em qualquer pedido acima de R$ 50",
    expires: "31/12/2024",
    status: "active",
    type: "percent"
  },
  {
    id: 2,
    code: "FRETE0",
    discount: "Frete Grátis",
    description: "Válido para entregas até 5km",
    expires: "15/01/2025",
    status: "active",
    type: "shipping"
  },
  {
    id: 3,
    code: "PRIMEIRO15",
    discount: "15% OFF",
    description: "Desconto exclusivo para novos usuários",
    expires: "Já usado",
    status: "used",
    type: "percent"
  },
  {
    id: 4,
    code: "ANIVER50",
    discount: "R$ 50 OFF",
    description: "Presente de aniversário! Pedido mínimo R$ 100",
    expires: "20/03/2025",
    status: "active",
    type: "fixed"
  },
];

const typeColors = {
  percent: "from-primary to-secondary",
  shipping: "from-secondary to-accent",
  fixed: "from-accent to-primary",
};

export const CouponsScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-accent to-primary text-primary-foreground">
        <div className="flex items-center gap-3 mb-3">
          <Ticket className="h-8 w-8" />
          <div>
            <h1 className="font-display text-xl font-bold">Meus Cupons</h1>
            <p className="text-sm opacity-80">{coupons.filter(c => c.status === 'active').length} disponíveis</p>
          </div>
        </div>

        {/* Add Coupon */}
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Digite o código do cupom"
            className="flex-1 px-4 py-3 rounded-xl bg-white/20 placeholder:text-white/60 text-white text-sm"
          />
          <button className="px-4 py-3 rounded-xl bg-white text-primary font-semibold text-sm">
            Adicionar
          </button>
        </div>
      </div>

      {/* Active Coupons */}
      <div className="px-5 py-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Cupons Ativos
        </h2>
        <div className="space-y-4">
          {coupons.filter(c => c.status === 'active').map((coupon) => (
            <div 
              key={coupon.id} 
              className="relative overflow-hidden rounded-2xl border border-border"
            >
              {/* Ticket cutout design */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-3 bg-background rounded-r-full" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-3 bg-background rounded-l-full" />
              
              <div className="flex">
                {/* Left side - discount */}
                <div className={`w-28 py-4 bg-gradient-to-br ${typeColors[coupon.type as keyof typeof typeColors]} text-white flex flex-col items-center justify-center`}>
                  <span className="text-2xl font-bold">{coupon.discount.split(' ')[0]}</span>
                  <span className="text-xs">{coupon.discount.split(' ')[1]}</span>
                </div>

                {/* Right side - details */}
                <div className="flex-1 p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-primary">{coupon.code}</span>
                    <button className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{coupon.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Válido até {coupon.expires}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Used Coupons */}
      <div className="px-5 py-4 flex-1">
        <h2 className="font-semibold mb-3 text-muted-foreground">Cupons Usados</h2>
        <div className="space-y-3">
          {coupons.filter(c => c.status === 'used').map((coupon) => (
            <div key={coupon.id} className="p-4 rounded-xl bg-muted/50 opacity-60">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-medium line-through">{coupon.code}</span>
                <div className="flex items-center gap-1 text-xs text-success">
                  <Check className="h-3 w-3" />
                  <span>Usado</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{coupon.discount} - {coupon.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
