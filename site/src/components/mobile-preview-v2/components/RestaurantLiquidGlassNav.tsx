import { FC } from 'react';
import { LayoutDashboard, ClipboardList, ChefHat, Wine, Users, Settings } from 'lucide-react';

interface RestaurantLiquidGlassNavProps {
  activeTab: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'orders', icon: ClipboardList, label: 'Pedidos' },
  { id: 'kitchen-kds', icon: ChefHat, label: 'Cozinha' },
  { id: 'tables', icon: Users, label: 'Mesas' },
  { id: 'settings', icon: Settings, label: 'Config' },
];

const RestaurantLiquidGlassNav: FC<RestaurantLiquidGlassNavProps> = ({ activeTab, onNavigate }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
      <div className="relative">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl rounded-[28px] border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]" />
        
        {/* Top gradient reflection */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-t-[28px] pointer-events-none" />
        
        {/* Nav Items */}
        <div className="relative flex items-center justify-around py-2.5 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all duration-500 ease-out group"
              >
                <div className={`relative p-2 rounded-xl transition-all duration-500 ease-out ${
                  isActive 
                    ? 'bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 shadow-[0_4px_20px_rgba(234,88,12,0.45)]' 
                    : 'group-hover:bg-slate-100/80'
                }`}>
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 blur-xl opacity-40 -z-10" />
                  )}
                  <Icon 
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                    }`} 
                    strokeWidth={isActive ? 2 : 1.5} 
                  />
                </div>
                <span className={`text-[9px] font-medium tracking-wide transition-all duration-300 ${
                  isActive ? 'text-orange-600' : 'text-slate-500 group-hover:text-slate-700'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Home indicator */}
      <div className="flex justify-center mt-2">
        <div className="w-28 h-1 bg-slate-900/20 rounded-full" />
      </div>
    </div>
  );
};

export default RestaurantLiquidGlassNav;
