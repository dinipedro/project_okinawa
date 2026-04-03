import { FC, useState } from 'react';
import { ChevronLeft, Receipt, DollarSign, CreditCard, QrCode, Banknote, Users, Percent, ChevronRight, Scissors, Gift, Clock, CheckCircle2, AlertCircle, User, ArrowUpDown } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

// === Types ===
interface BillItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  guest?: string;
}

interface Bill {
  id: string;
  table: string;
  guests: number;
  items: BillItem[];
  subtotal: number;
  serviceCharge: number;
  discount: number;
  tip: number;
  total: number;
  status: 'open' | 'partial' | 'paid';
  time: string;
  paymentMethod?: string;
  splitMode?: 'none' | 'equal' | 'by-item';
  paidAmount: number;
}

// === Mock Data ===
const bills: Bill[] = [
  {
    id: 'B-001', table: '07', guests: 4, subtotal: 412.00, serviceCharge: 41.20, discount: 0, tip: 30.00, total: 483.20,
    status: 'open', time: '14:32', splitMode: 'by-item', paidAmount: 189.90,
    items: [
      { id: 'i1', name: 'Omakase Selection', qty: 1, price: 189.90, guest: 'Carlos' },
      { id: 'i2', name: 'Wagyu Tataki', qty: 1, price: 98.00, guest: 'Maria' },
      { id: 'i3', name: 'Ramen Tonkotsu', qty: 2, price: 62.00 },
      { id: 'i4', name: 'Sake Premium', qty: 1, price: 62.10, guest: 'Carlos' },
    ]
  },
  {
    id: 'B-002', table: '03', guests: 2, subtotal: 156.00, serviceCharge: 15.60, discount: 15.00, tip: 20.00, total: 176.60,
    status: 'paid', time: '14:15', paymentMethod: 'PIX', splitMode: 'equal', paidAmount: 176.60,
    items: [
      { id: 'i5', name: 'Risoto Funghi', qty: 2, price: 58.00 },
      { id: 'i6', name: 'Bruschetta', qty: 1, price: 28.00 },
      { id: 'i7', name: 'Tiramisù', qty: 1, price: 12.00 },
    ]
  },
  {
    id: 'B-003', table: '11', guests: 6, subtotal: 780.00, serviceCharge: 78.00, discount: 0, tip: 0, total: 858.00,
    status: 'partial', time: '13:20', splitMode: 'by-item', paidAmount: 412.80,
    items: [
      { id: 'i8', name: 'Filé Mignon', qty: 3, price: 89.00 },
      { id: 'i9', name: 'Sashimi Mix', qty: 2, price: 75.00 },
      { id: 'i10', name: 'Vinho Tinto', qty: 2, price: 120.00 },
      { id: 'i11', name: 'Edamame', qty: 3, price: 22.00 },
    ]
  },
  {
    id: 'B-004', table: '05', guests: 2, subtotal: 98.00, serviceCharge: 9.80, discount: 0, tip: 10.00, total: 117.80,
    status: 'paid', time: '12:45', paymentMethod: 'Crédito', splitMode: 'none', paidAmount: 117.80,
    items: [
      { id: 'i12', name: 'Combo Almoço', qty: 2, price: 49.00 },
    ]
  },
];

const statusConfig = {
  open: { bg: 'bg-warning/10', text: 'text-warning', label: 'Aberta' },
  partial: { bg: 'bg-info/10', text: 'text-info', label: 'Parcial' },
  paid: { bg: 'bg-success/10', text: 'text-success', label: 'Paga' },
};

export const BillsScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [filter, setFilter] = useState<'all' | 'open' | 'paid'>('all');
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState<{ bill: Bill; action: 'split' | 'discount' | 'tip' } | null>(null);

  const filtered = bills.filter(b => filter === 'all' || (filter === 'open' ? b.status !== 'paid' : b.status === 'paid'));
  const totalOpen = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.total - b.paidAmount, 0);
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0);
  const totalTips = bills.reduce((s, b) => s + b.tip, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Contas</h1>
            <p className="text-xs text-muted-foreground">{bills.length} contas · {bills.filter(b => b.status !== 'paid').length} abertas</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-warning/10 text-center">
            <p className="text-lg font-bold text-warning">R$ {totalOpen.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Em Aberto</p>
          </div>
          <div className="p-2.5 rounded-xl bg-success/10 text-center">
            <p className="text-lg font-bold text-success">R$ {totalPaid.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Recebido</p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-center">
            <p className="text-lg font-bold text-primary">R$ {totalTips.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Gorjetas</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([['all', 'Todas'], ['open', 'Abertas'], ['paid', 'Pagas']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${filter === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bills List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map(bill => {
          const sc = statusConfig[bill.status];
          const isExpanded = expandedBill === bill.id;
          const remainingPct = bill.status === 'paid' ? 100 : (bill.paidAmount / bill.total) * 100;

          return (
            <div key={bill.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button onClick={() => setExpandedBill(isExpanded ? null : bill.id)} className="w-full p-3 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sc.bg}`}>
                  <Receipt className={`w-5 h-5 ${sc.text}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">Mesa {bill.table}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    {bill.splitMode && bill.splitMode !== 'none' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-muted text-muted-foreground">
                        {bill.splitMode === 'equal' ? 'Dividido Igual' : 'Por Item'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{bill.guests} convidados · {bill.items.length} itens · {bill.time}</p>
                  {bill.status !== 'paid' && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full" style={{ width: `${remainingPct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{remainingPct.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">R$ {bill.total.toFixed(2)}</p>
                  {bill.paidAmount > 0 && bill.status !== 'paid' && (
                    <p className="text-[10px] text-success">Pago: R$ {bill.paidAmount.toFixed(2)}</p>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Itens</p>
                    {bill.items.map(item => (
                      <div key={item.id} className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{item.qty}x {item.name}</span>
                          {item.guest && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{item.guest}</span>}
                        </div>
                        <span className="text-sm font-medium text-foreground">R$ {(item.qty * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Breakdown */}
                  <div className="bg-muted rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">R$ {bill.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Taxa de Serviço (10%)</span><span className="text-foreground">R$ {bill.serviceCharge.toFixed(2)}</span></div>
                    {bill.discount > 0 && <div className="flex justify-between text-xs"><span className="text-success">Desconto</span><span className="text-success">-R$ {bill.discount.toFixed(2)}</span></div>}
                    {bill.tip > 0 && <div className="flex justify-between text-xs"><span className="text-primary">Gorjeta</span><span className="text-primary">R$ {bill.tip.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-border/50"><span className="text-foreground">Total</span><span className="text-foreground">R$ {bill.total.toFixed(2)}</span></div>
                  </div>

                  {/* Actions */}
                  {bill.status !== 'paid' && (
                    <div className="flex gap-2">
                      <button onClick={() => setShowActionModal({ bill, action: 'split' })} className="flex-1 py-2 rounded-xl bg-info/10 text-info text-xs font-medium flex items-center justify-center gap-1">
                        <Scissors className="w-3.5 h-3.5" /> Split
                      </button>
                      <button onClick={() => setShowActionModal({ bill, action: 'discount' })} className="flex-1 py-2 rounded-xl bg-success/10 text-success text-xs font-medium flex items-center justify-center gap-1">
                        <Percent className="w-3.5 h-3.5" /> Desconto
                      </button>
                      <button onClick={() => setShowActionModal({ bill, action: 'tip' })} className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium flex items-center justify-center gap-1">
                        <Gift className="w-3.5 h-3.5" /> Gorjeta
                      </button>
                      <button className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> Cobrar
                      </button>
                    </div>
                  )}
                  {bill.status === 'paid' && bill.paymentMethod && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-success/10">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs text-success font-medium">Pago via {bill.paymentMethod}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {showActionModal.action === 'split' ? 'Dividir Conta' : showActionModal.action === 'discount' ? 'Aplicar Desconto' : 'Adicionar Gorjeta'}
              </h3>
              <button onClick={() => setShowActionModal(null)} className="p-2 rounded-full bg-muted text-foreground">✕</button>
            </div>
            {showActionModal.action === 'split' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Mesa {showActionModal.bill.table} · R$ {showActionModal.bill.total.toFixed(2)}</p>
                {[
                  { mode: 'equal', label: 'Dividir Igual', desc: `R$ ${(showActionModal.bill.total / showActionModal.bill.guests).toFixed(2)} por pessoa`, icon: Users },
                  { mode: 'by-item', label: 'Por Item', desc: 'Cada um paga seus itens', icon: ArrowUpDown },
                ].map(opt => (
                  <button key={opt.mode} onClick={() => setShowActionModal(null)} className="w-full p-4 rounded-xl border border-border bg-muted flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><opt.icon className="w-5 h-5 text-primary" /></div>
                    <div className="text-left"><p className="text-sm font-semibold text-foreground">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.desc}</p></div>
                  </button>
                ))}
              </div>
            )}
            {showActionModal.action === 'discount' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(pct => (
                    <button key={pct} className="flex-1 py-3 rounded-xl border border-border bg-muted text-sm font-bold text-foreground">{pct}%</button>
                  ))}
                </div>
                <div><label className="text-xs text-muted-foreground">Valor personalizado</label><input placeholder="R$ 0,00" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" /></div>
                <div><label className="text-xs text-muted-foreground">Motivo</label><input placeholder="Ex: Cortesia, Aniversário..." className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" /></div>
                <button onClick={() => setShowActionModal(null)} className="w-full py-3 rounded-xl bg-success text-success-foreground font-semibold text-sm">Aplicar Desconto</button>
              </div>
            )}
            {showActionModal.action === 'tip' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[10, 15, 20].map(pct => {
                    const val = (showActionModal.bill.subtotal * pct / 100);
                    return (
                      <button key={pct} className="flex-1 py-3 rounded-xl border border-border bg-muted text-center">
                        <p className="text-sm font-bold text-foreground">{pct}%</p>
                        <p className="text-[10px] text-muted-foreground">R$ {val.toFixed(2)}</p>
                      </button>
                    );
                  })}
                </div>
                <div><label className="text-xs text-muted-foreground">Valor personalizado</label><input placeholder="R$ 0,00" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" /></div>
                <button onClick={() => setShowActionModal(null)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Adicionar Gorjeta</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};