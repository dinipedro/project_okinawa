import { FC, useState } from 'react';
import { ChevronLeft, DollarSign, ArrowDown, ArrowUp, CreditCard, QrCode, Banknote, Receipt, Clock, User, CheckCircle2, AlertCircle, ChevronRight, X, Eye, EyeOff, Calculator, Printer, RotateCcw } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

// === Types ===
type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'voucher';
type CashierStatus = 'closed' | 'opening' | 'open' | 'closing';
type MovementType = 'sale' | 'sangria' | 'reforco' | 'refund';

interface CashMovement {
  id: string;
  type: MovementType;
  desc: string;
  amount: number;
  time: string;
  method?: PaymentMethod;
  operator?: string;
  table?: string;
  approved?: boolean;
}

interface CashierShift {
  id: string;
  operator: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  difference?: number;
  sales: number;
}

// === Mock Data ===
const movements: CashMovement[] = [
  { id: '1', type: 'sale', desc: 'Mesa 07', amount: 287.50, time: '14:32', method: 'credit', table: '07' },
  { id: '2', type: 'sale', desc: 'Mesa 03', amount: 156.00, time: '14:15', method: 'pix', table: '03' },
  { id: '3', type: 'sangria', desc: 'Sangria - Troco', amount: -200.00, time: '13:45', operator: 'Gerente Ana', approved: true },
  { id: '4', type: 'sale', desc: 'Mesa 11', amount: 412.80, time: '13:20', method: 'debit', table: '11' },
  { id: '5', type: 'reforco', desc: 'Reforço de Caixa', amount: 500.00, time: '11:00', operator: 'Gerente Ana' },
  { id: '6', type: 'sale', desc: 'Mesa 02', amount: 98.50, time: '12:30', method: 'cash', table: '02' },
  { id: '7', type: 'sale', desc: 'Mesa 15', amount: 324.00, time: '12:00', method: 'credit', table: '15' },
  { id: '8', type: 'refund', desc: 'Estorno - Mesa 09', amount: -45.00, time: '11:30', operator: 'Gerente Ana', approved: true },
  { id: '9', type: 'sale', desc: 'Mesa 05', amount: 178.20, time: '11:15', method: 'voucher', table: '05' },
  { id: '10', type: 'sale', desc: 'Mesa 08', amount: 256.30, time: '10:45', method: 'pix', table: '08' },
];

const previousShifts: CashierShift[] = [
  { id: 's1', operator: 'Carlos Lima', openedAt: 'Ontem 11:00', closedAt: 'Ontem 23:15', openingBalance: 500, closingBalance: 2845.60, difference: 0, sales: 2345.60 },
  { id: 's2', operator: 'Maria Santos', openedAt: '2 dias 11:00', closedAt: '2 dias 22:50', openingBalance: 500, closingBalance: 3120.30, difference: -15.00, sales: 2635.30 },
  { id: 's3', operator: 'Pedro Silva', openedAt: '3 dias 11:00', closedAt: '3 dias 23:00', openingBalance: 500, closingBalance: 1890.00, difference: 0, sales: 1390.00 },
];

const paymentMethodConfig: Record<PaymentMethod, { icon: typeof CreditCard; label: string; color: string }> = {
  cash: { icon: Banknote, label: 'Dinheiro', color: 'text-success' },
  credit: { icon: CreditCard, label: 'Crédito', color: 'text-info' },
  debit: { icon: CreditCard, label: 'Débito', color: 'text-secondary' },
  pix: { icon: QrCode, label: 'PIX', color: 'text-primary' },
  voucher: { icon: Receipt, label: 'Voucher', color: 'text-warning' },
};

// === Component ===
export const CashRegisterScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'breakdown' | 'shifts'>('overview');
  const [cashierStatus] = useState<CashierStatus>('open');
  const [showAmounts, setShowAmounts] = useState(true);
  const [showModal, setShowModal] = useState<'sangria' | 'reforco' | 'close' | null>(null);
  const [expandedMovement, setExpandedMovement] = useState<string | null>(null);

  // Calculations
  const totalSales = movements.filter(m => m.type === 'sale').reduce((s, m) => s + m.amount, 0);
  const totalSangria = movements.filter(m => m.type === 'sangria').reduce((s, m) => s + Math.abs(m.amount), 0);
  const totalReforco = movements.filter(m => m.type === 'reforco').reduce((s, m) => s + m.amount, 0);
  const totalRefunds = movements.filter(m => m.type === 'refund').reduce((s, m) => s + Math.abs(m.amount), 0);
  const openingBalance = 500.00;
  const currentBalance = openingBalance + totalSales + totalReforco - totalSangria - totalRefunds;

  // Breakdown by method
  const salesByMethod = movements.filter(m => m.type === 'sale' && m.method).reduce((acc, m) => {
    acc[m.method!] = (acc[m.method!] || 0) + m.amount;
    return acc;
  }, {} as Record<PaymentMethod, number>);

  const formatMoney = (v: number) => showAmounts ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ •••••';

  const tabs = [
    { key: 'overview' as const, label: 'Resumo' },
    { key: 'movements' as const, label: 'Movimentações' },
    { key: 'breakdown' as const, label: 'Formas Pgto' },
    { key: 'shifts' as const, label: 'Turnos' },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Caixa (PDV)</h1>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cashierStatus === 'open' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {cashierStatus === 'open' ? '● ABERTO' : '● FECHADO'}
              </span>
              <span className="text-xs text-muted-foreground">Operador: Carlos Lima</span>
            </div>
          </div>
          <button onClick={() => setShowAmounts(!showAmounts)} className="p-2 rounded-xl bg-muted">
            {showAmounts ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-4 space-y-3">
            {/* Main balance card */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">Saldo Atual</p>
                  <p className="text-3xl font-bold text-foreground">{formatMoney(currentBalance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Abertura</p>
                  <p className="text-sm font-semibold text-foreground">{formatMoney(openingBalance)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-primary/10 grid grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-xs text-success font-bold">{formatMoney(totalSales)}</p>
                  <p className="text-[9px] text-muted-foreground">Vendas</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-info font-bold">{formatMoney(totalReforco)}</p>
                  <p className="text-[9px] text-muted-foreground">Reforço</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-warning font-bold">{formatMoney(totalSangria)}</p>
                  <p className="text-[9px] text-muted-foreground">Sangria</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-destructive font-bold">{formatMoney(totalRefunds)}</p>
                  <p className="text-[9px] text-muted-foreground">Estornos</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-card rounded-2xl border border-border p-3">
                <p className="text-xs text-muted-foreground">Transações</p>
                <p className="text-2xl font-bold text-foreground">{movements.filter(m => m.type === 'sale').length}</p>
                <p className="text-[10px] text-success">+3 vs ontem</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-3">
                <p className="text-xs text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-foreground">{formatMoney(totalSales / movements.filter(m => m.type === 'sale').length)}</p>
                <p className="text-[10px] text-success">+8%</p>
              </div>
            </div>

            {/* Quick method breakdown */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Vendas por Forma de Pagamento</h3>
              {Object.entries(salesByMethod).sort((a, b) => b[1] - a[1]).map(([method, amount]) => {
                const config = paymentMethodConfig[method as PaymentMethod];
                const Icon = config.icon;
                const pct = (amount / totalSales) * 100;
                return (
                  <div key={method} className="flex items-center gap-3 mb-2.5 last:mb-0">
                    <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground font-medium">{config.label}</span>
                        <span className="text-muted-foreground">{formatMoney(amount)} · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="p-4 space-y-1.5">
            {movements.map(m => {
              const isExpanded = expandedMovement === m.id;
              const isPositive = m.amount > 0;
              return (
                <div key={m.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button onClick={() => setExpandedMovement(isExpanded ? null : m.id)} className="w-full p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {m.type === 'sale' ? <DollarSign className={`w-4 h-4 ${isPositive ? 'text-success' : 'text-destructive'}`} /> :
                         m.type === 'refund' ? <RotateCcw className="w-4 h-4 text-destructive" /> :
                         isPositive ? <ArrowUp className="w-4 h-4 text-success" /> : <ArrowDown className="w-4 h-4 text-destructive" />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{m.desc}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">{m.time}</span>
                          {m.method && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{paymentMethodConfig[m.method].label}</span>
                          )}
                          {m.type === 'refund' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-bold">ESTORNO</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}R$ {Math.abs(m.amount).toFixed(2)}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
                      {m.operator && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="w-3 h-3" /> Aprovado por: <b className="text-foreground">{m.operator}</b>
                        </div>
                      )}
                      {m.table && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Receipt className="w-3 h-3" /> Mesa: <b className="text-foreground">{m.table}</b>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-lg bg-muted text-xs text-foreground font-medium flex items-center justify-center gap-1">
                          <Printer className="w-3.5 h-3.5" /> Reimprimir
                        </button>
                        {m.type === 'sale' && (
                          <button className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium flex items-center justify-center gap-1">
                            <RotateCcw className="w-3.5 h-3.5" /> Estornar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="p-4 space-y-3">
            {Object.entries(salesByMethod).sort((a, b) => b[1] - a[1]).map(([method, amount]) => {
              const config = paymentMethodConfig[method as PaymentMethod];
              const Icon = config.icon;
              const count = movements.filter(m => m.type === 'sale' && m.method === method).length;
              const pct = (amount / totalSales) * 100;
              return (
                <div key={method} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{count} transações</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{formatMoney(amount)}</p>
                      <p className="text-xs text-muted-foreground">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  {/* Individual transactions */}
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                    {movements.filter(m => m.type === 'sale' && m.method === method).map(m => (
                      <div key={m.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{m.desc} · {m.time}</span>
                        <span className="text-foreground font-medium">R$ {m.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="p-4 space-y-3">
            {/* Current shift */}
            <div className="bg-success/5 rounded-2xl border border-success/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="text-sm font-bold text-foreground">Turno Atual</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Operador</p>
                  <p className="text-sm font-semibold text-foreground">Carlos Lima</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Abertura</p>
                  <p className="text-sm font-semibold text-foreground">Hoje 11:00</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Fundo Troco</p>
                  <p className="text-sm font-semibold text-foreground">{formatMoney(openingBalance)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Saldo Atual</p>
                  <p className="text-sm font-bold text-success">{formatMoney(currentBalance)}</p>
                </div>
              </div>
            </div>

            {/* Previous shifts */}
            <h3 className="text-sm font-semibold text-foreground">Turnos Anteriores</h3>
            {previousShifts.map(shift => (
              <div key={shift.id} className="bg-card rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{shift.operator}</p>
                      <p className="text-[10px] text-muted-foreground">{shift.openedAt} → {shift.closedAt}</p>
                    </div>
                  </div>
                  {shift.difference !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${shift.difference === 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {shift.difference === 0 ? '✓ Conferido' : `Dif: R$ ${shift.difference.toFixed(2)}`}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted">
                    <p className="text-[10px] text-muted-foreground">Abertura</p>
                    <p className="text-xs font-bold text-foreground">R$ {shift.openingBalance.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <p className="text-[10px] text-muted-foreground">Vendas</p>
                    <p className="text-xs font-bold text-success">R$ {shift.sales.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <p className="text-[10px] text-muted-foreground">Fechamento</p>
                    <p className="text-xs font-bold text-foreground">R$ {shift.closingBalance?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 bg-card border-t border-border">
        <div className="flex gap-2">
          <button onClick={() => setShowModal('sangria')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-destructive/10 text-destructive rounded-xl text-xs font-semibold">
            <ArrowDown className="w-3.5 h-3.5" /> Sangria
          </button>
          <button onClick={() => setShowModal('reforco')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-success/10 text-success rounded-xl text-xs font-semibold">
            <ArrowUp className="w-3.5 h-3.5" /> Reforço
          </button>
          <button onClick={() => setShowModal('close')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" /> Fechar Caixa
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {showModal === 'sangria' ? 'Sangria' : showModal === 'reforco' ? 'Reforço de Caixa' : 'Fechar Caixa'}
              </h3>
              <button onClick={() => setShowModal(null)} className="p-2 rounded-full bg-muted"><X className="w-4 h-4" /></button>
            </div>

            {showModal === 'close' ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Saldo Sistema</p>
                  <p className="text-2xl font-bold text-foreground">{formatMoney(currentBalance)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Contagem Física (Cega)</label>
                  <p className="text-[10px] text-muted-foreground mb-1">Conte o dinheiro no caixa sem ver o saldo do sistema</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ l: 'Notas', p: 'R$ 0,00' }, { l: 'Moedas', p: 'R$ 0,00' }].map(f => (
                      <div key={f.l}>
                        <label className="text-[10px] text-muted-foreground">{f.l}</label>
                        <input placeholder={f.p} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-warning/10 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                  <p className="text-xs text-warning">A diferença será calculada automaticamente após a contagem.</p>
                </div>
                <button onClick={() => setShowModal(null)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                  Confirmar Fechamento
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Valor</label>
                  <input type="number" placeholder="R$ 0,00" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Motivo</label>
                  <input placeholder={showModal === 'sangria' ? 'Ex: Troco para clientes' : 'Ex: Fundo de caixa'} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
                </div>
                <div className="p-3 rounded-xl bg-info/10 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-info flex-shrink-0" />
                  <p className="text-xs text-info">Requer aprovação do gerente.</p>
                </div>
                <button onClick={() => setShowModal(null)} className={`w-full py-3 rounded-xl font-semibold text-sm ${showModal === 'sangria' ? 'bg-destructive text-destructive-foreground' : 'bg-success text-success-foreground'}`}>
                  Confirmar {showModal === 'sangria' ? 'Sangria' : 'Reforço'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegisterScreen;