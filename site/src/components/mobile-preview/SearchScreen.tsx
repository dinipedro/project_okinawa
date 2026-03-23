import { Search, X, Clock, TrendingUp, MapPin, Star, Filter, Home, Compass, Heart, User } from "lucide-react";

const recentSearches = [
  "Ramen japonês",
  "Café com wifi",
  "Italiano romântico",
];

const trending = [
  { name: "Brunch", count: "2.3k buscas" },
  { name: "Sushi all you can eat", count: "1.8k buscas" },
  { name: "Rooftop bar", count: "1.5k buscas" },
  { name: "Comida vegana", count: "1.2k buscas" },
];

const suggestions = [
  {
    id: 1,
    name: "Izakaya Toyo",
    category: "Japonês",
    rating: 4.8,
    distance: "1.5 km",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "The Coffee Lab",
    category: "Café",
    rating: 4.6,
    distance: "600 m",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&h=100&fit=crop",
  },
];

export const SearchScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="sticky top-0 bg-background z-40 px-5 py-4">
        <h1 className="font-display text-2xl font-bold mb-4">Buscar</h1>
        
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="O que você procura?"
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
            <Filter className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-24">
        {/* Recent Searches */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-muted-foreground">Buscas Recentes</h2>
            <button className="text-xs text-primary font-medium">Limpar</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted text-sm hover:bg-muted/80 transition-colors"
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {search}
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Em Alta
          </h2>
          <div className="space-y-2">
            {trending.map((item, index) => (
              <button
                key={item.name}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{item.count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-muted-foreground mb-3">Sugestões para Você</h2>
          <div className="space-y-3">
            {suggestions.map((place) => (
              <div
                key={place.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{place.name}</h4>
                  <p className="text-xs text-muted-foreground">{place.category}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {place.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {place.distance}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-3">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <Compass className="h-5 w-5" />
            <span className="text-xs font-medium">Explorar</span>
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
