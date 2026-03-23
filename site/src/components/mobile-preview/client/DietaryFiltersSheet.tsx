import React, { useState } from 'react';
import { X, Check, Leaf, Fish, Wheat, Milk, Egg, Nut, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DietaryFilter {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

interface DietaryFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: string[]) => void;
  activeFilters: string[];
}

const dietaryFilters: DietaryFilter[] = [
  { id: 'vegetarian', name: 'Vegetariano', icon: Leaf, description: 'Sem carne ou peixe', color: 'bg-green-500' },
  { id: 'vegan', name: 'Vegano', icon: Leaf, description: 'Sem produtos animais', color: 'bg-green-600' },
  { id: 'gluten_free', name: 'Sem Glúten', icon: Wheat, description: 'Livre de glúten', color: 'bg-amber-500' },
  { id: 'lactose_free', name: 'Sem Lactose', icon: Milk, description: 'Livre de laticínios', color: 'bg-blue-500' },
  { id: 'nut_free', name: 'Sem Nozes', icon: Nut, description: 'Livre de oleaginosas', color: 'bg-orange-500' },
  { id: 'egg_free', name: 'Sem Ovos', icon: Egg, description: 'Livre de ovos', color: 'bg-yellow-500' },
  { id: 'pescatarian', name: 'Pescetariano', icon: Fish, description: 'Vegetariano + frutos do mar', color: 'bg-cyan-500' },
  { id: 'low_sodium', name: 'Baixo Sódio', icon: ShieldAlert, description: 'Reduzido em sal', color: 'bg-purple-500' },
];

const allergenFilters = [
  { id: 'shellfish', name: 'Frutos do Mar' },
  { id: 'soy', name: 'Soja' },
  { id: 'sesame', name: 'Gergelim' },
  { id: 'celery', name: 'Aipo' },
  { id: 'mustard', name: 'Mostarda' },
  { id: 'sulfites', name: 'Sulfitos' },
];

export const DietaryFiltersSheet: React.FC<DietaryFiltersSheetProps> = ({
  isOpen,
  onClose,
  onApply,
  activeFilters,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(activeFilters);

  const toggleFilter = (id: string) => {
    setSelectedFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApply(selectedFilters);
    onClose();
  };

  const handleClear = () => {
    setSelectedFilters([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Filtros Dietéticos</h2>
            <p className="text-xs text-muted-foreground">Personalize o cardápio para suas necessidades</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-4 space-y-6">
          {/* AI Recommendation */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Recomendação IA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Com base no seu histórico, você costuma evitar pratos com glúten. 
              Deseja ativar este filtro automaticamente?
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => toggleFilter('gluten_free')}
            >
              Ativar Sem Glúten
            </Button>
          </div>

          {/* Main Dietary Filters */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Preferências Alimentares</h3>
            <div className="grid grid-cols-2 gap-2">
              {dietaryFilters.map((filter) => {
                const Icon = filter.icon;
                const isSelected = selectedFilters.includes(filter.id);
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${filter.color} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground text-sm">{filter.name}</p>
                      <p className="text-[10px] text-muted-foreground">{filter.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergen Filters */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Alergias e Intolerâncias</h3>
            <div className="flex flex-wrap gap-2">
              {allergenFilters.map((filter) => {
                const isSelected = selectedFilters.includes(filter.id);
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`px-3 py-2 rounded-full border transition-all text-sm ${
                      isSelected 
                        ? 'border-destructive bg-destructive/10 text-destructive' 
                        : 'border-border hover:border-destructive/50 text-foreground'
                    }`}
                  >
                    {isSelected && <X className="h-3 w-3 inline mr-1" />}
                    Sem {filter.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Summary */}
          {selectedFilters.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>{selectedFilters.length}</strong> {selectedFilters.length === 1 ? 'filtro ativo' : 'filtros ativos'}
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedFilters.map(id => {
                  const filter = [...dietaryFilters, ...allergenFilters.map(f => ({ ...f, icon: ShieldAlert }))].find(f => f.id === id);
                  return filter ? (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {filter.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleClear}
            disabled={selectedFilters.length === 0}
          >
            Limpar Filtros
          </Button>
          <Button 
            className="flex-1"
            onClick={handleApply}
          >
            Aplicar ({selectedFilters.length})
          </Button>
        </div>
      </div>
    </div>
  );
};
