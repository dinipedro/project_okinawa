import { FC } from 'react';
import { Bell, Gift, ShoppingBag, Star, Clock, Check, Trash2, ChevronLeft } from "lucide-react";
import LiquidGlassNav from '../components/LiquidGlassNav';

interface NotificationsScreenV2Props {
  onNavigate: (screen: string) => void;
}

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
    type: "reservation",
    icon: Clock,
    title: "Reserva Confirmada!",
    message: "Sua reserva para amanhã às 19h no Omakase Sushi foi confirmada.",
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
    title: "Pedido pronto!",
    message: "Seu pedido #1233 está pronto para retirada. Mesa 12.",
    time: "2h",
    read: true
  },
  {
    id: 5,
    type: "reminder",
    icon: Clock,
    title: "Reserva em 15 minutos",
    message: "Lembrete: você tem uma reserva às 19h no Bistrô Paulista.",
    time: "3h",
    read: true
  },
  {
    id: 6,
    type: "promo",
    icon: Gift,
    title: "Ganhe 10 pontos!",
    message: "Complete 3 visitas esta semana e ganhe pontos extras.",
    time: "1 dia",
    read: true
  },
];

const NotificationsScreenV2: FC<NotificationsScreenV2Props> = ({ onNavigate }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeStyles = (type: string, read: boolean) => {
    const baseStyles = read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20';
    const iconStyles: Record<string, string> = {
      promo: 'bg-gradient-to-br from-primary to-accent text-primary-foreground',
      reservation: 'bg-gradient-to-br from-success to-success/80 text-success-foreground',
      review: 'bg-gradient-to-br from-warning to-warning/80 text-warning-foreground',
      order: 'bg-gradient-to-br from-success to-success/80 text-success-foreground',
      reminder: 'bg-gradient-to-br from-muted-foreground to-muted-foreground/80 text-background',
    };
    return { card: baseStyles, icon: iconStyles[type] || iconStyles.promo };
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <button 
            onClick={() => onNavigate('home-v2')}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Notificações</h1>
          </div>
          <button className="text-sm text-primary font-medium">
            Marcar todas lidas
          </button>
        </div>
        <p className="text-sm text-muted-foreground ml-9">
          {unreadCount} não lidas
        </p>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {notifications.map((notif) => {
          const styles = getTypeStyles(notif.type, notif.read);
          return (
            <div 
              key={notif.id} 
              className={`p-4 rounded-2xl border ${styles.card} shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${styles.icon}`}>
                  <notif.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className={`font-semibold text-sm ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {!notif.read && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                      <span className="text-xs text-muted-foreground">{notif.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear All */}
      <div className="p-4 bg-card border-t border-border">
        <button className="w-full py-3.5 rounded-2xl bg-muted text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
          <Trash2 className="w-5 h-5" />
          Limpar todas
        </button>
      </div>
      
      <LiquidGlassNav activeTab="notifications" onNavigate={onNavigate} />
    </div>
  );
};

export default NotificationsScreenV2;
