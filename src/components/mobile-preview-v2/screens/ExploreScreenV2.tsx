import { useState, FC } from 'react';
import { Search, MapPin, Star, Clock, Filter, X, Heart, Map, List, Navigation, TrendingUp, Flame, Sparkles } from 'lucide-react';
import LiquidGlassNav from '../components/LiquidGlassNav';
import sushiIcon from "@/assets/icons/sushi.png";
import pizzaIcon from "@/assets/icons/pizza.png";
import burgerIcon from "@/assets/icons/burger.png";

interface ExploreScreenV2Props {
  onNavigate: (screen: string) => void;
}

const ExploreScreenV2: FC<ExploreScreenV2Props> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filters = [
    { id: 'todos', label: 'Todos' },
    { id: 'perto', label: 'Perto de mim' },
    { id: 'trending', label: 'Em alta' },
    { id: 'novos', label: 'Novos' },
    { id: 'premium', label: 'Premium' },
  ];

  const recentSearches = ['Sushi', 'Pizza', 'Hambúrguer', 'Café'];
  const trendingSearches = ['Brunch', 'Comida Japonesa', 'Rodízio', 'Vegano'];

  const restaurants = [
    {
      id: 1,
      name: 'Kotaro Sushi',
      cuisine: 'Japonês',
      rating: 4.9,
      distance: '0.8 km',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
      priceRange: '$$$$',
      waitTime: '30-45 min',
      isOpen: true,
      isFavorite: true,
      icon: sushiIcon,
      lat: 35,
      lng: 25,
    },
    {
      id: 2,
      name: 'Chez Marie',
      cuisine: 'Francês',
      rating: 4.8,
      distance: '1.2 km',
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400',
      priceRange: '$$$',
      waitTime: '15-20 min',
      isOpen: true,
      isFavorite: false,
      icon: pizzaIcon,
      lat: 55,
      lng: 60,
    },
    {
      id: 3,
      name: 'La Parrilla',
      cuisine: 'Argentino',
      rating: 4.7,
      distance: '2.1 km',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
      priceRange: '$$$',
      waitTime: '20-30 min',
      isOpen: true,
      isFavorite: true,
      icon: burgerIcon,
      lat: 70,
      lng: 40,
    },
    {
      id: 4,
      name: 'Tandoor Palace',
      cuisine: 'Indiano',
      rating: 4.6,
      distance: '1.8 km',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      priceRange: '$$',
      waitTime: '25-35 min',
      isOpen: false,
      isFavorite: false,
      icon: sushiIcon,
      lat: 25,
      lng: 75,
    },
  ];

  const filteredRestaurants = restaurants.filter((r) => {
    if (searchQuery) {
      return r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-background relative pb-24">
      {/* Header */}
      <div className="relative px-5 pt-4 pb-5 bg-gradient-to-br from-primary via-primary/90 to-accent">
        <div className="absolute inset-0 bg-primary-foreground/5 opacity-30" />
        
        <div className="relative flex items-center justify-between mb-4">
          <h1 className="text-primary-foreground text-xl font-semibold tracking-tight">Explorar</h1>
          <button className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <Filter className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Search Bar + View Toggle */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1 bg-card rounded-2xl shadow-lg shadow-primary/20 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Restaurantes, culinárias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 p-1 rounded-full bg-muted"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {/* View Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="w-14 h-14 rounded-2xl bg-card shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            {viewMode === 'list' ? (
              <Map className="h-5 w-5 text-primary" />
            ) : (
              <List className="h-5 w-5 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-5 py-3 bg-background border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' ? (
        <div className="flex-1 relative bg-gradient-to-br from-success/10 via-secondary/10 to-info/10">
          {/* Map Background Pattern */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }} />
            {/* Streets */}
            <div className="absolute top-1/4 left-0 right-0 h-1.5 bg-muted-foreground/20" />
            <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-muted-foreground/20" />
            <div className="absolute left-1/4 top-0 bottom-0 w-1.5 bg-muted-foreground/20" />
            <div className="absolute left-2/3 top-0 bottom-0 w-1.5 bg-muted-foreground/20" />
          </div>

          {/* User Location */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-info border-[3px] border-card shadow-lg flex items-center justify-center">
                <Navigation className="h-4 w-4 text-info-foreground" />
              </div>
              <div className="absolute inset-0 w-8 h-8 rounded-full bg-info/30 animate-ping" />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-info whitespace-nowrap bg-card px-2 py-0.5 rounded-full shadow-sm">Você</span>
          </div>

          {/* Restaurant Markers */}
          {filteredRestaurants.filter(r => r.isOpen).map((restaurant) => (
            <div
              key={restaurant.id}
              className="absolute z-10 cursor-pointer group"
              style={{ top: `${restaurant.lat}%`, left: `${restaurant.lng}%` }}
              onClick={() => onNavigate('restaurant-v2')}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-card shadow-xl border-2 border-primary flex items-center justify-center transform transition-transform group-hover:scale-110">
                  <img src={restaurant.icon} alt={restaurant.name} className="w-7 h-7 object-contain mix-blend-multiply dark:mix-blend-normal" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-card rounded-2xl shadow-xl p-3 min-w-36 border border-border">
                    <p className="font-semibold text-sm text-foreground">{restaurant.name}</p>
                    <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        <span className="text-xs font-medium text-foreground">{restaurant.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{restaurant.distance}</span>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-card transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-border" />
                </div>
              </div>
            </div>
          ))}

          {/* Map Controls */}
          <div className="absolute bottom-28 right-4 flex flex-col gap-2">
            <button className="w-12 h-12 rounded-2xl bg-card shadow-lg flex items-center justify-center text-foreground font-bold text-lg border border-border">+</button>
            <button className="w-12 h-12 rounded-2xl bg-card shadow-lg flex items-center justify-center text-foreground font-bold text-lg border border-border">−</button>
          </div>

          {/* Recenter Button */}
          <button className="absolute bottom-28 left-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-info to-info/80 text-info-foreground text-sm font-medium shadow-lg flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Recentralizar
          </button>
        </div>
      ) : (
        /* List View */
        <div className="flex-1 overflow-y-auto">
          {/* Recent & Trending Searches (when no search query) */}
          {!searchQuery && (
            <div className="px-5 py-4 space-y-5 bg-muted/30 border-b border-border">
              {/* Recent Searches */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <h2 className="text-foreground font-semibold text-xs tracking-wide uppercase">Buscas Recentes</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setSearchQuery(search)}
                      className="px-3 py-1.5 rounded-full bg-card text-xs text-foreground border border-border hover:bg-muted transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="text-foreground font-semibold text-xs tracking-wide uppercase">Em Alta</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setSearchQuery(search)}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-xs text-primary font-medium flex items-center gap-1 hover:shadow-md transition-all"
                    >
                      <Flame className="h-3 w-3" /> {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Restaurant List */}
          <div className="p-5 space-y-4">
            {searchQuery && (
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-foreground font-semibold text-xs tracking-wide uppercase">
                  {filteredRestaurants.length} Resultados
                </h2>
              </div>
            )}

            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className={`bg-card rounded-3xl overflow-hidden shadow-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer ${
                  !restaurant.isOpen ? 'opacity-70' : ''
                }`}
                onClick={() => onNavigate('restaurant-v2')}
              >
                <div className="flex">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    {!restaurant.isOpen && (
                      <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                        <span className="text-background text-xs font-medium bg-foreground/80 px-2 py-1 rounded-full">
                          Fechado
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-foreground font-semibold">{restaurant.name}</h3>
                        <button className="p-1">
                          <Heart 
                            className={`w-5 h-5 ${
                              restaurant.isFavorite 
                                ? 'text-destructive fill-destructive' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{restaurant.cuisine}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="text-primary font-medium">{restaurant.priceRange}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-foreground text-sm font-semibold">{restaurant.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs">{restaurant.distance}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{restaurant.waitTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liquid Glass Navigation */}
      <LiquidGlassNav activeTab="explore" onNavigate={onNavigate} />
    </div>
  );
};

export default ExploreScreenV2;
