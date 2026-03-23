import { useState } from 'react';
import { 
  ChevronLeft, Check, CreditCard, QrCode, 
  Users, ChevronRight, User, Sparkles, AlertCircle
} from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  orderedBy: string;
  selected?: boolean;
  assignedTo?: string[];
}

const mockOrderItems: OrderItem[] = [
  { id: "i1", name: "Ramen Tonkotsu", price: 58.90, quantity: 1, orderedBy: "Você" },
  { id: "i2", name: "Gyoza (6 un)", price: 32.00, quantity: 1, orderedBy: "Você" },
  { id: "i3", name: "Ramen Shoyu", price: 52.90, quantity: 1, orderedBy: "Maria" },
  { id: "i4", name: "Edamame", price: 18.00, quantity: 1, orderedBy: "Compartilhado" },
  { id: "i5", name: "Ramen Miso", price: 54.90, quantity: 1, orderedBy: "João" },
  { id: "i6", name: "Karaage", price: 29.00, quantity: 1, orderedBy: "Compartilhado" },
  { id: "i7", name: "Sake 720ml", price: 89.00, quantity: 1, orderedBy: "Compartilhado" },
];

const guests = [
  { id: "me", name: "Você", avatar: "👤", color: "primary" },
  { id: "maria", name: "Maria", avatar: "👩", color: "secondary" },
  { id: "joao", name: "João", avatar: "👨", color: "accent" },
];

export const SplitByItemScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [items, setItems] = useState<OrderItem[]>(mockOrderItems);
  const [selectedGuest, setSelectedGuest] = useState<string>("me");
  const [step, setStep] = useState<'select' | 'review' | 'confirm'>('select');
  
  const toggleItemSelection = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo?.includes(selectedGuest);
        const newAssigned = isAssigned 
          ? item.assignedTo?.filter(g => g !== selectedGuest) || []
          : [...(item.assignedTo || []), selectedGuest];
        return { ...item, assignedTo: newAssigned };
      }
      return item;
    }));
  };
  
  const getGuestTotal = (guestId: string) => {
    return items.reduce((total, item) => {
      if (item.assignedTo?.includes(guestId)) {
        const splitCount = item.assignedTo.length;
        return total + (item.price / splitCount);
      }
      return total;
    }, 0);
  };
  
  const getUnassignedItems = () => items.filter(item => !item.assignedTo?.length);
  const totalOrder = items.reduce((sum, item) => sum + item.price, 0);
  const myTotal = getGuestTotal("me");
  const serviceCharge = myTotal * 0.1;
  
  const getItemAssignees = (item: OrderItem) => {
    if (!item.assignedTo?.length) return null;
    return item.assignedTo.map(guestId => 
      guests.find(g => g.id === guestId)
    ).filter(Boolean);
  };
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold">Dividir por Item</h1>
            <p className="text-xs text-muted-foreground">
              {step === 'select' && 'Selecione itens para cada pessoa'}
              {step === 'review' && 'Revise a divisão'}
              {step === 'confirm' && 'Confirme seu pagamento'}
            </p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mt-4">
          {['select', 'review', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                step === s ? 'bg-primary text-primary-foreground' :
                ['select', 'review', 'confirm'].indexOf(step) > i ? 'bg-success text-success-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {['select', 'review', 'confirm'].indexOf(step) > i ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 mx-1 ${
                ['select', 'review', 'confirm'].indexOf(step) > i ? 'bg-success' : 'bg-muted'
              }`} />}
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 pb-44">
        {step === 'select' && (
          <>
            {/* Guest Selector */}
            <div className="mb-4">
              <h2 className="font-semibold text-sm mb-3">Selecionando para:</h2>
              <div className="flex gap-2">
                {guests.map(guest => (
                  <button
                    key={guest.id}
                    onClick={() => setSelectedGuest(guest.id)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      selectedGuest === guest.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="text-2xl mb-1">{guest.avatar}</div>
                    <div className="text-xs font-medium">{guest.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      R$ {getGuestTotal(guest.id).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Items List */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm">Itens do Pedido</h2>
                <span className="text-xs text-muted-foreground">
                  {getUnassignedItems().length} não atribuídos
                </span>
              </div>
              
              <div className="space-y-2">
                {items.map(item => {
                  const isAssignedToMe = item.assignedTo?.includes(selectedGuest);
                  const assignees = getItemAssignees(item);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        isAssignedToMe
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{item.name}</span>
                            {item.orderedBy === "Compartilhado" && (
                              <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-xs">
                                Compartilhado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Pedido por: {item.orderedBy}
                            </span>
                          </div>
                          
                          {/* Assignees */}
                          {assignees && assignees.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-xs text-muted-foreground">Dividido:</span>
                              {assignees.map((g: any) => (
                                <span key={g.id} className="text-sm">{g.avatar}</span>
                              ))}
                              {assignees.length > 1 && (
                                <span className="text-xs text-muted-foreground">
                                  (R$ {(item.price / assignees.length).toFixed(2)} cada)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">
                            R$ {item.price.toFixed(2)}
                          </span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isAssignedToMe ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          }`}>
                            {isAssignedToMe && <Check className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Unassigned Warning */}
            {getUnassignedItems().length > 0 && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    {getUnassignedItems().length} itens não atribuídos
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Atribua todos os itens antes de continuar
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {step === 'review' && (
          <>
            {/* Summary per Guest */}
            <div className="space-y-4">
              {guests.map(guest => {
                const guestItems = items.filter(item => item.assignedTo?.includes(guest.id));
                const guestTotal = getGuestTotal(guest.id);
                
                return (
                  <div key={guest.id} className="p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{guest.avatar}</div>
                      <div className="flex-1">
                        <span className="font-semibold">{guest.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {guestItems.length} itens
                        </p>
                      </div>
                      <span className="font-bold text-lg">
                        R$ {guestTotal.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 pt-3 border-t border-border">
                      {guestItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name}
                            {item.assignedTo && item.assignedTo.length > 1 && (
                              <span className="text-xs ml-1">
                                (÷{item.assignedTo.length})
                              </span>
                            )}
                          </span>
                          <span>
                            R$ {(item.price / (item.assignedTo?.length || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Total Check */}
            <div className="mt-4 p-4 rounded-2xl bg-muted/50">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total do pedido</span>
                <span className="font-medium">R$ {totalOrder.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total dividido</span>
                <span className="font-medium text-success">
                  R$ {guests.reduce((sum, g) => sum + getGuestTotal(g.id), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
        
        {step === 'confirm' && (
          <>
            {/* My Payment Summary */}
            <div className="p-4 rounded-2xl bg-primary/5 border-2 border-primary mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">👤</div>
                <div>
                  <span className="font-semibold">Seu Total</span>
                  <p className="text-xs text-muted-foreground">
                    {items.filter(i => i.assignedTo?.includes("me")).length} itens selecionados
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 py-3 border-y border-primary/20">
                {items.filter(i => i.assignedTo?.includes("me")).map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>R$ {(item.price / (item.assignedTo?.length || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {myTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de serviço (10%)</span>
                  <span>R$ {serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-primary">R$ {(myTotal + serviceCharge).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div>
              <h2 className="font-semibold text-sm mb-3">Forma de Pagamento</h2>
              <div className="space-y-2">
                {[
                  { id: 'pix', icon: QrCode, name: 'PIX', desc: 'Instantâneo' },
                  { id: 'card', icon: CreditCard, name: 'Cartão', desc: '•••• 4242' },
                ].map(method => (
                  <button
                    key={method.id}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 ${
                      method.id === 'pix' ? 'bg-secondary/5 border-secondary' : 'bg-card border-border'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${
                      method.id === 'pix' ? 'bg-secondary/20' : 'bg-muted'
                    }`}>
                      <method.icon className={`h-5 w-5 ${
                        method.id === 'pix' ? 'text-secondary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-sm">{method.name}</span>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                    {method.id === 'pix' && (
                      <div className="p-1 rounded-full bg-secondary">
                        <Check className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        {step === 'select' && (
          <button
            onClick={() => setStep('review')}
            disabled={getUnassignedItems().length > 0}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Revisar Divisão
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        
        {step === 'review' && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-4 rounded-2xl border-2 border-border font-bold"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep('confirm')}
              className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-bold"
            >
              Confirmar
            </button>
          </div>
        )}
        
        {step === 'confirm' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground">Total a pagar:</span>
              <span className="font-bold text-2xl">R$ {(myTotal + serviceCharge).toFixed(2)}</span>
            </div>
            <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5" />
              Pagar com PIX
            </button>
          </>
        )}
      </div>
    </div>
  );
};
