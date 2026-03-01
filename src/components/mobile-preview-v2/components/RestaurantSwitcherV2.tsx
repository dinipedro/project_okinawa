/**
 * RestaurantSwitcher V2 - Header Component for Multi-Restaurant
 * 
 * Displays current restaurant in header and provides a dropdown
 * for seamless switching between establishments without re-authentication.
 * 
 * @module components/RestaurantSwitcherV2
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  ChevronDown,
  ChefHat,
  Crown,
  Users,
  UtensilsCrossed,
  Wine,
  Calendar,
  CheckCircle2,
  ArrowRightLeft,
  LogOut,
} from 'lucide-react';

interface RestaurantSwitcherV2Props {
  onNavigate: (screen: string) => void;
  compact?: boolean;
}

interface UserRestaurant {
  id: string;
  name: string;
  service_type: string;
  roles: string[];
  is_current: boolean;
}

// Role icons mapping
const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown,
  manager: Users,
  chef: ChefHat,
  waiter: UtensilsCrossed,
  barman: Wine,
  maitre: Calendar,
};

// Mock data
const mockRestaurants: UserRestaurant[] = [
  {
    id: 'rest-1',
    name: 'Okinawa Sushi Bar',
    service_type: 'Fine Dining',
    roles: ['owner', 'manager'],
    is_current: true,
  },
  {
    id: 'rest-2',
    name: 'Sakura Garden',
    service_type: 'Casual Dining',
    roles: ['chef'],
    is_current: false,
  },
  {
    id: 'rest-3',
    name: 'Tokyo Express',
    service_type: 'Quick Service',
    roles: ['chef', 'barman'],
    is_current: false,
  },
];

const RestaurantSwitcherV2: React.FC<RestaurantSwitcherV2Props> = ({ 
  onNavigate,
  compact = false,
}) => {
  const [restaurants] = useState<UserRestaurant[]>(mockRestaurants);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const currentRestaurant = restaurants.find(r => r.is_current) || restaurants[0];
  const hasMultipleRestaurants = restaurants.length > 1;

  const handleSwitch = async (restaurantId: string) => {
    if (restaurantId === currentRestaurant?.id) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsSwitching(false);
    setIsOpen(false);
    
    // In real implementation, this would update the context
    // and potentially navigate to dashboard
  };

  const getHighestRole = (roles: string[]) => {
    const priority = ['owner', 'manager', 'maitre', 'chef', 'waiter', 'barman'];
    return roles.sort((a, b) => priority.indexOf(a) - priority.indexOf(b))[0];
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Proprietário',
      manager: 'Gerente',
      chef: 'Chef',
      waiter: 'Garçom',
      barman: 'Barman',
      maitre: 'Maître',
    };
    return labels[role] || role;
  };

  if (!currentRestaurant) return null;

  const HighestRoleIcon = ROLE_ICONS[getHighestRole(currentRestaurant.roles)] || Building2;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`gap-2 h-auto py-2 px-3 ${
            compact ? 'max-w-[180px]' : 'max-w-[240px]'
          } hover:bg-muted/50`}
          disabled={!hasMultipleRestaurants}
        >
          {/* Restaurant Icon */}
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>

          {/* Restaurant Info */}
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="text-sm font-medium text-foreground truncate w-full text-left">
              {currentRestaurant.name}
            </span>
            {!compact && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <HighestRoleIcon className="w-3 h-3" />
                <span>{getRoleLabel(getHighestRole(currentRestaurant.roles))}</span>
              </div>
            )}
          </div>

          {/* Dropdown Indicator */}
          {hasMultipleRestaurants && (
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="start" 
        className="w-[280px]"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          Trocar Restaurante
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* Restaurant List */}
        {restaurants.map((restaurant) => {
          const RoleIcon = ROLE_ICONS[getHighestRole(restaurant.roles)] || Building2;
          
          return (
            <DropdownMenuItem
              key={restaurant.id}
              className={`cursor-pointer py-3 ${
                restaurant.is_current ? 'bg-primary/5' : ''
              }`}
              onClick={() => handleSwitch(restaurant.id)}
              disabled={isSwitching}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Logo */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  restaurant.is_current 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'bg-muted'
                }`}>
                  <Building2 className={`w-5 h-5 ${
                    restaurant.is_current ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${
                      restaurant.is_current ? 'text-primary' : 'text-foreground'
                    }`}>
                      {restaurant.name}
                    </span>
                    {restaurant.is_current && (
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <RoleIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {restaurant.roles.map(r => getRoleLabel(r)).join(' • ')}
                    </span>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {/* View All */}
        <DropdownMenuItem
          className="cursor-pointer justify-center text-primary"
          onClick={() => {
            setIsOpen(false);
            onNavigate('restaurant-selector');
          }}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Ver todos os restaurantes
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => {
            setIsOpen(false);
            onNavigate('login');
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RestaurantSwitcherV2;
