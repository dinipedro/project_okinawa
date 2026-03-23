import React, { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import {
  ArrowLeft,
  Ticket,
  Calendar,
  Clock,
  Users,
  CreditCard,
  Check,
  ChevronRight,
  Sparkles,
  Star,
  Music,
  Gift,
  Minus,
  Plus,
  Info,
} from 'lucide-react';

// Event data
const eventData = {
  name: 'Friday Night Party',
  venue: 'Club Okinawa',
  date: 'Sexta, 31 Jan 2025',
  openTime: '23:00',
  closesAt: '05:00',
  image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=400&fit=crop',
  headliner: 'DJ Snake',
  genre: 'EDM / House',
};

const ticketTypes = [
  {
    id: 'pista',
    name: 'Pista',
    description: 'Acesso à pista principal',
    doorPrice: 80,
    advancePrice: 60,
    includes: ['Acesso à pista', '1 drink cortesia'],
    creditEnabled: true,
    creditPercentage: 50,
    available: true,
    quota: null,
  },
  {
    id: 'open_bar',
    name: 'Open Bar',
    description: 'Bebidas liberadas até 3h',
    doorPrice: 200,
    advancePrice: 150,
    includes: ['Acesso à pista', 'Open bar até 3h', 'Acesso área VIP'],
    creditEnabled: false,
    creditPercentage: 0,
    available: true,
    quota: 100,
    quotaRemaining: 23,
  },
  {
    id: 'vip',
    name: 'VIP Experience',
    description: 'Experiência premium exclusiva',
    doorPrice: 350,
    advancePrice: 280,
    includes: ['Acesso total', 'Open bar premium', 'Mesa exclusiva', 'Champagne cortesia'],
    creditEnabled: true,
    creditPercentage: 100,
    available: true,
    quota: 30,
    quotaRemaining: 8,
  },
];

export function TicketPurchaseScreen() {
  const { goBack, navigate } = useMobilePreview();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const ticket = ticketTypes.find((t) => t.id === selectedTicket);
  const total = ticket ? ticket.advancePrice * quantity : 0;
  const creditAmount = ticket && ticket.creditEnabled
    ? (total * ticket.creditPercentage) / 100
    : 0;

  const handlePurchase = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    navigate('ticket-confirmation');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Image */}
      <div className="relative h-48">
        <img
          src={eventData.image}
          alt={eventData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background" />
        <button
          onClick={goBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Event Info */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h1 className="text-xl font-bold text-foreground mb-1">{eventData.name}</h1>
          <p className="text-sm text-muted-foreground mb-3">{eventData.venue}</p>
          
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{eventData.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{eventData.openTime} - {eventData.closesAt}</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{eventData.headliner}</span>
            <span className="text-xs text-muted-foreground">• {eventData.genre}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-48">
        <h2 className="font-semibold text-foreground mb-3">Escolha seu ingresso</h2>

        <div className="space-y-3">
          {ticketTypes.map((type) => {
            const isSelected = selectedTicket === type.id;
            const discount = Math.round(
              ((type.doorPrice - type.advancePrice) / type.doorPrice) * 100
            );

            return (
              <button
                key={type.id}
                onClick={() => setSelectedTicket(type.id)}
                disabled={!type.available}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                } ${!type.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{type.name}</span>
                      {discount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-semibold">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-primary">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    R$ {type.advancePrice.toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {type.doorPrice.toFixed(0)}
                  </span>
                </div>

                {type.creditEnabled && type.creditPercentage > 0 && (
                  <div className="flex items-center gap-1.5 mb-2 text-success text-sm">
                    <Gift className="w-4 h-4" />
                    <span>{type.creditPercentage}% vira crédito de consumação</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {type.includes.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {type.quota && (
                  <p className="text-xs text-warning mt-2">
                    🔥 Apenas {type.quotaRemaining} restantes
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Guest List Option */}
        <button
          onClick={() => navigate('guest-list')}
          className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-primary/20">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Lista de Convidados</p>
            <p className="text-xs text-muted-foreground">Desconto especial até 22h</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Birthday Option */}
        <button
          onClick={() => navigate('birthday-entry')}
          className="w-full mt-3 p-4 rounded-2xl bg-card border border-border flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-muted">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Aniversariante?</p>
            <p className="text-xs text-muted-foreground">Entrada grátis com acompanhantes</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Bottom Section */}
      {selectedTicket && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8">
          <div className="p-4 bg-card border-t border-border">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Quantidade</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="p-2 rounded-lg bg-primary text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">R$ {total.toFixed(2)}</p>
                {creditAmount > 0 && (
                  <p className="text-xs text-success">
                    + R$ {creditAmount.toFixed(2)} em crédito
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Ticket className="w-5 h-5" />
                  Comprar Ingresso
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
