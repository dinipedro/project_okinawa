import { Heart, Star, MapPin, Trash2 } from "lucide-react";

const favorites = [
  {
    id: 1,
    name: "Sakura Ramen",
    category: "Japonês",
    rating: 4.9,
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    name: "Café Lumière",
    category: "Café",
    rating: 4.7,
    distance: "800 m",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    name: "La Trattoria",
    category: "Italiano",
    rating: 4.8,
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop",
  },
];

export const FavoritesScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          Favoritos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{favorites.length} lugares salvos</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {favorites.map((place) => (
            <div
              key={place.id}
              className="rounded-2xl overflow-hidden bg-card border border-border group"
            >
              <div className="relative h-28">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
                <button className="absolute top-2 left-2 p-1.5 rounded-full bg-primary">
                  <Heart className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{place.name}</h3>
                <p className="text-xs text-muted-foreground">{place.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    {place.rating}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {place.distance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State Hint */}
        <div className="mt-6 p-4 rounded-2xl bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            Toque no ❤️ em qualquer restaurante para salvar aqui
          </p>
        </div>
      </div>
    </div>
  );
};
