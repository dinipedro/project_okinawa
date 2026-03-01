import { Check, User, DollarSign, ChevronDown, Sparkles, ArrowLeft } from "lucide-react";
import { FC, useState } from "react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string | null;
}

interface SplitByItemScreenV2Props {
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const SplitByItemScreenV2: FC<SplitByItemScreenV2Props> = ({ onNavigate, onBack }) => {
  const [items, setItems] = useState<OrderItem[]>([
    { id: 1, name: "Hambúrguer Artesanal", price: 45.90, quantity: 2, assignedTo: null },
    { id: 2, name: "Batata Frita Grande", price: 22.00, quantity: 1, assignedTo: "Você" },
    { id: 3, name: "Coca-Cola 350ml", price: 8.00, quantity: 3, assignedTo: null },
    { id: 4, name: "Milkshake Chocolate", price: 18.00, quantity: 1, assignedTo: "João" },
    { id: 5, name: "Onion Rings", price: 25.00, quantity: 1, assignedTo: null },
  ]);

  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const guests = [
    { id: "you", name: "Você", color: "from-primary to-accent" },
    { id: "joao", name: "João", color: "from-info to-info/80" },
    { id: "maria", name: "Maria", color: "from-destructive to-destructive/80" },
    { id: "pedro", name: "Pedro", color: "from-success to-secondary" },
  ];

  const assignItem = (itemId: number, guestName: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, assignedTo: guestName } : item
    ));
    setSelectedItem(null);
  };

  const getGuestTotal = (guestName: string) => {
    return items
      .filter(item => item.assignedTo === guestName)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const unassignedTotal = items
    .filter(item => !item.assignedTo)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Dividir por Item</h1>
            <p className="text-xs text-muted-foreground">Selecione quem paga cada item</p>
          </div>
        </div>

        {/* Guest Summary */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="flex-shrink-0 px-3 py-2 rounded-xl bg-card/70 backdrop-blur-sm border border-border"
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${guest.color} flex items-center justify-center text-primary-foreground text-xs font-bold`}>
                  {guest.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{guest.name}</p>
                  <p className="text-xs text-primary font-semibold">
                    R$ {getGuestTotal(guest.name).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 px-4 space-y-3 overflow-y-auto pb-48">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
            <DollarSign className="h-3 w-3 text-secondary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Itens do Pedido</span>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl backdrop-blur-xl border transition-all ${
              item.assignedTo
                ? "bg-success/10 border-success/30"
                : "bg-card/70 border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
                  {item.assignedTo && (
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">
                      {item.assignedTo}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.quantity}x R$ {item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                  className={`p-2 rounded-xl transition-all ${
                    item.assignedTo
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.assignedTo ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Guest Selection Dropdown */}
            {selectedItem === item.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Atribuir a:</p>
                <div className="flex flex-wrap gap-2">
                  {guests.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => assignItem(item.id, guest.name)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                        item.assignedTo === guest.name
                          ? `bg-gradient-to-r ${guest.color} text-primary-foreground`
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <User className="h-3 w-3" />
                      <span className="text-xs font-medium">{guest.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Summary */}
      <div className="p-4 bg-card border-t border-border">
        {unassignedTotal > 0 && (
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="text-sm text-warning">Itens não atribuídos</span>
            <span className="text-sm font-semibold text-warning">
              R$ {unassignedTotal.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center mb-3 px-2">
          <span className="text-sm text-muted-foreground">Total da conta</span>
          <span className="text-lg font-bold text-foreground">R$ {total.toFixed(2)}</span>
        </div>
        <button 
          onClick={() => onNavigate('unified-payment')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg"
        >
          Confirmar Divisão
        </button>
      </div>
    </div>
  );
};

export default SplitByItemScreenV2;
