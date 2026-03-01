import { FC, useState } from 'react';
import { ArrowLeft, Plus, Minus, Check, ShoppingCart, ChevronRight } from 'lucide-react';

interface DishBuilderScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const bases = [
  { id: 'rice', name: 'Arroz Branco', price: 0 },
  { id: 'brown-rice', name: 'Arroz Integral', price: 2 },
  { id: 'noodles', name: 'Macarrão', price: 3 },
  { id: 'salad', name: 'Salada Verde', price: 0 },
  { id: 'quinoa', name: 'Quinoa', price: 4 },
];

const proteins = [
  { id: 'chicken', name: 'Frango Grelhado', price: 12 },
  { id: 'salmon', name: 'Salmão', price: 18 },
  { id: 'beef', name: 'Carne Bovina', price: 15 },
  { id: 'tofu', name: 'Tofu', price: 8 },
  { id: 'shrimp', name: 'Camarão', price: 20 },
];

const toppings = [
  { id: 'avocado', name: 'Abacate', price: 4 },
  { id: 'egg', name: 'Ovo', price: 3 },
  { id: 'edamame', name: 'Edamame', price: 4 },
  { id: 'corn', name: 'Milho', price: 2 },
  { id: 'cheese', name: 'Queijo', price: 3 },
  { id: 'bacon', name: 'Bacon', price: 5 },
];

const DishBuilderScreenV2: FC<DishBuilderScreenV2Props> = ({ onNavigate, onBack }) => {
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<string | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleTopping = (id: string) => {
    setSelectedToppings(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    let total = 0;
    const base = bases.find(b => b.id === selectedBase);
    const protein = proteins.find(p => p.id === selectedProtein);
    
    if (base) total += base.price;
    if (protein) total += protein.price;
    
    selectedToppings.forEach(t => {
      const topping = toppings.find(top => top.id === t);
      if (topping) total += topping.price;
    });
    
    return total * quantity;
  };

  const getSelectedBaseName = () => bases.find(b => b.id === selectedBase)?.name;
  const getSelectedProteinName = () => proteins.find(p => p.id === selectedProtein)?.name;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-background px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Monte seu Prato</h1>
            <p className="text-xs text-muted-foreground">Personalize do seu jeito</p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="px-5 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-medium ${selectedBase ? 'text-orange-600' : 'text-muted-foreground'}`}>
            {selectedBase ? getSelectedBaseName() : 'Base'}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className={`font-medium ${selectedProtein ? 'text-orange-600' : 'text-muted-foreground'}`}>
            {selectedProtein ? getSelectedProteinName() : 'Proteína'}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className={`font-medium ${selectedToppings.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
            {selectedToppings.length > 0 ? `${selectedToppings.length} toppings` : 'Toppings'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Base Selection */}
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white text-xs flex items-center justify-center font-bold">1</span>
            Escolha a Base
          </h2>
          <div className="space-y-2">
            {bases.map((base) => (
              <button
                key={base.id}
                onClick={() => setSelectedBase(base.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedBase === base.id 
                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30' 
                    : 'border-border bg-background hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedBase === base.id && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className={`font-medium ${selectedBase === base.id ? 'text-orange-600' : 'text-foreground'}`}>
                    {base.name}
                  </span>
                </div>
                <span className={`text-sm ${base.price > 0 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                  {base.price > 0 ? `+R$ ${base.price.toFixed(2)}` : 'Incluído'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Protein Selection */}
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white text-xs flex items-center justify-center font-bold">2</span>
            Escolha a Proteína
          </h2>
          <div className="space-y-2">
            {proteins.map((protein) => (
              <button
                key={protein.id}
                onClick={() => setSelectedProtein(protein.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedProtein === protein.id 
                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30' 
                    : 'border-border bg-background hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedProtein === protein.id && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className={`font-medium ${selectedProtein === protein.id ? 'text-orange-600' : 'text-foreground'}`}>
                    {protein.name}
                  </span>
                </div>
                <span className="text-sm text-orange-600 font-medium">
                  +R$ {protein.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Toppings Selection */}
        <div className="px-5 py-4">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white text-xs flex items-center justify-center font-bold">3</span>
            Adicione Toppings
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </h2>
          <div className="space-y-2">
            {toppings.map((topping) => (
              <button
                key={topping.id}
                onClick={() => toggleTopping(topping.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedToppings.includes(topping.id) 
                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30' 
                    : 'border-border bg-background hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedToppings.includes(topping.id)
                      ? 'border-orange-600 bg-gradient-to-br from-orange-600 to-amber-500'
                      : 'border-muted-foreground/30'
                  }`}>
                    {selectedToppings.includes(topping.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`font-medium ${selectedToppings.includes(topping.id) ? 'text-orange-600' : 'text-foreground'}`}>
                    {topping.name}
                  </span>
                </div>
                <span className="text-sm text-orange-600 font-medium">
                  +R$ {topping.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="px-5 pb-4">
          <div className="bg-muted rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Quantidade</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center"
                >
                  <Minus className="w-5 h-5 text-muted-foreground" />
                </button>
                <span className="text-xl font-bold text-foreground w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-5 bg-background border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">R$ {calculateTotal().toFixed(2)}</span>
        </div>
        <button
          onClick={() => onNavigate('cart')}
          disabled={!selectedBase || !selectedProtein}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-orange-600/25 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
};

export default DishBuilderScreenV2;
