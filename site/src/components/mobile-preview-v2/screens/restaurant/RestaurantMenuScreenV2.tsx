import { FC } from 'react';
import { ChevronLeft, Plus, Edit, Star } from "lucide-react";

interface RestaurantMenuScreenV2Props { onNavigate: (screen: string) => void; }

const menuItems = [
  { id: 1, name: 'Ramen Tonkotsu', price: 58.90, category: 'Pratos', active: true },
  { id: 2, name: 'Gyoza (6un)', price: 32.00, category: 'Entradas', active: true },
  { id: 3, name: 'Sashimi Mix', price: 89.00, category: 'Pratos', active: false },
];

const RestaurantMenuScreenV2: FC<RestaurantMenuScreenV2Props> = ({ onNavigate }) => (
  <div className="h-full flex flex-col bg-gradient-to-b from-muted to-background">
    <div className="px-5 py-4 bg-card border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('restaurant-dashboard-v2')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="text-xl font-semibold text-foreground">Cardápio</h1>
        </div>
        <button className="p-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground"><Plus className="w-5 h-5" /></button>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {menuItems.map(item => (
        <div key={item.id} className={`p-4 rounded-2xl bg-card border ${item.active ? 'border-border' : 'border-border opacity-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-foreground">{item.name}</span>
              <p className="text-sm text-muted-foreground">{item.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">R$ {item.price.toFixed(2)}</span>
              <button className="p-2 rounded-lg bg-muted"><Edit className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RestaurantMenuScreenV2;
