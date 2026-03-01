import React, { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import {
  X,
  RefreshCw,
  Check,
  Beer,
  Wine,
  Coffee,
  Minus,
  Plus,
} from 'lucide-react';

// Last round items
const lastRoundItems = [
  {
    id: 'lr1',
    name: 'Heineken 600ml',
    price: 24.90,
    quantity: 2,
    orderedBy: 'Você',
    icon: Beer,
  },
  {
    id: 'lr2',
    name: 'Gin Tônica',
    price: 32.00,
    quantity: 1,
    orderedBy: 'Carlos Lima',
    icon: Wine,
  },
  {
    id: 'lr3',
    name: 'Corona Extra',
    price: 18.00,
    quantity: 2,
    orderedBy: 'Ana Costa',
    icon: Beer,
  },
  {
    id: 'lr4',
    name: 'Mojito',
    price: 28.00,
    quantity: 1,
    orderedBy: 'Ana Costa',
    icon: Wine,
  },
];

export function RepeatRoundSheet() {
  const { goBack } = useMobilePreview();
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    lastRoundItems.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? 0 : lastRoundItems.find((i) => i.id === id)?.quantity || 1,
    }));
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const totalItems = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const item = lastRoundItems.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleRepeat = async () => {
    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    setIsSent(true);
    setTimeout(() => goBack(), 2000);
  };

  if (isSent) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Pedido Enviado!</h2>
            <p className="text-muted-foreground">
              Sua rodada foi repetida com sucesso.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {totalItems} itens • R$ {totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Repetir Rodada</h1>
          <p className="text-xs text-muted-foreground">Última rodada há 25 min</p>
        </div>
        <div className="p-2 rounded-full bg-primary/10">
          <RefreshCw className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Selecione os itens que deseja repetir:
        </p>

        <div className="space-y-3">
          {lastRoundItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedItems[item.id] > 0;
            const quantity = selectedItems[item.id] || 0;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Pedido por {item.orderedBy} • R$ {item.price.toFixed(2)}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 rounded-lg bg-primary text-primary-foreground"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-medium">Dica:</span> Você pode ajustar as quantidades
            de cada item antes de confirmar.
          </p>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'} selecionados
          </span>
          <span className="font-bold text-lg text-foreground">
            R$ {totalPrice.toFixed(2)}
          </span>
        </div>
        <button
          onClick={handleRepeat}
          disabled={totalItems === 0 || isSending}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
            totalItems > 0
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isSending ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Repetir Rodada
            </>
          )}
        </button>
      </div>
    </div>
  );
}
