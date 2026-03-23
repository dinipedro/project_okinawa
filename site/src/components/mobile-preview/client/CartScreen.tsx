import { ArrowLeft, Minus, Plus, Trash2, Tag, ChevronRight, Sparkles, ClipboardList } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const cartItems = [
  { id: 1, name: "Ramen Tonkotsu", quantity: 2, price: 45.90, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop" },
  { id: 2, name: "Gyoza (6 un)", quantity: 1, price: 28.00, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=100&h=100&fit=crop" },
];

export const CartScreen = () => {
  const { goBack, navigate, currentTable } = useMobilePreview();
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
        <button 
          className="p-2 rounded-full hover:bg-muted transition-colors"
          onClick={goBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Meu Carrinho</h1>
          {currentTable && (
            <p className="text-xs text-muted-foreground">Mesa {currentTable}</p>
          )}
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="px-5 py-3 bg-muted/30">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=60&h=60&fit=crop"
            alt="Sakura Ramen"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Sakura Ramen</h3>
            <p className="text-xs text-muted-foreground">Mesa {currentTable || '12'} • Fine Dining</p>
          </div>
          <button 
            onClick={() => navigate('order-status')}
            className="p-2 rounded-lg bg-primary/10 text-primary"
          >
            <ClipboardList className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-3">
        <button 
          onClick={() => navigate('pairing-assistant')}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-sm text-foreground">Assistente de Harmonização</p>
            <p className="text-xs text-muted-foreground">Sugestões de bebidas e acompanhamentos</p>
          </div>
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-2">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-card border border-border">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm">{item.name}</h4>
                  <button className="p-1.5 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Adicionar observação</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg bg-muted">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More */}
        <button 
          className="w-full mt-4 py-3 rounded-xl border border-dashed border-primary text-primary font-medium text-sm"
          onClick={() => navigate('restaurant-detail')}
        >
          + Adicionar mais itens
        </button>

        {/* Coupon */}
        <button 
          className="w-full mt-4 p-4 rounded-2xl bg-muted/50 flex items-center justify-between"
          onClick={() => navigate('coupons')}
        >
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Adicionar cupom</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Summary & Checkout */}
      <div className="border-t border-border px-5 py-4 space-y-3 bg-background">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-primary">R$ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            className="flex-1 py-4 rounded-2xl bg-muted font-semibold"
            onClick={() => navigate('order-status')}
          >
            Ver Status
          </button>
          <button 
            className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold"
            onClick={() => navigate('checkout')}
          >
            Pagar Agora
          </button>
        </div>
      </div>
    </div>
  );
};
