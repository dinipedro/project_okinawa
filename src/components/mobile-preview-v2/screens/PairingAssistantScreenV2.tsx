import { FC, useState } from 'react';
import { ChevronLeft, Sparkles, Wine, Coffee, GlassWater, Plus, Check, Star } from 'lucide-react';

interface PairingAssistantScreenV2Props {
  onNavigate: (screen: string) => void;
}

interface PairingItem {
  id: string;
  name: string;
  type: 'wine' | 'drink' | 'side' | 'dessert';
  description: string;
  price: number;
  matchScore: number;
  image: string;
  reason: string;
}

const cartItems = [
  { name: 'Filé Mignon ao Molho Madeira', category: 'Carnes' },
  { name: 'Risoto de Funghi', category: 'Massas' },
];

const pairingSuggestions: PairingItem[] = [
  {
    id: '1',
    name: 'Vinho Malbec Argentino',
    type: 'wine',
    description: 'Encorpado com notas de frutas negras',
    price: 89.00,
    matchScore: 98,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100',
    reason: 'Harmoniza perfeitamente com o Filé Mignon, realçando os sabores do molho madeira',
  },
  {
    id: '2',
    name: 'Cerveja IPA Artesanal',
    type: 'drink',
    description: 'Lupulada e refrescante',
    price: 28.00,
    matchScore: 85,
    image: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=100',
    reason: 'O amargor complementa a cremosidade do risoto de funghi',
  },
  {
    id: '3',
    name: 'Purê de Batata Trufado',
    type: 'side',
    description: 'Cremoso com óleo de trufa',
    price: 32.00,
    matchScore: 95,
    image: 'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?w=100',
    reason: 'Acompanhamento clássico para carnes, eleva a experiência gastronômica',
  },
  {
    id: '4',
    name: 'Petit Gateau',
    type: 'dessert',
    description: 'Chocolate belga com sorvete',
    price: 38.00,
    matchScore: 92,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=100',
    reason: 'Finalização perfeita após pratos robustos como o filé',
  },
];

const typeIcons = {
  wine: Wine,
  drink: GlassWater,
  side: Coffee,
  dessert: Sparkles,
};

const typeLabels = {
  wine: 'Vinho',
  drink: 'Bebida',
  side: 'Acompanhamento',
  dessert: 'Sobremesa',
};

const PairingAssistantScreenV2: FC<PairingAssistantScreenV2Props> = ({ onNavigate }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedTotal = pairingSuggestions
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-muted to-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-card border-b border-border">
        <button 
          onClick={() => onNavigate('cart-v2')}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Assistente de Harmonização
          </h1>
          <p className="text-xs text-muted-foreground">Sugestões personalizadas com IA</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-24">
        {/* Context Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800/30">
          <h3 className="font-semibold text-foreground mb-2">Baseado no seu pedido:</h3>
          <div className="flex flex-wrap gap-2">
            {cartItems.map((item, index) => (
              <span key={index} className="px-3 py-1 rounded-full bg-card text-xs font-medium text-muted-foreground border border-violet-200 dark:border-violet-800/30">
                {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* AI Explanation */}
        <div className="p-4 rounded-2xl bg-muted">
          <p className="text-sm text-muted-foreground">
            🤖 <span className="font-medium text-foreground">IA Okinawa:</span> Analisei seus pratos e 
            selecionei as melhores harmonizações para elevar sua experiência gastronômica.
          </p>
        </div>

        {/* Suggestions */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Sugestões do Chef</h3>
          <div className="space-y-3">
            {pairingSuggestions.map((item) => {
              const Icon = typeIcons[item.type];
              const isSelected = selectedItems.includes(item.id);
              
              return (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-2xl bg-card border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-orange-500 shadow-lg' : 'border-border hover:border-orange-300'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                        {item.matchScore}%
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Icon className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-muted-foreground">{typeLabels[item.type]}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600 text-sm">R$ {item.price.toFixed(2)}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-orange-500 border-orange-500' : 'border-muted-foreground/30'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Reason */}
                  <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                    <p className="text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-amber-500 inline mr-1" />
                      {item.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      {selectedItems.length > 0 && (
        <div className="p-4 border-t border-border bg-card">
          <button 
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
            onClick={() => onNavigate('cart-v2')}
          >
            <Plus className="w-4 h-4" />
            Adicionar {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'} • R$ {selectedTotal.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
};

export default PairingAssistantScreenV2;
