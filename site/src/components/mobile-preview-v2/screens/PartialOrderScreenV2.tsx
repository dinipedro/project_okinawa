import { useState } from "react";
import { Plus, Wine, Coffee, Cake, ChevronRight, Check, Clock, CheckCircle, ArrowLeft } from "lucide-react";

interface PartialOrderScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: "preparing" | "ready" | "delivered";
}

interface QuickAddCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: { id: string; name: string; price: number }[];
}

export const PartialOrderScreenV2 = ({ onNavigate, onBack }: PartialOrderScreenProps) => {
  const [sendMode, setSendMode] = useState<"direct" | "confirm">("confirm");
  const [showSuccess, setShowSuccess] = useState(false);

  const currentOrder: OrderItem[] = [
    { id: "1", name: "Picanha ao ponto", quantity: 1, status: "preparing" },
    { id: "2", name: "Arroz + Feijão", quantity: 1, status: "ready" },
    { id: "3", name: "Coca-Cola", quantity: 2, status: "delivered" },
  ];

  const quickAddCategories: QuickAddCategory[] = [
    {
      id: "drinks",
      name: "Bebidas",
      icon: <Wine className="h-5 w-5" />,
      items: [
        { id: "d1", name: "Coca-Cola", price: 8 },
        { id: "d2", name: "Suco Natural", price: 12 },
        { id: "d3", name: "Água", price: 5 },
        { id: "d4", name: "Cerveja", price: 14 },
      ],
    },
    {
      id: "desserts",
      name: "Sobremesas",
      icon: <Cake className="h-5 w-5" />,
      items: [
        { id: "s1", name: "Petit Gateau", price: 28 },
        { id: "s2", name: "Pudim", price: 18 },
        { id: "s3", name: "Sorvete", price: 15 },
      ],
    },
    {
      id: "coffee",
      name: "Café/Digestivo",
      icon: <Coffee className="h-5 w-5" />,
      items: [
        { id: "c1", name: "Espresso", price: 8 },
        { id: "c2", name: "Cappuccino", price: 12 },
        { id: "c3", name: "Licor", price: 18 },
      ],
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [itemsToAdd, setItemsToAdd] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);

  const getStatusIcon = (status: OrderItem["status"]) => {
    switch (status) {
      case "preparing":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "ready":
        return <Check className="h-4 w-4 text-primary" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusLabel = (status: OrderItem["status"]) => {
    switch (status) {
      case "preparing":
        return "Preparando";
      case "ready":
        return "Pronto";
      case "delivered":
        return "Entregue";
    }
  };

  const addItem = (item: { id: string; name: string; price: number }) => {
    setItemsToAdd((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleSend = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setItemsToAdd([]);
      setSelectedCategory(null);
    }, 3000);
  };

  const totalToAdd = itemsToAdd.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (showSuccess) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {sendMode === "direct" ? "Pedido Enviado!" : "Aguardando Garçom"}
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          {sendMode === "direct"
            ? "Seus itens foram adicionados à comanda."
            : "O garçom virá confirmar seu pedido."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-1">Adicionar ao Pedido</h1>
          <p className="text-sm text-muted-foreground">Peça mais sem esperar o garçom</p>
        </div>

        {/* Current Order */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Seu pedido atual</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {currentOrder.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 ${
                  index !== currentOrder.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{item.quantity}x</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-xs text-muted-foreground">{getStatusLabel(item.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Add Categories */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Adicionar rapidamente</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickAddCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`p-4 rounded-2xl border transition-all ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  {cat.icon}
                </div>
                <p className="text-xs font-medium text-foreground text-center">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Category Items */}
        {selectedCategory && (
          <div className="mb-6">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {quickAddCategories
                .find((c) => c.id === selectedCategory)
                ?.items.map((item, index, arr) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className={`w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                      index !== arr.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">R$ {item.price}</span>
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Items to Add */}
        {itemsToAdd.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">Itens a adicionar</h2>
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
              {itemsToAdd.map((item) => (
                <div key={item.id} className="flex items-center justify-between mb-2 last:mb-0">
                  <span className="text-sm text-foreground">
                    {item.qty}x {item.name}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    R$ {(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-primary/20 mt-3 pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-semibold text-primary">R$ {totalToAdd.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Send Mode */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Modo de envio</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setSendMode("direct")}
              className={`flex-1 p-3 rounded-xl border transition-all ${
                sendMode === "direct"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <p className="text-sm font-medium text-foreground">Enviar direto</p>
              <p className="text-xs text-muted-foreground">Para a cozinha</p>
            </button>
            <button
              onClick={() => setSendMode("confirm")}
              className={`flex-1 p-3 rounded-xl border transition-all ${
                sendMode === "confirm"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <p className="text-sm font-medium text-foreground">Confirmar</p>
              <p className="text-xs text-muted-foreground">Com garçom</p>
            </button>
          </div>
        </div>
      </div>

      {/* Send Button */}
      {itemsToAdd.length > 0 && (
        <div className="p-4 border-t border-border bg-background">
          <button
            onClick={handleSend}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            {sendMode === "direct" ? "Enviar Pedido" : "Chamar Garçom"} • R$ {totalToAdd.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
};

export default PartialOrderScreenV2;
