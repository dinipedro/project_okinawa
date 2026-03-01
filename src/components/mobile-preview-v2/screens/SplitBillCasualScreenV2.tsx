import { useState } from "react";
import { ArrowLeft, Users, CreditCard, Percent, Check, ChevronRight } from "lucide-react";

interface SplitBillCasualScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

interface Guest {
  id: string;
  name: string;
  avatar: string;
  total: number;
  items: { name: string; price: number }[];
}

export const SplitBillCasualScreenV2 = ({ onNavigate, onBack }: SplitBillCasualScreenProps) => {
  const [splitMode, setSplitMode] = useState<"equal" | "individual" | "custom">("equal");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

  const orderTotal = 285.0;
  const suggestedTip = 10; // 10% suggested tip for Casual Dining

  const guests: Guest[] = [
    {
      id: "1",
      name: "Você",
      avatar: "👤",
      total: 85.0,
      items: [
        { name: "Picanha 400g", price: 65.0 },
        { name: "Coca-Cola", price: 8.0 },
        { name: "Sobremesa", price: 12.0 },
      ],
    },
    {
      id: "2",
      name: "Maria",
      avatar: "👩",
      total: 72.0,
      items: [
        { name: "Fraldinha 300g", price: 52.0 },
        { name: "Suco Natural", price: 12.0 },
        { name: "Café", price: 8.0 },
      ],
    },
    {
      id: "3",
      name: "João",
      avatar: "👨",
      total: 68.0,
      items: [
        { name: "Costela 500g", price: 58.0 },
        { name: "Cerveja", price: 10.0 },
      ],
    },
    {
      id: "4",
      name: "Ana",
      avatar: "👩‍🦰",
      total: 60.0,
      items: [
        { name: "Salada Premium", price: 42.0 },
        { name: "Água com gás", price: 6.0 },
        { name: "Petit Gateau", price: 12.0 },
      ],
    },
  ];

  const tipAmount = (orderTotal * suggestedTip) / 100;
  const totalWithTip = orderTotal + tipAmount;
  const equalSplit = totalWithTip / guests.length;

  const toggleGuest = (guestId: string) => {
    setSelectedGuests((prev) =>
      prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId]
    );
  };

  const getMyTotal = () => {
    switch (splitMode) {
      case "equal":
        return equalSplit;
      case "individual":
        const myItems = guests.find((g) => g.id === "1");
        return myItems ? myItems.total * (1 + suggestedTip / 100) : 0;
      case "custom":
        return selectedGuests.length > 0
          ? totalWithTip / (selectedGuests.length + 1) // +1 for "you"
          : totalWithTip;
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Dividir Conta</h1>
            <p className="text-xs text-muted-foreground">
              Total: R$ {orderTotal.toFixed(2)} + {suggestedTip}% gorjeta
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Split Mode Selector */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Como dividir?</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "equal", label: "Igual", icon: Percent },
              { id: "individual", label: "Individual", icon: CreditCard },
              { id: "custom", label: "Customizado", icon: Users },
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSplitMode(mode.id as typeof splitMode)}
                  className={`p-4 rounded-2xl border transition-all ${
                    splitMode === mode.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 mx-auto mb-2 ${
                      splitMode === mode.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium ${
                      splitMode === mode.id ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {mode.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tip Highlight */}
        <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Gorjeta sugerida</p>
              <p className="text-xs text-muted-foreground">
                {suggestedTip}% = R$ {tipAmount.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-sm">
                5%
              </button>
              <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                10%
              </button>
              <button className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-sm">
                15%
              </button>
            </div>
          </div>
        </div>

        {/* Split Details */}
        {splitMode === "equal" && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">Divisão igual</h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {guests.map((guest, index) => (
                <div
                  key={guest.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== guests.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{guest.avatar}</div>
                    <span className="text-sm font-medium text-foreground">{guest.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">R$ {equalSplit.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {splitMode === "individual" && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">Cada um paga o seu</h2>
            <div className="space-y-3">
              {guests.map((guest) => (
                <div key={guest.id} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{guest.avatar}</div>
                      <span className="text-sm font-medium text-foreground">{guest.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      R$ {(guest.total * (1 + suggestedTip / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {guest.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.name}</span>
                        <span>R$ {item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {splitMode === "custom" && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Selecione quem vai dividir com você
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {guests.slice(1).map((guest, index) => (
                <button
                  key={guest.id}
                  onClick={() => toggleGuest(guest.id)}
                  className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-muted/50 ${
                    index !== guests.length - 2 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{guest.avatar}</div>
                    <span className="text-sm font-medium text-foreground">{guest.name}</span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedGuests.includes(guest.id)
                        ? "bg-primary"
                        : "border-2 border-muted-foreground"
                    }`}
                  >
                    {selectedGuests.includes(guest.id) && (
                      <Check className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {selectedGuests.length > 0 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                Dividindo entre {selectedGuests.length + 1} pessoas: R${" "}
                {(totalWithTip / (selectedGuests.length + 1)).toFixed(2)} cada
              </p>
            )}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Você vai pagar</p>
            <p className="text-2xl font-bold text-foreground">R$ {getMyTotal().toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Inclui {suggestedTip}% gorjeta</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("checkout")}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard className="h-5 w-5" />
          Pagar minha parte
        </button>
      </div>
    </div>
  );
};

export default SplitBillCasualScreenV2;
