import { Search, Bell, MapPin, Star, Heart, Clock, ChevronRight, Home, Compass, User } from "lucide-react";

const featuredPlaces = [
  {
    id: 1,
    name: "Sakura Ramen",
    category: "Japonês",
    rating: 4.9,
    distance: "1.2 km",
    price: "$$",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop",
    featured: true,
  },
  {
    id: 2,
    name: "Café Lumière",
    category: "Café",
    rating: 4.7,
    distance: "800 m",
    price: "$",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    name: "La Trattoria",
    category: "Italiano",
    rating: 4.8,
    distance: "2.1 km",
    price: "$$$",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop",
  },
];

const categories = [
  { icon: "🍜", name: "Japonês" },
  { icon: "☕", name: "Café" },
  { icon: "🍕", name: "Italiano" },
  { icon: "🍔", name: "Burger" },
  { icon: "🥗", name: "Saudável" },
];

export const HomeScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Olá, João 👋</p>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium">São Paulo, SP</span>
            </div>
          </div>
          <button className="relative p-2.5 rounded-full bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar experiências..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 py-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center gap-1.5 min-w-[60px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl hover:bg-primary/10 transition-colors">
                {cat.icon}
              </div>
              <span className="text-xs text-muted-foreground">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Em Destaque</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            Ver todos
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Featured Card */}
        <div className="relative rounded-3xl overflow-hidden h-44 mb-4">
          <img
            src={featuredPlaces[0].image}
            alt={featuredPlaces[0].name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Heart Button */}
          <button className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Heart className="h-5 w-5 text-white" />
          </button>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                Destaque
              </span>
            </div>
            <h3 className="text-white font-bold text-lg">{featuredPlaces[0].name}</h3>
            <div className="flex items-center gap-3 text-white/80 text-xs mt-1">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                {featuredPlaces[0].rating}
              </span>
              <span>{featuredPlaces[0].category}</span>
              <span>{featuredPlaces[0].distance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Section */}
      <div className="px-5 py-2 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Perto de Você</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            Ver mapa
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {featuredPlaces.slice(1).map((place) => (
            <div
              key={place.id}
              className="flex gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <img
                src={place.image}
                alt={place.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1 py-1">
                <h4 className="font-semibold text-sm">{place.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{place.category} • {place.price}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    {place.rating}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {place.distance}
                  </span>
                </div>
              </div>
              <button className="self-center p-2 rounded-full hover:bg-background transition-colors">
                <Heart className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-3">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-primary">
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Compass className="h-5 w-5" />
            <span className="text-xs">Explorar</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Heart className="h-5 w-5" />
            <span className="text-xs">Favoritos</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <User className="h-5 w-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
