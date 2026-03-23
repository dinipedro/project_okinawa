import { useState } from 'react';
import { Home, Search, Calendar, User, Users } from 'lucide-react';
import HomeScreenV2 from './screens/HomeScreenV2';
import ExploreScreenV2 from './screens/ExploreScreenV2';
import RestaurantDetailScreenV2 from './screens/RestaurantDetailScreenV2';
import ReservationsScreenV2 from './screens/ReservationsScreenV2';
import ProfileScreenV2 from './screens/ProfileScreenV2';
import CartScreenV2 from './screens/CartScreenV2';
import OrdersScreenV2 from './screens/OrdersScreenV2';
import OrderStatusScreenV2 from './screens/OrderStatusScreenV2';
import CheckoutScreenV2 from './screens/CheckoutScreenV2';
import LoyaltyScreenV2 from './screens/LoyaltyScreenV2';
import WaitlistScreenV2 from './screens/WaitlistScreenV2';
import CallWaiterCasualScreenV2 from './screens/CallWaiterCasualScreenV2';
import PartialOrderScreenV2 from './screens/PartialOrderScreenV2';

const MobilePreviewV2 = () => {
  const [currentScreen, setCurrentScreen] = useState('home-v2');
  const [screenHistory, setScreenHistory] = useState<string[]>([]);

  const handleNavigate = (screen: string) => {
    setScreenHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (screenHistory.length > 0) {
      const newHistory = [...screenHistory];
      const previousScreen = newHistory.pop();
      setScreenHistory(newHistory);
      setCurrentScreen(previousScreen || 'home-v2');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home-v2': return <HomeScreenV2 onNavigate={handleNavigate} />;
      case 'explore-v2': return <ExploreScreenV2 onNavigate={handleNavigate} />;
      case 'restaurant-detail': return <RestaurantDetailScreenV2 onNavigate={handleNavigate} onBack={handleBack} />;
      case 'reservations': return <ReservationsScreenV2 onNavigate={handleNavigate} />;
      case 'profile': return <ProfileScreenV2 onNavigate={handleNavigate} />;
      case 'cart': return <CartScreenV2 onNavigate={handleNavigate} onBack={handleBack} />;
      case 'orders': return <OrdersScreenV2 onNavigate={handleNavigate} onBack={handleBack} />;
      case 'order-status': return <OrderStatusScreenV2 onNavigate={handleNavigate} onBack={handleBack} />;
      case 'checkout': return <CheckoutScreenV2 onNavigate={handleNavigate} onBack={handleBack} />;
      case 'loyalty': return <LoyaltyScreenV2 onNavigate={handleNavigate} />;
      case 'waitlist': return <WaitlistScreenV2 onNavigate={handleNavigate} onBack={handleBack} />;
      case 'call-waiter': return <CallWaiterCasualScreenV2 onNavigate={handleNavigate} onBack={handleBack} />;
      case 'partial-order': return <PartialOrderScreenV2 onNavigate={handleNavigate} onBack={handleBack} />;
      default: return <HomeScreenV2 onNavigate={handleNavigate} />;
    }
  };

  const navItems = [
    { id: 'home-v2', icon: Home, label: 'Início' },
    { id: 'explore-v2', icon: Search, label: 'Explorar' },
    { id: 'waitlist', icon: Users, label: 'Fila' },
    { id: 'reservations', icon: Calendar, label: 'Reservas' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  const showNav = ['home-v2', 'explore-v2', 'reservations', 'profile', 'waitlist'].includes(currentScreen);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted p-8">
      <div className="relative">
        <div className="w-[375px] h-[812px] bg-foreground/90 rounded-[55px] p-3 shadow-2xl">
          <div className="w-full h-full bg-background rounded-[45px] overflow-hidden relative">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-between px-8 pt-2">
              <span className="text-foreground text-sm font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-2 bg-foreground rounded-full" />
                  <div className="w-1 h-2.5 bg-foreground rounded-full" />
                  <div className="w-1 h-3 bg-foreground rounded-full" />
                  <div className="w-1 h-3.5 bg-foreground rounded-full" />
                </div>
                <div className="w-6 h-3 bg-foreground rounded-sm ml-1" />
              </div>
            </div>

            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-foreground rounded-full z-20" />

            <div className="h-full pt-12 overflow-y-auto">
              {renderScreen()}
              
              {showNav && (
                <div className="sticky bottom-4 mx-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-card/80 backdrop-blur-2xl rounded-[28px] border border-border shadow-lg" />
                    <div className="relative flex items-center justify-around py-3 px-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentScreen === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => { setScreenHistory([]); setCurrentScreen(item.id); }}
                            className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all duration-500 ease-out group"
                          >
                            <div className={`relative p-2 rounded-2xl transition-all duration-500 ease-out ${
                              isActive 
                                ? 'bg-primary shadow-glow' 
                                : 'group-hover:bg-muted'
                            }`}>
                              <Icon className={`w-5 h-5 transition-all duration-300 ${
                                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                              }`} strokeWidth={isActive ? 2 : 1.5} />
                            </div>
                            <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${
                              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            }`}>
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-center mt-3">
                    <div className="w-28 h-1 bg-muted-foreground/20 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePreviewV2;
