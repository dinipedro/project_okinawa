import { Bell, Gift, ShoppingBag, Star, Clock, Check, Trash2 } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "promo",
    icon: Gift,
    title: "50% OFF no Happy Hour!",
    message: "Sakura Ramen está com promoção especial. Válido até 19h.",
    time: "Agora",
    read: false
  },
  {
    id: 2,
    type: "order",
    icon: ShoppingBag,
    title: "Pedido a caminho!",
    message: "Seu pedido #1234 saiu para entrega. Previsão: 25 min.",
    time: "5 min",
    read: false
  },
  {
    id: 3,
    type: "review",
    icon: Star,
    title: "Avalie sua experiência",
    message: "Como foi seu pedido no Sakura Ramen? Deixe sua avaliação.",
    time: "1h",
    read: false
  },
  {
    id: 4,
    type: "order",
    icon: Check,
    title: "Pedido entregue",
    message: "Seu pedido #1233 foi entregue. Bom apetite!",
    time: "2h",
    read: true
  },
  {
    id: 5,
    type: "reminder",
    icon: Clock,
    title: "Reserva amanhã",
    message: "Lembrete: você tem uma reserva às 19h no Bistrô Paulista.",
    time: "3h",
    read: true
  },
  {
    id: 6,
    type: "promo",
    icon: Gift,
    title: "Ganhe 10 pontos!",
    message: "Complete 3 pedidos esta semana e ganhe pontos extras.",
    time: "1 dia",
    read: true
  },
];

const typeColors = {
  promo: "bg-accent/10 text-accent",
  order: "bg-primary/10 text-primary",
  review: "bg-secondary/10 text-secondary",
  reminder: "bg-muted text-muted-foreground",
};

export const NotificationsScreen = () => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-xl font-bold">Notificações</h1>
          <button className="text-sm text-primary font-medium">Marcar todas lidas</button>
        </div>
        <p className="text-sm text-muted-foreground">
          {unreadCount} não lidas
        </p>
      </div>

      {/* Notifications List */}
      <div className="flex-1 px-5 py-4 space-y-3">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`p-4 rounded-2xl border ${
              notif.read ? 'bg-card border-border' : 'bg-primary/5 border-primary/30'
            }`}
          >
            <div className="flex gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                typeColors[notif.type as keyof typeof typeColors]
              }`}>
                <notif.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <p className={`font-medium text-sm ${!notif.read && 'text-foreground'}`}>
                    {notif.title}
                  </p>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{notif.time}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
              </div>
            </div>
            {!notif.read && (
              <div className="absolute top-4 right-4 h-2 w-2 bg-primary rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* Clear All */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        <button className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-medium flex items-center justify-center gap-2">
          <Trash2 className="h-5 w-5" />
          Limpar todas
        </button>
      </div>
    </div>
  );
};
