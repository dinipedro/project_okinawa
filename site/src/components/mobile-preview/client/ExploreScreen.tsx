import React, { useState } from 'react';
import { useMobilePreview, ServiceType, SERVICE_TYPE_CONFIG } from '../context/MobilePreviewContext';
import { 
  Search, MapPin, Filter, Star, Clock, Navigation, 
  Heart, ChevronRight, Map, List, X
} from 'lucide-react';

const mockRestaurants = [
  {
    id: '1',
    name: 'Osteria Italiana',
    type: ServiceType.FINE_DINING,
    rating: 4.8,
    reviews: 234,
    distance: '1.2 km',
    time: '25 min',
    image: '🍝',
    cuisine: 'Italiana',
    priceRange: '$$$$',
    isOpen: true,
    hasReservation: true,
  },
  {
    id: '2',
    name: 'Burguer Express',
    type: ServiceType.QUICK_SERVICE,
    rating: 4.5,
    reviews: 567,
    distance: '0.5 km',
    time: '10 min',
    image: '🍔',
    cuisine: 'Fast Food',
    priceRange: '$$',
    isOpen: true,
    hasReservation: false,
  },
  {
    id: '3',
    name: 'Green Bowl',
    type: ServiceType.FAST_CASUAL,
    rating: 4.6,
    reviews: 189,
    distance: '0.8 km',
    time: '15 min',
    image: '🥗',
    cuisine: 'Saudável',
    priceRange: '$$',
    isOpen: true,
    hasReservation: false,
  },
  {
    id: '4',
    name: 'Café Central',
    type: ServiceType.COFFEE_SHOP,
    rating: 4.7,
    reviews: 312,
    distance: '0.3 km',
    time: '5 min',
    image: '☕',
    cuisine: 'Café & Doces',
    priceRange: '$',
    isOpen: true,
    hasReservation: false,
  },
  {
    id: '5',
    name: 'Sabor do Campo',
    type: ServiceType.BUFFET,
    rating: 4.4,
    reviews: 456,
    distance: '1.5 km',
    time: '20 min',
    image: '🍽️',
    cuisine: 'Variada',
    priceRange: '$$',
    isOpen: true,
    hasReservation: false,
  },
  {
    id: '6',
    name: 'Drive & Bite',
    type: ServiceType.DRIVE_THRU,
    rating: 4.3,
    reviews: 789,
    distance: '2.0 km',
    time: '8 min',
    image: '🚗',
    cuisine: 'Fast Food',
    priceRange: '$',
    isOpen: true,
    hasReservation: false,
  },
  {
    id: '7',
    name: 'Taco Truck',
    type: ServiceType.FOOD_TRUCK,
    rating: 4.9,
    reviews: 123,
    distance: '0.7 km',
    time: '12 min',
    image: '🌮',
    cuisine: 'Mexicana',
    priceRange: '$',
    isOpen: true,
    hasReservation: false,
  },
  {
    id: '8',
    name: 'Mesa do Chef',
    type: ServiceType.CHEFS_TABLE,
    rating: 5.0,
    reviews: 45,
    distance: '3.0 km',
    time: '35 min',
    image: '👨‍🍳',
    cuisine: 'Autoral',
    priceRange: '$$$$',
    isOpen: false,
    hasReservation: true,
  },
];

export function ExploreScreen() {
  const { navigate, serviceType } = useMobilePreview();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ServiceType | null>(serviceType);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRestaurants = mockRestaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !selectedFilter || r.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleRestaurantClick = (restaurant: typeof mockRestaurants[0]) => {
    navigate('restaurant-detail', { restaurant });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">São Paulo, SP</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="p-2 rounded-lg bg-accent"
          >
            {viewMode === 'list' ? <Map className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar restaurantes, culinárias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-accent border border-border text-foreground placeholder:text-muted-foreground"
          />
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${showFilters ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !selectedFilter ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground'
              }`}
            >
              Todos
            </button>
            {Object.entries(SERVICE_TYPE_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key as ServiceType)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  selectedFilter === key ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'map' ? (
          /* Map View */
          <div className="relative h-full bg-accent">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Map className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Mapa Interativo</p>
                <p className="text-xs">Visualize restaurantes próximos</p>
              </div>
            </div>
            {/* Map Markers Preview */}
            <div className="absolute top-4 left-4 right-4 space-y-2">
              {filteredRestaurants.slice(0, 3).map((r, i) => (
                <div 
                  key={r.id}
                  onClick={() => handleRestaurantClick(r)}
                  className="bg-card p-3 rounded-lg shadow-lg flex items-center gap-3 cursor-pointer"
                  style={{ marginLeft: `${i * 10}px` }}
                >
                  <span className="text-2xl">{r.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.distance}</p>
                  </div>
                  <Navigation className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="px-4 pb-4 space-y-3">
            {/* Quick Categories */}
            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 py-2 scrollbar-hide">
              {['🔥 Populares', '⭐ Bem Avaliados', '📍 Próximos', '💰 Promoções'].map((cat) => (
                <button
                  key={cat}
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 text-sm font-medium text-foreground border border-primary/20"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Restaurant List */}
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleRestaurantClick(restaurant)}
                className="bg-card rounded-xl p-4 border border-border cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-accent flex items-center justify-center text-3xl flex-shrink-0">
                    {restaurant.image}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground truncate">{restaurant.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                            {SERVICE_TYPE_CONFIG[restaurant.type].icon} {SERVICE_TYPE_CONFIG[restaurant.type].label}
                          </span>
                        </div>
                      </div>
                      <button className="p-1.5 rounded-full hover:bg-accent">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-foreground font-medium">{restaurant.rating}</span>
                        <span>({restaurant.reviews})</span>
                      </span>
                      <span>•</span>
                      <span>{restaurant.cuisine}</span>
                      <span>•</span>
                      <span>{restaurant.priceRange}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {restaurant.distance}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {restaurant.time}
                      </span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                        restaurant.isOpen ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                      }`}>
                        {restaurant.isOpen ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {(restaurant.hasReservation || SERVICE_TYPE_CONFIG[restaurant.type].hasQueue) && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    {restaurant.hasReservation && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                        Reservas disponíveis
                      </span>
                    )}
                    {SERVICE_TYPE_CONFIG[restaurant.type].hasQueue && (
                      <span className="text-xs px-2 py-1 rounded-full bg-accent text-foreground">
                        Fila virtual
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
