import { MapPin, Navigation, Clock, Car, Phone, MessageSquare, Star, ChevronRight } from "lucide-react";
import burgerIcon from "@/assets/icons/burger.png";

export const TrackLocationScreenV2 = () => {
  const orderInfo = {
    restaurant: "Burger House",
    driver: "Carlos M.",
    driverRating: 4.9,
    eta: "15 min",
    distance: "2.3 km",
    status: "A caminho",
    plate: "ABC-1234",
    orderNumber: "#2847",
  };

  const timeline = [
    { id: 1, status: "Pedido confirmado", time: "14:30", done: true },
    { id: 2, status: "Preparando", time: "14:35", done: true },
    { id: 3, status: "Saiu para entrega", time: "14:50", done: true },
    { id: 4, status: "Chegando", time: "~15:05", done: false, active: true },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-primary/10 to-accent/10 dark:from-background dark:to-background">
      {/* Map Area */}
      <div className="relative h-[45%] bg-gradient-to-br from-success/20 to-secondary/20 dark:from-success/10 dark:to-secondary/10">
        {/* Simulated Map */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
        </div>

        {/* Driver Location */}
        <div className="absolute top-1/3 left-1/4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary/30 animate-ping" />
        </div>

        {/* Destination */}
        <div className="absolute bottom-1/4 right-1/4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-success to-secondary flex items-center justify-center shadow-lg">
            <MapPin className="h-5 w-5 text-success-foreground" />
          </div>
        </div>

        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
          <path
            d="M 100 120 Q 150 180 200 200 Q 250 220 280 280"
            stroke="url(#gradient)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="8,8"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--success))" />
            </linearGradient>
          </defs>
        </svg>

        {/* ETA Badge */}
        <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-card/90 backdrop-blur-xl shadow-lg border border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Chegada em</p>
              <p className="text-lg font-bold text-primary">{orderInfo.eta}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="h-[55%] -mt-6 rounded-t-3xl bg-card/80 backdrop-blur-xl border-t border-border overflow-y-auto">
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-4" />

        <div className="px-4 space-y-4">
          {/* Driver Info */}
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {orderInfo.driver.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{orderInfo.driver}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-warning fill-warning" />
                    <span className="text-xs text-muted-foreground">{orderInfo.driverRating}</span>
                    <span className="text-xs text-muted-foreground/50 mx-1">•</span>
                    <span className="text-xs text-muted-foreground">{orderInfo.plate}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 rounded-xl bg-card shadow-md border border-border">
                  <Phone className="h-5 w-5 text-primary" />
                </button>
                <button className="p-3 rounded-xl bg-card shadow-md border border-border">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-info to-info/80 flex items-center justify-center">
                <Navigation className="h-3 w-3 text-info-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">Status do Pedido</span>
            </div>

            <div className="space-y-0">
              {timeline.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.done
                          ? "bg-gradient-to-br from-success to-secondary"
                          : item.active
                          ? "bg-gradient-to-br from-primary to-accent animate-pulse"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                    {index < timeline.length - 1 && (
                      <div className={`w-0.5 h-8 ${item.done ? "bg-success" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p
                      className={`text-sm font-medium ${
                        item.active ? "text-primary" : item.done ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.status}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <button className="w-full p-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <img src={burgerIcon} alt="Burger" className="w-10 h-10 object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{orderInfo.restaurant}</p>
                <p className="text-xs text-muted-foreground">Pedido {orderInfo.orderNumber}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackLocationScreenV2;
