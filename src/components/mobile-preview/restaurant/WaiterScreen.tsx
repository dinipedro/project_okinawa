import React, { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { 
  User, Bell, Clock, Check, Plus, ArrowRight, X, 
  Edit2, Trash2, DollarSign, QrCode, CreditCard, Nfc,
  AlertTriangle, Users, ChevronRight, ChevronDown, Eye,
  Smartphone, Receipt, Send, CheckCircle, XCircle
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  orderedBy: string;
}

interface Table {
  id: number;
  guests: number;
  status: 'ordering' | 'eating' | 'waiting_bill' | 'payment';
  requests: number;
  total: number;
  items: OrderItem[];
  paymentMode: 'individual' | 'shared';
  guestsWithApp: number;
  guestsWithoutApp: number;
}

const myTables: Table[] = [
  { 
    id: 2, 
    guests: 3, 
    status: "ordering", 
    requests: 1, 
    total: 156,
    paymentMode: 'shared',
    guestsWithApp: 2,
    guestsWithoutApp: 1,
    items: [
      { id: 'o1', name: 'Ramen Tonkotsu', price: 58.90, quantity: 1, status: 'preparing', orderedBy: 'Carlos' },
      { id: 'o2', name: 'Gyoza (6 un)', price: 32.00, quantity: 1, status: 'delivered', orderedBy: 'Maria' },
      { id: 'o3', name: 'Edamame', price: 18.00, quantity: 1, status: 'pending', orderedBy: 'João' },
    ]
  },
  { 
    id: 5, 
    guests: 5, 
    status: "eating", 
    requests: 0, 
    total: 324,
    paymentMode: 'individual',
    guestsWithApp: 5,
    guestsWithoutApp: 0,
    items: []
  },
  { 
    id: 10, 
    guests: 2, 
    status: "waiting_bill", 
    requests: 2, 
    total: 167,
    paymentMode: 'shared',
    guestsWithApp: 1,
    guestsWithoutApp: 1,
    items: [
      { id: 'o4', name: 'Pizza Margherita', price: 65.00, quantity: 1, status: 'delivered', orderedBy: 'Ana' },
      { id: 'o5', name: 'Bruschetta', price: 28.00, quantity: 1, status: 'delivered', orderedBy: 'Pedro' },
      { id: 'o6', name: 'Tiramisu', price: 35.00, quantity: 1, status: 'delivered', orderedBy: 'Ana' },
      { id: 'o7', name: 'Espresso', price: 12.00, quantity: 2, status: 'delivered', orderedBy: 'Pedro' },
    ]
  },
  { 
    id: 12, 
    guests: 4, 
    status: "payment", 
    requests: 0, 
    total: 198,
    paymentMode: 'shared',
    guestsWithApp: 2,
    guestsWithoutApp: 2,
    items: []
  },
];

const notifications = [
  { table: 10, message: "Solicitou a conta", time: "agora", urgent: true, type: 'bill' },
  { table: 2, message: "Pediu mais água", time: "2min", urgent: false, type: 'request' },
  { table: 10, message: "Pediu guardanapos", time: "5min", urgent: false, type: 'request' },
];

export const WaiterScreen = () => {
  const { navigate } = useMobilePreview();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'tap' | 'pix' | 'card'>('tap');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const handleDeleteItem = (itemId: string) => {
    // In real app, this would request manager approval
    setShowDeleteConfirm(itemId);
  };

  const processPartialPayment = () => {
    setShowPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentSuccess(false);
      setShowPaymentModal(false);
      setPartialPaymentAmount(0);
    }, 2000);
  };

  // Table Detail View
  if (selectedTable) {
    const serviceCharge = selectedTable.total * 0.1;
    const grandTotal = selectedTable.total + serviceCharge;
    
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedTable(null)}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold">Mesa {selectedTable.id}</h1>
              <p className="text-sm opacity-80">
                {selectedTable.guests} pessoas • {selectedTable.guestsWithApp} com app
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedTable.status === 'waiting_bill' 
                ? 'bg-amber-500 text-amber-950' 
                : selectedTable.status === 'payment'
                  ? 'bg-green-500 text-green-950'
                  : 'bg-white/20'
            }`}>
              {selectedTable.status === 'ordering' && 'Pedindo'}
              {selectedTable.status === 'eating' && 'Consumindo'}
              {selectedTable.status === 'waiting_bill' && 'Aguarda Conta'}
              {selectedTable.status === 'payment' && 'Pagando'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Alert for guests without app */}
          {selectedTable.guestsWithoutApp > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600">
                  {selectedTable.guestsWithoutApp} cliente(s) sem app
                </p>
                <p className="text-amber-600/80 text-xs">
                  Você precisará processar pagamento parcial
                </p>
              </div>
            </div>
          )}

          {/* Items List - CRUD */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Itens da Comanda</h2>
              <button className="text-sm text-primary flex items-center gap-1">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            
            <div className="space-y-2">
              {selectedTable.items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          item.status === 'delivered' 
                            ? 'bg-green-500/20 text-green-600'
                            : item.status === 'ready'
                              ? 'bg-blue-500/20 text-blue-600'
                              : item.status === 'preparing'
                                ? 'bg-amber-500/20 text-amber-600'
                                : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.status === 'delivered' && 'Entregue'}
                          {item.status === 'ready' && 'Pronto'}
                          {item.status === 'preparing' && 'Preparando'}
                          {item.status === 'pending' && 'Pendente'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pedido por {item.orderedBy} • Qtd: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button className="p-1.5 rounded-lg hover:bg-accent">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card rounded-2xl p-6 max-w-sm w-full animate-scale-in">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-lg text-center mb-2">Remover Item?</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Esta ação requer aprovação do gerente.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 py-2.5 rounded-xl bg-muted font-medium"
                    >
                      Cancelar
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-medium">
                      Solicitar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="p-4 rounded-xl bg-muted/50 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {selectedTable.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviço (10%)</span>
                <span>R$ {serviceCharge.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>R$ {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Actions */}
          {(selectedTable.status === 'waiting_bill' || selectedTable.status === 'payment') && (
            <div className="space-y-3">
              <h2 className="font-semibold mb-3">Ações de Pagamento</h2>
              
              {/* Partial Payment for guests without app */}
              {selectedTable.guestsWithoutApp > 0 && (
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full p-4 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">Pagamento Parcial</p>
                    <p className="text-xs text-muted-foreground">
                      Para clientes sem o app
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              )}

              <button className="w-full p-4 rounded-xl bg-card border border-border flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">Gerar PIX</p>
                  <p className="text-xs text-muted-foreground">
                    Código para pagamento
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button className="w-full p-4 rounded-xl bg-card border border-border flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">Dividir Conta</p>
                  <p className="text-xs text-muted-foreground">
                    Calcular divisão manual
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-card rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-right">
              <div className="sticky top-0 bg-card p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Pagamento Parcial</h2>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 rounded-lg hover:bg-accent"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {showPaymentSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Pagamento Processado!</h3>
                  <p className="text-sm text-muted-foreground">
                    R$ {partialPaymentAmount.toFixed(2)} debitados da conta
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {/* Amount */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Valor do Pagamento
                    </label>
                    <div className="flex items-center justify-center gap-4 py-4">
                      <button
                        onClick={() => setPartialPaymentAmount(Math.max(0, partialPaymentAmount - 10))}
                        className="w-12 h-12 rounded-full bg-accent text-xl font-bold"
                      >
                        -
                      </button>
                      <div className="text-center">
                        <span className="text-3xl font-bold">
                          R$ {partialPaymentAmount.toFixed(2)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          de R$ {(selectedTable.total * 1.1).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => setPartialPaymentAmount(Math.min(selectedTable.total * 1.1, partialPaymentAmount + 10))}
                        className="w-12 h-12 rounded-full bg-accent text-xl font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex justify-center gap-2">
                      {[50, 100, selectedTable.total * 1.1 / 2].map((val, i) => (
                        <button
                          key={i}
                          onClick={() => setPartialPaymentAmount(Math.round(val * 100) / 100)}
                          className="px-4 py-2 rounded-lg bg-muted text-sm font-medium"
                        >
                          R$ {val.toFixed(0)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Método de Pagamento
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod('tap')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          paymentMethod === 'tap' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border'
                        }`}
                      >
                        <Nfc className={`w-6 h-6 mx-auto mb-1 ${
                          paymentMethod === 'tap' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <span className="text-xs font-medium">TAP</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          paymentMethod === 'pix' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border'
                        }`}
                      >
                        <QrCode className={`w-6 h-6 mx-auto mb-1 ${
                          paymentMethod === 'pix' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <span className="text-xs font-medium">PIX</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          paymentMethod === 'card' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border'
                        }`}
                      >
                        <CreditCard className={`w-6 h-6 mx-auto mb-1 ${
                          paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <span className="text-xs font-medium">Maquininha</span>
                      </button>
                    </div>
                  </div>

                  {/* TAP Instructions */}
                  {paymentMethod === 'tap' && (
                    <div className="p-4 rounded-xl bg-primary/10 text-center animate-fade-in">
                      <Smartphone className="w-12 h-12 mx-auto mb-2 text-primary" />
                      <p className="font-medium text-sm">TAP to Pay Ativo</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cliente deve aproximar o celular com Apple Pay ou Google Pay
                      </p>
                    </div>
                  )}

                  {/* PIX QR */}
                  {paymentMethod === 'pix' && (
                    <div className="p-4 rounded-xl bg-muted/50 text-center animate-fade-in">
                      <div className="w-32 h-32 mx-auto mb-3 bg-white p-2 rounded-xl">
                        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMCwxMGg4MHY4MGgtODB6IiBmaWxsPSIjMDAwIi8+PC9zdmc+')] bg-contain" />
                      </div>
                      <p className="font-mono text-xs break-all text-muted-foreground">
                        00020126580014br.gov.bcb.pix...
                      </p>
                      <button className="mt-2 text-primary text-sm font-medium">
                        Copiar código
                      </button>
                    </div>
                  )}

                  <button
                    onClick={processPartialPayment}
                    disabled={partialPaymentAmount <= 0}
                    className={`w-full py-4 rounded-xl font-bold ${
                      partialPaymentAmount > 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {paymentMethod === 'tap' && 'Aguardar Aproximação'}
                    {paymentMethod === 'pix' && 'Confirmar Pagamento PIX'}
                    {paymentMethod === 'card' && 'Processar na Maquininha'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Action */}
        <div className="sticky bottom-0 p-4 bg-background border-t border-border">
          <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Pedido
          </button>
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Olá,</p>
              <h1 className="font-display text-xl font-bold">Carlos Silva</h1>
            </div>
          </div>
          <div className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
              3
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl bg-white/10 text-center">
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs opacity-80">Minhas Mesas</div>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-white/10 text-center">
            <div className="text-2xl font-bold">R$ 845</div>
            <div className="text-xs opacity-80">Total Hoje</div>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-white/10 text-center">
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs opacity-80">Pedidos</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-5 py-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Chamados
        </h2>
        <div className="space-y-2">
          {notifications.map((notif, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-xl flex items-center justify-between ${
                notif.urgent ? 'bg-destructive/10 border border-destructive' : 'bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                  notif.urgent ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {notif.table}
                </span>
                <div>
                  <p className="font-medium text-sm">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">{notif.time}</p>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-success text-success-foreground">
                <Check className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Tables */}
      <div className="px-5 pb-4 flex-1">
        <h2 className="font-semibold mb-3">Minhas Mesas</h2>
        <div className="space-y-3">
          {myTables.map((table) => (
            <button 
              key={table.id} 
              onClick={() => setSelectedTable(table)}
              className="w-full p-4 rounded-2xl bg-card border border-border text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-display text-xl font-bold text-primary">
                    {table.id}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{table.guests} pessoas</p>
                      {table.guestsWithoutApp > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 text-[10px] font-medium">
                          {table.guestsWithoutApp} sem app
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {table.status === 'ordering' && 'Fazendo pedido'}
                      {table.status === 'eating' && 'Consumindo'}
                      {table.status === 'waiting_bill' && 'Aguardando conta'}
                      {table.status === 'payment' && 'Em pagamento'}
                    </p>
                  </div>
                </div>
                {table.requests > 0 && (
                  <span className="h-6 w-6 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {table.requests}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">R$ {table.total.toFixed(2)}</span>
                <span className="flex items-center gap-2 text-primary text-sm font-medium">
                  Gerenciar
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border">
        <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          Iniciar Atendimento
        </button>
      </div>
    </div>
  );
};