import { FC } from 'react';
import { Heart, Star, MapPin, Trash2, ChevronLeft } from "lucide-react";
import LiquidGlassNav from '../components/LiquidGlassNav';

interface FavoritesScreenV2Props {
  onNavigate: (screen: string) => void;
}

const favorites = [
  {
    id: 1,
    name: "Omakase Sushi",
    category: "Japonês • Fine Dining",
    rating: 4.9,
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
  },
  {
    id: 2,
    name: "Trattoria Bella",
    category: "Italiano",
    rating: 4.7,
    distance: "800 m",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
  },
  {
    id: 3,
    name: "Café Lumière",
    category: "Café & Brunch",
    rating: 4.8,
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
  },
  {
    id: 4,
    name: "Bangkok Street",
    category: "Tailandês",
    rating: 4.6,
    distance: "3.5 km",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400",
  },
];

const FavoritesScreenV2: FC<FavoritesScreenV2Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home-v2')}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center">
                <Heart className="w-4 h-4 text-destructive-foreground fill-destructive-foreground" />
              </div>
              Favoritos
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{favorites.length} lugares salvos</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {favorites.map((place) => (
            <div
              key={place.id}
              className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              onClick={() => onNavigate('restaurant-detail-v2')}
            >
              <div className="relative h-32">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                <button className="absolute top-2 right-2 p-2 rounded-full bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
                <button className="absolute top-2 left-2 p-1.5 rounded-full bg-gradient-to-br from-destructive to-destructive/80 shadow-lg">
                  <Heart className="w-4 h-4 text-destructive-foreground fill-destructive-foreground" />
                </button>
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="font-semibold text-sm text-background truncate">{place.name}</h3>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-2">{place.category}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span className="font-semibold text-foreground">{place.rating}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {place.distance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State Hint */}
        <div className="mt-6 p-4 rounded-2xl bg-primary/10 border border-primary/30 text-center">
          <p className="text-sm text-foreground">
            Toque no <Heart className="w-4 h-4 inline text-destructive fill-destructive" /> em qualquer restaurante para salvar aqui
          </p>
        </div>
      </div>
      
      <LiquidGlassNav activeTab="favorites" onNavigate={onNavigate} />
    </div>
  );
};

export default FavoritesScreenV2;
