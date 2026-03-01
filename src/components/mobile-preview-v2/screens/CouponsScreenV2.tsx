import { Ticket, Clock, Percent, Gift, Tag, Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

export const CouponsScreenV2 = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const coupons = [
    {
      id: 1,
      code: "OKINAWA20",
      discount: "20% OFF",
      description: "Em qualquer pedido acima de R$ 50",
      expiry: "Válido até 30/12",
      type: "percent",
      color: "from-orange-400 to-amber-500",
      bgColor: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
    },
    {
      id: 2,
      code: "PRIMEIRACOMPRA",
      discount: "R$ 15 OFF",
      description: "No primeiro pedido do app",
      expiry: "Sem data de validade",
      type: "fixed",
      color: "from-emerald-400 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
    },
    {
      id: 3,
      code: "FRETEGRATIS",
      discount: "Frete Grátis",
      description: "Em pedidos acima de R$ 80",
      expiry: "Válido até 15/01",
      type: "delivery",
      color: "from-blue-400 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    },
    {
      id: 4,
      code: "SOBREMESA",
      discount: "Sobremesa Grátis",
      description: "Na compra de qualquer prato principal",
      expiry: "Válido até 20/12",
      type: "gift",
      color: "from-pink-400 to-rose-500",
      bgColor: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
    },
  ];

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "percent":
        return Percent;
      case "fixed":
        return Tag;
      case "delivery":
        return Ticket;
      case "gift":
        return Gift;
      default:
        return Ticket;
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-orange-50 to-amber-50 dark:from-background dark:to-background overflow-y-auto">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Meus Cupons</h1>
            <p className="text-xs text-muted-foreground">{coupons.length} cupons disponíveis</p>
          </div>
        </div>

        {/* Add Coupon Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Adicionar código de cupom"
            className="w-full pl-4 pr-24 py-4 rounded-2xl bg-card backdrop-blur-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium">
            Aplicar
          </button>
        </div>
      </div>

      {/* Coupons List */}
      <div className="px-4 pb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-foreground">Disponíveis</span>
        </div>

        {coupons.map((coupon) => {
          const Icon = getIcon(coupon.type);
          return (
            <div
              key={coupon.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${coupon.bgColor} border border-border`}
            >
              {/* Decorative Elements */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
              
              {/* Dashed Line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-border" style={{ zIndex: 0 }} />

              <div className="relative p-4 flex items-center gap-4" style={{ zIndex: 1 }}>
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${coupon.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{coupon.discount}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{coupon.description}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{coupon.expiry}</span>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(coupon.id, coupon.code)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    copiedId === coupon.id 
                      ? "bg-emerald-500" 
                      : "bg-card shadow-md"
                  }`}>
                    {copiedId === coupon.id ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <Copy className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {coupon.code}
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State Info */}
        <div className="p-4 rounded-2xl bg-card backdrop-blur-sm border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Fique de olho! Novos cupons são adicionados frequentemente 🎁
          </p>
        </div>
      </div>
    </div>
  );
};

export default CouponsScreenV2;
