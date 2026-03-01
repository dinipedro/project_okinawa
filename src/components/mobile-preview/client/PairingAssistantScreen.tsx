import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Wine, Coffee, GlassWater, Plus, Check, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMobilePreview } from '../context/MobilePreviewContext';

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

export const PairingAssistantScreen: React.FC = () => {
  const { goBack, navigate } = useMobilePreview();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Current cart items for context
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
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100&h=100&fit=crop',
      reason: 'Harmoniza perfeitamente com o Filé Mignon, realçando os sabores do molho madeira',
    },
    {
      id: '2',
      name: 'Cerveja IPA Artesanal',
      type: 'drink',
      description: 'Lupulada e refrescante',
      price: 28.00,
      matchScore: 85,
      image: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=100&h=100&fit=crop',
      reason: 'O amargor complementa a cremosidade do risoto de funghi',
    },
    {
      id: '3',
      name: 'Purê de Batata Trufado',
      type: 'side',
      description: 'Cremoso com óleo de trufa',
      price: 32.00,
      matchScore: 95,
      image: 'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?w=100&h=100&fit=crop',
      reason: 'Acompanhamento clássico para carnes, eleva a experiência gastronômica',
    },
    {
      id: '4',
      name: 'Petit Gateau',
      type: 'dessert',
      description: 'Chocolate belga com sorvete',
      price: 38.00,
      matchScore: 92,
      image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=100&h=100&fit=crop',
      reason: 'Finalização perfeita após pratos robustos como o filé',
    },
    {
      id: '5',
      name: 'Água com Gás San Pellegrino',
      type: 'drink',
      description: 'Premium italiana 750ml',
      price: 18.00,
      matchScore: 80,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=100&h=100&fit=crop',
      reason: 'Limpa o paladar entre os pratos, mantendo a experiência fresca',
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

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedTotal = pairingSuggestions
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Assistente de Harmonização
          </h1>
          <p className="text-xs text-muted-foreground">Sugestões personalizadas com IA</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context Banner */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Baseado no seu pedido:</h3>
            <div className="flex flex-wrap gap-2">
              {cartItems.map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Explanation */}
        <div className="p-4 rounded-xl bg-muted/50">
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
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'border-primary ring-1 ring-primary/20' : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.matchScore}%
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Icon className="h-3 w-3 text-primary" />
                              <span className="text-xs text-muted-foreground">{typeLabels[item.type]}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary text-sm">R$ {item.price.toFixed(2)}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-primary border-primary' : 'border-border'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Reason */}
                    <div className="mt-2 p-2 rounded-lg bg-accent/10">
                      <p className="text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-accent inline mr-1" />
                        {item.reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      {selectedItems.length > 0 && (
        <div className="p-4 border-t border-border bg-card">
          <Button 
            className="w-full h-12"
            onClick={() => navigate('cart')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'} • R$ {selectedTotal.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
};
