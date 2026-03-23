import { FC, useState } from 'react';
import { ArrowLeft, Star, Heart, Clock, MapPin, Phone, Share2, ChevronRight, Plus, Minus, Sparkles, Users } from 'lucide-react';

interface RestaurantDetailScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

const menuCategories = [
  { id: 'popular', label: 'Populares' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'principais', label: 'Principais' },
  { id: 'sobremesas', label: 'Sobremesas' },
  { id: 'bebidas', label: 'Bebidas' },
];

const menuItems = [
  { 
    id: 1, 
    name: 'Omakase Selection', 
    description: 'Seleção do chef com 12 peças premium', 
    price: 189.90, 
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300',
    tag: 'Chef\'s Choice',
    rating: 4.9
  },
  { 
    id: 2, 
    name: 'Wagyu Tataki', 
    description: 'Wagyu levemente selado com molho ponzu trufado', 
    price: 156.00, 
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300',
    tag: 'Premium',
    rating: 4.8
  },
  { 
    id: 3, 
    name: 'Tempurá Misto', 
    description: 'Camarões e vegetais empanados crocantes', 
    price: 78.00, 
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300',
    rating: 4.7
  },
];

const RestaurantDetailScreenV2: FC<RestaurantDetailScreenV2Props> = ({ onNavigate, onBack }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const updateQuantity = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = menuItems.reduce((sum, item) => sum + (item.price * (quantities[item.id] || 0)), 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Hero Image */}
      <div className="relative h-64 flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800"
          alt="Omakase Sushi"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        
        {/* Header Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg">
              <Share2 className="h-5 w-5 text-foreground" />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
            </button>
          </div>
        </div>

        {/* Restaurant Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">Fine Dining</span>
            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">$$$$</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Omakase Sushi</h1>
          <p className="text-white/80 text-sm">Culinária Japonesa Contemporânea</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto -mt-4">
        {/* Info Card */}
        <div className="mx-4 bg-card rounded-3xl p-4 shadow-lg border border-border mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-warning/10 px-3 py-1.5 rounded-xl">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-bold text-foreground">4.9</span>
                <span className="text-xs text-muted-foreground">(324)</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">30-45 min</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">1.2 km</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigate('new-reservation')}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Fazer Reserva
            </button>
            <button className="px-4 py-3.5 rounded-2xl bg-muted text-foreground font-medium text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Ligar
            </button>
          </div>
        </div>

        {/* AI Pairing Suggestion */}
        <div className="mx-4 mb-4">
          <button 
            onClick={() => onNavigate('pairing-assistant')}
            className="w-full p-4 rounded-2xl bg-foreground flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-background font-semibold text-sm">Harmonização IA</p>
              <p className="text-muted-foreground text-xs">Sugestões personalizadas de bebidas</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Menu Categories */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-foreground text-background'
                    : 'bg-card text-muted-foreground border border-border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 pb-32">
          <h2 className="text-foreground font-bold text-lg mb-4">Cardápio</h2>
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border"
              >
                <div className="relative h-36">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.tag && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {item.tag}
                    </span>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="text-xs font-bold text-foreground">{item.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-lg">R$ {item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-3">
                      {(quantities[item.id] || 0) > 0 && (
                        <>
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <span className="w-6 text-center font-semibold text-foreground">{quantities[item.id]}</span>
                        </>
                      )}
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25"
                      >
                        <Plus className="w-4 h-4 text-primary-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="absolute bottom-20 left-4 right-4">
          <button 
            onClick={() => onNavigate('cart')}
            className="w-full py-4 px-6 rounded-2xl bg-foreground text-background font-semibold flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {totalItems}
              </span>
              <span>Ver Carrinho</span>
            </div>
            <span className="text-primary font-bold">R$ {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailScreenV2;
