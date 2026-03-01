import { Plus, Search, Edit2, Eye, EyeOff } from "lucide-react";

const menuCategories = ["Todos", "Ramen", "Entradas", "Bebidas", "Sobremesas"];

const menuItems = [
  { id: 1, name: "Ramen Tonkotsu", price: 45.90, available: true, image: "🍜" },
  { id: 2, name: "Gyoza (6 un)", price: 28.00, available: true, image: "🥟" },
  { id: 3, name: "Edamame", price: 18.00, available: false, image: "🫛" },
  { id: 4, name: "Chá Verde", price: 8.00, available: true, image: "🍵" },
];

export const RestaurantMenuScreen = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold">Cardápio</h1>
          <button className="p-3 rounded-full bg-primary text-primary-foreground">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar item..."
            className="w-full h-11 pl-12 pr-4 rounded-xl bg-muted text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {menuCategories.map((cat, i) => (
            <button key={cat} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-3">
        {menuItems.map((item) => (
          <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${
            item.available ? 'bg-card border-border' : 'bg-muted/50 border-border opacity-60'
          }`}>
            <div className="text-4xl">{item.image}</div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-primary font-bold">R$ {item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-xl ${item.available ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                {item.available ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
              <button className="p-2 rounded-xl bg-muted">
                <Edit2 className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
