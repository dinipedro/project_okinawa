/**
 * RestaurantSelectorScreen V2 - Multi-Restaurant Selection
 * 
 * Post-login screen for staff members with access to multiple restaurants.
 * Displays all available restaurants with their roles and allows seamless
 * context switching without re-authentication.
 * 
 * @module screens/restaurant/RestaurantSelectorScreenV2
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  ChefHat,
  Crown,
  Users,
  UtensilsCrossed,
  Wine,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star,
  MapPin,
} from 'lucide-react';

interface RestaurantSelectorScreenV2Props {
  onNavigate: (screen: string) => void;
}

interface UserRestaurant {
  id: string;
  name: string;
  logo_url?: string;
  service_type: string;
  address: string;
  roles: string[];
  is_primary: boolean;
  last_accessed?: string;
}

// Role configuration with icons and colors
const ROLE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  owner: { icon: Crown, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Proprietário' },
  manager: { icon: Users, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Gerente' },
  chef: { icon: ChefHat, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Chef' },
  waiter: { icon: UtensilsCrossed, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Garçom' },
  barman: { icon: Wine, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', label: 'Barman' },
  maitre: { icon: Calendar, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', label: 'Maître' },
};

// Mock data for user's restaurants
const mockUserRestaurants: UserRestaurant[] = [
  {
    id: 'rest-1',
    name: 'Okinawa Sushi Bar',
    logo_url: undefined,
    service_type: 'Fine Dining',
    address: 'Av. Paulista, 1000 - São Paulo',
    roles: ['owner', 'manager'],
    is_primary: true,
    last_accessed: '2024-01-15T10:30:00Z',
  },
  {
    id: 'rest-2',
    name: 'Sakura Garden',
    logo_url: undefined,
    service_type: 'Casual Dining',
    address: 'Rua Oscar Freire, 500 - São Paulo',
    roles: ['chef'],
    is_primary: false,
    last_accessed: '2024-01-14T18:00:00Z',
  },
  {
    id: 'rest-3',
    name: 'Tokyo Express',
    logo_url: undefined,
    service_type: 'Quick Service',
    address: 'Shopping Iguatemi - São Paulo',
    roles: ['chef', 'barman'],
    is_primary: false,
    last_accessed: '2024-01-10T14:00:00Z',
  },
];

const RestaurantSelectorScreenV2: React.FC<RestaurantSelectorScreenV2Props> = ({ onNavigate }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRestaurant = async (restaurant: UserRestaurant) => {
    setSelectedId(restaurant.id);
    setIsLoading(true);

    // Simulate API call to switch context
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsLoading(false);
    // Navigate to the appropriate dashboard based on highest role
    onNavigate('restaurant-dashboard');
  };

  const formatLastAccessed = (dateStr?: string) => {
    if (!dateStr) return 'Nunca acessado';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Seus Restaurantes</h1>
            <p className="text-sm text-muted-foreground">
              Selecione o estabelecimento
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-5 mb-4">
        <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Acesso Multi-Restaurante</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Você tem acesso a {mockUserRestaurants.length} estabelecimentos. 
                Selecione um para continuar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant List */}
      <ScrollArea className="flex-1 px-5">
        <div className="space-y-4 pb-6">
          {mockUserRestaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className={`cursor-pointer transition-all duration-200 border-2 ${
                selectedId === restaurant.id
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
              }`}
              onClick={() => handleSelectRestaurant(restaurant)}
            >
              <CardContent className="p-4">
                {/* Restaurant Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Logo/Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {restaurant.name}
                        </h3>
                        {restaurant.is_primary && (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {restaurant.service_type}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{restaurant.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedId === restaurant.id ? (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                    </div>
                  ) : (
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <Separator className="my-3" />

                {/* Roles */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Seus cargos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.roles.map((role) => {
                      const config = ROLE_CONFIG[role];
                      if (!config) return null;
                      const IconComponent = config.icon;
                      
                      return (
                        <Badge
                          key={role}
                          variant="outline"
                          className={`${config.color} border text-xs font-medium`}
                        >
                          <IconComponent className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Last Accessed */}
                <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Último acesso: {formatLastAccessed(restaurant.last_accessed)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border/50 bg-background">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onNavigate('login')}
        >
          Sair da conta
        </Button>
      </div>
    </div>
  );
};

export default RestaurantSelectorScreenV2;
