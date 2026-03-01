import { ArrowLeft, Star, Heart, Clock, MapPin, Phone, Share2, ChevronRight, Plus, Minus } from "lucide-react";

const menuItems = [
  { id: 1, name: "Ramen Tonkotsu", description: "Caldo cremoso de porco com chashu", price: 45.90, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop" },
  { id: 2, name: "Gyoza (6 un)", description: "Dumpling japonês crocante", price: 28.00, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=100&h=100&fit=crop" },
  { id: 3, name: "Edamame", description: "Soja verde no vapor", price: 18.00, image: "https://images.unsplash.com/photo-1564894809611-1742fc40ed80?w=100&h=100&fit=crop" },
];

export const RestaurantDetailScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Hero Image */}
      <div className="relative h-56 flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop"
          alt="Sakura Ramen"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Header Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button className="p-2.5 rounded-full bg-background/80 backdrop-blur-sm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-full bg-background/80 backdrop-blur-sm">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="p-2.5 rounded-full bg-background/80 backdrop-blur-sm">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 -mt-6 relative z-10">
        {/* Restaurant Info Card */}
        <div className="bg-card rounded-2xl p-4 shadow-lg border border-border mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-display text-xl font-bold">Sakura Ramen</h1>
              <p className="text-sm text-muted-foreground">Culinária Japonesa</p>
            </div>
            <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-semibold">4.9</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              20-30 min
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              1.2 km
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Ligar
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
            Fazer Reserva
          </button>
          <button className="flex-1 py-3 rounded-xl bg-muted font-medium text-sm">
            Ver no Mapa
          </button>
        </div>

        {/* Menu Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold">Cardápio</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Ver tudo
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {menuItems.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-muted/50">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">R$ {item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg bg-background">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">0</span>
                      <button className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-5 py-4">
        <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
          Ver Carrinho
          <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full text-sm">R$ 0,00</span>
        </button>
      </div>
    </div>
  );
};
