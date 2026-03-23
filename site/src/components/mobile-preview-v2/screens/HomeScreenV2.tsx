import { FC } from 'react';
import { MapPin, Bell, Search, Star, Clock, ChevronRight, Flame, Award, TrendingUp } from 'lucide-react';
import LiquidGlassNav from '../components/LiquidGlassNav';
import brunchIcon from '@/assets/icons/brunch.png';
import outdoorIcon from '@/assets/icons/outdoor.png';
import saladIcon from '@/assets/icons/salad.png';
import wineIcon from '@/assets/icons/wine.png';

interface HomeScreenV2Props {
  onNavigate: (screen: string) => void;
}

const HomeScreenV2: FC<HomeScreenV2Props> = ({ onNavigate }) => {
  const featuredRestaurants = [
    {
      id: 1,
      name: 'Omakase Sushi',
      cuisine: 'Japonês • Fine Dining',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
      priceRange: '$$$$',
      waitTime: '~45 min',
    },
    {
      id: 2,
      name: 'Trattoria Bella',
      cuisine: 'Italiano • Casual',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      priceRange: '$$$',
      waitTime: '~20 min',
    },
  ];

  const trendingNow = [
    { id: 1, name: 'Brunch', count: 127, icon: brunchIcon },
    { id: 2, name: 'Rooftop', count: 89, icon: outdoorIcon },
    { id: 3, name: 'Vegano', count: 156, icon: saladIcon },
    { id: 4, name: 'Romântico', count: 203, icon: wineIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-background relative pb-24">
      {/* Premium Header */}
      <div className="relative px-5 pt-4 pb-6 bg-gradient-to-br from-primary via-primary/90 to-accent">
        <div className="absolute inset-0 bg-primary-foreground/5 opacity-30"></div>
        
        <div className="relative flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80 text-xs font-medium tracking-wide uppercase">Bem-vindo de volta</p>
            <h1 className="text-primary-foreground text-xl font-semibold tracking-tight">Olá, Ricardo</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-primary-foreground/90 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">Jardins, São Paulo</span>
          <ChevronRight className="w-4 h-4" />
        </div>

        {/* Search Bar */}
        <div 
          className="relative bg-card rounded-2xl shadow-lg shadow-primary/20 p-4 flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('explore-v2')}
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Buscar restaurantes, culinárias...</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Trending Categories */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-foreground font-semibold text-sm tracking-wide uppercase">Em Alta</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {trendingNow.map((trend) => (
              <button
                key={trend.id}
                className="flex-shrink-0 bg-card rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:shadow-lg transition-all duration-300 group border border-border hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                  <img src={trend.icon} alt={trend.name} className="w-10 h-10 object-contain mix-blend-multiply dark:mix-blend-normal" />
                </div>
                <div className="text-left">
                  <p className="text-foreground font-semibold text-sm">{trend.name}</p>
                  <p className="text-muted-foreground text-xs">{trend.count} lugares</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              <h2 className="text-foreground font-semibold text-sm tracking-wide uppercase">Destaques</h2>
            </div>
            <button className="text-primary text-sm font-medium flex items-center gap-1">
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {featuredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                onClick={() => onNavigate('explore-v2')}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                    <span className="text-foreground text-xs font-bold">{restaurant.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-primary-foreground font-semibold text-lg">{restaurant.name}</h3>
                    <p className="text-primary-foreground/80 text-sm">{restaurant.cuisine}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{restaurant.waitTime}</span>
                    </div>
                    <span className="text-primary font-semibold text-sm">{restaurant.priceRange}</span>
                  </div>
                  <button className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-5 py-2 rounded-full text-sm font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loyalty Banner */}
        <div className="px-5 pb-6">
          <div className="relative bg-foreground rounded-3xl p-5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Award className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-background font-semibold mb-0.5">Okinawa Rewards</h3>
                <p className="text-muted text-sm">2.450 pontos • Nível Gold</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* Liquid Glass Navigation */}
      <LiquidGlassNav activeTab="home" onNavigate={onNavigate} />
    </div>
  );
};

export default HomeScreenV2;
