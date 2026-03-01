import React, { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, Plus, Minus, Check, Info, Leaf, Flame, AlertTriangle } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  calories: number;
  isVegan?: boolean;
  isSpicy?: boolean;
  allergens?: string[];
}

const categories = [
  { id: 'base', name: 'Base', min: 1, max: 1 },
  { id: 'protein', name: 'Proteína', min: 0, max: 2 },
  { id: 'toppings', name: 'Toppings', min: 0, max: 5 },
  { id: 'sauce', name: 'Molho', min: 0, max: 2 },
  { id: 'extras', name: 'Extras', min: 0, max: 3 },
];

const ingredients: Ingredient[] = [
  // Bases
  { id: 'b1', name: 'Arroz Integral', category: 'base', price: 0, calories: 150, isVegan: true },
  { id: 'b2', name: 'Mix de Folhas', category: 'base', price: 0, calories: 30, isVegan: true },
  { id: 'b3', name: 'Quinoa', category: 'base', price: 3, calories: 120, isVegan: true },
  { id: 'b4', name: 'Macarrão Integral', category: 'base', price: 2, calories: 180, isVegan: true },
  // Proteins
  { id: 'p1', name: 'Frango Grelhado', category: 'protein', price: 8, calories: 165 },
  { id: 'p2', name: 'Salmão', category: 'protein', price: 15, calories: 200 },
  { id: 'p3', name: 'Tofu', category: 'protein', price: 6, calories: 80, isVegan: true },
  { id: 'p4', name: 'Carne Bovina', category: 'protein', price: 12, calories: 250 },
  // Toppings
  { id: 't1', name: 'Tomate Cereja', category: 'toppings', price: 2, calories: 15, isVegan: true },
  { id: 't2', name: 'Pepino', category: 'toppings', price: 1.5, calories: 10, isVegan: true },
  { id: 't3', name: 'Cenoura', category: 'toppings', price: 1.5, calories: 20, isVegan: true },
  { id: 't4', name: 'Abacate', category: 'toppings', price: 4, calories: 80, isVegan: true },
  { id: 't5', name: 'Edamame', category: 'toppings', price: 3, calories: 60, isVegan: true },
  { id: 't6', name: 'Queijo Feta', category: 'toppings', price: 4, calories: 100, allergens: ['Leite'] },
  // Sauces
  { id: 's1', name: 'Molho Tahine', category: 'sauce', price: 2, calories: 60, isVegan: true },
  { id: 's2', name: 'Molho Sriracha', category: 'sauce', price: 1, calories: 10, isVegan: true, isSpicy: true },
  { id: 's3', name: 'Azeite Trufado', category: 'sauce', price: 5, calories: 90, isVegan: true },
  { id: 's4', name: 'Molho Caesar', category: 'sauce', price: 2, calories: 80 },
  // Extras
  { id: 'e1', name: 'Castanhas', category: 'extras', price: 4, calories: 100, isVegan: true },
  { id: 'e2', name: 'Ovo Cozido', category: 'extras', price: 3, calories: 70 },
  { id: 'e3', name: 'Sementes de Gergelim', category: 'extras', price: 1, calories: 30, isVegan: true },
];

export function DishBuilderScreen() {
  const { goBack, navigate, addToCart } = useMobilePreview();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('base');

  const toggleIngredient = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    const category = categories.find(c => c.id === ingredient.category);
    if (!category) return;

    const currentCategorySelections = selectedIngredients.filter(id => 
      ingredients.find(i => i.id === id)?.category === ingredient.category
    );

    if (selectedIngredients.includes(ingredientId)) {
      setSelectedIngredients(prev => prev.filter(id => id !== ingredientId));
    } else if (currentCategorySelections.length < category.max) {
      setSelectedIngredients(prev => [...prev, ingredientId]);
    }
  };

  const getSelectedByCategory = (categoryId: string) => 
    selectedIngredients.filter(id => 
      ingredients.find(i => i.id === id)?.category === categoryId
    ).length;

  const totalPrice = selectedIngredients.reduce((sum, id) => {
    const ing = ingredients.find(i => i.id === id);
    return sum + (ing?.price || 0);
  }, 25); // Base price

  const totalCalories = selectedIngredients.reduce((sum, id) => {
    const ing = ingredients.find(i => i.id === id);
    return sum + (ing?.calories || 0);
  }, 0);

  const isVeganDish = selectedIngredients.every(id => 
    ingredients.find(i => i.id === id)?.isVegan
  );

  const handleAddToCart = () => {
    const dish = {
      id: `custom-${Date.now()}`,
      name: 'Prato Personalizado',
      price: totalPrice,
      calories: totalCalories,
      ingredients: selectedIngredients.map(id => ingredients.find(i => i.id === id)?.name),
      isVegan: isVeganDish,
    };
    addToCart(dish);
    navigate('cart');
  };

  const categoryIngredients = ingredients.filter(i => i.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Monte seu Prato</h1>
          <p className="text-xs text-muted-foreground">Customize como preferir</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto border-b border-border scrollbar-hide">
        {categories.map((cat) => {
          const count = getSelectedByCategory(cat.id);
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent text-foreground'
              }`}
            >
              {cat.name}
              {count > 0 && (
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                  isActive ? 'bg-primary-foreground/20' : 'bg-primary text-primary-foreground'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Info */}
      <div className="px-4 py-2 bg-accent/50">
        <p className="text-xs text-muted-foreground">
          {categories.find(c => c.id === activeCategory)?.min === 1 
            ? 'Obrigatório: escolha 1' 
            : `Opcional: escolha até ${categories.find(c => c.id === activeCategory)?.max}`
          }
        </p>
      </div>

      {/* Ingredients List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {categoryIngredients.map((ingredient) => {
            const isSelected = selectedIngredients.includes(ingredient.id);
            
            return (
              <button
                key={ingredient.id}
                onClick={() => toggleIngredient(ingredient.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{ingredient.name}</span>
                    {ingredient.isVegan && <Leaf className="w-4 h-4 text-green-500" />}
                    {ingredient.isSpicy && <Flame className="w-4 h-4 text-red-500" />}
                    {ingredient.allergens && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{ingredient.calories} kcal</p>
                </div>
                
                <span className={`font-medium ${ingredient.price === 0 ? 'text-green-600' : 'text-foreground'}`}>
                  {ingredient.price === 0 ? 'Incluso' : `+R$ ${ingredient.price.toFixed(2)}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary & Add to Cart */}
      <div className="p-4 border-t border-border bg-card">
        {/* Nutrition Summary */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {totalCalories} kcal
            </span>
            {isVeganDish && selectedIngredients.length > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <Leaf className="w-4 h-4" />
                Vegano
              </span>
            )}
          </div>
          <span className="text-muted-foreground">
            {selectedIngredients.length} ingredientes
          </span>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddToCart}
          disabled={getSelectedByCategory('base') === 0}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
            getSelectedByCategory('base') > 0
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <span>Adicionar ao Carrinho</span>
          <span>•</span>
          <span>R$ {totalPrice.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}
