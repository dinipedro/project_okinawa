import { Settings, Check } from "lucide-react";
import { useState } from "react";
import diningIcon from "@/assets/icons/dining.png";
import burgerIcon from "@/assets/icons/burger.png";
import saladIcon from "@/assets/icons/salad.png";
import coffeeIcon from "@/assets/icons/coffee.png";
import tacoIcon from "@/assets/icons/taco.png";
import foodTruckIcon from "@/assets/icons/food-truck.png";

export const ServiceTypeConfigScreenV2 = () => {
  const [selectedType, setSelectedType] = useState("casual_dining");
  
  const types: { id: string; name: string; icon: string; desc: string }[] = [
    { id: "casual_dining", name: "Casual Dining", icon: diningIcon, desc: "Restaurante tradicional" },
    { id: "fine_dining", name: "Fine Dining", icon: diningIcon, desc: "Alta gastronomia" },
    { id: "quick_service", name: "Quick Service", icon: burgerIcon, desc: "Fast food" },
    { id: "fast_casual", name: "Fast Casual", icon: saladIcon, desc: "Casual rápido" },
    { id: "coffee_shop", name: "Café/Padaria", icon: coffeeIcon, desc: "Cafeteria" },
    { id: "buffet", name: "Buffet", icon: tacoIcon, desc: "Self-service" },
    { id: "drive_thru", name: "Drive-Thru", icon: burgerIcon, desc: "Sem sair do carro" },
    { id: "food_truck", name: "Food Truck", icon: foodTruckIcon, desc: "Comida de rua" },
    { id: "chefs_table", name: "Chef's Table", icon: diningIcon, desc: "Menu degustação" },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-background to-muted p-4 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Tipo de Serviço</h1>
          <p className="text-xs text-muted-foreground">Configure seu modelo</p>
        </div>
      </div>

      <div className="space-y-3">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${
              selectedType === type.id
                ? "bg-primary/10 border-primary/50"
                : "bg-card/70 border-border/50"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
              <img src={type.icon} alt={type.name} className="w-12 h-12 object-contain mix-blend-multiply dark:mix-blend-normal" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground">{type.name}</h3>
              <p className="text-xs text-muted-foreground">{type.desc}</p>
            </div>
            {selectedType === type.id && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceTypeConfigScreenV2;
