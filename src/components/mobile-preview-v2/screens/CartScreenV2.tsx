import { FC, useState } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, Tag, ChevronRight, Sparkles, MessageSquare } from 'lucide-react';

interface CartScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const initialCartItems = [
  { 
    id: 1, 
    name: 'Omakase Selection', 
    description: 'Seleção do chef com 12 peças', 
    quantity: 1, 
    price: 189.90, 
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200' 
  },
  { 
    id: 2, 
    name: 'Wagyu Tataki', 
    description: 'Com molho ponzu trufado', 
    quantity: 2, 
    price: 156.00, 
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200' 
  },
];

const CartScreenV2: FC<CartScreenV2Props> = ({ onNavigate, onBack }) => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [couponApplied, setCouponApplied] = useState(false);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-4 py-4 border-b border-border flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Meu Carrinho</h1>
          <p className="text-xs text-muted-foreground">Mesa 12 • Omakase Sushi</p>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-card mx-4 mt-4 rounded-2xl p-3 flex items-center gap-3 border border-border">
        <img
          src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100"
          alt="Omakase Sushi"
          className="w-14 h-14 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Omakase Sushi</h3>
          <p className="text-xs text-muted-foreground">Mesa 12 • Fine Dining</p>
        </div>
        <button 
          onClick={() => onNavigate('order-status')}
          className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium"
        >
          Ver Status
        </button>
      </div>

      {/* AI Pairing */}
      <div className="mx-4 mt-4">
        <button 
          onClick={() => onNavigate('pairing-assistant')}
          className="w-full p-4 rounded-2xl bg-foreground flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-background font-semibold text-sm">Sugestões de Harmonização</p>
            <p className="text-muted text-xs">Bebidas ideais para seu pedido</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl p-3 border border-border flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                    <button 
                      onClick={() => updateQuantity(item.id, -item.quantity)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <button className="flex items-center gap-1 text-xs text-primary mt-1">
                    <MessageSquare className="w-3 h-3" />
                    Adicionar observação
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                    >
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <span className="w-6 text-center font-semibold text-foreground">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 text-primary-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More */}
        <button 
          onClick={() => onNavigate('restaurant-detail')}
          className="w-full mt-4 py-3.5 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-medium text-sm hover:bg-primary/5 transition-colors"
        >
          + Adicionar mais itens
        </button>

        {/* Coupon */}
        <button 
          onClick={() => setCouponApplied(!couponApplied)}
          className={`w-full mt-4 p-4 rounded-2xl flex items-center justify-between transition-all ${
            couponApplied 
              ? 'bg-success/10 border border-success/30' 
              : 'bg-card border border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              couponApplied ? 'bg-success/20' : 'bg-muted'
            }`}>
              <Tag className={`h-5 w-5 ${couponApplied ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <div className="text-left">
              <span className={`text-sm font-medium ${couponApplied ? 'text-success' : 'text-foreground'}`}>
                {couponApplied ? 'WELCOME10 aplicado!' : 'Adicionar cupom'}
              </span>
              {couponApplied && (
                <p className="text-xs text-success">-10% de desconto</p>
              )}
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 ${couponApplied ? 'text-success' : 'text-muted-foreground'}`} />
        </button>
      </div>

      {/* Summary & Checkout */}
      <div className="bg-card border-t border-border px-4 py-4 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          {couponApplied && (
            <div className="flex justify-between text-sm text-success">
              <span>Desconto (10%)</span>
              <span>-R$ {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span className="text-foreground">Total</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('order-status')}
            className="flex-1 py-4 rounded-2xl bg-muted font-semibold text-foreground"
          >
            Ver Status
          </button>
          <button 
            onClick={() => onNavigate('checkout')}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg shadow-primary/25"
          >
            Pagar Agora
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreenV2;
