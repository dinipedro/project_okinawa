import { FC, useState } from 'react';
import { ChevronLeft, Search, AlertTriangle, Package, Plus, Minus, ArrowUpDown, Clock, TrendingDown, ChevronDown, ChevronRight, Truck, CalendarClock, BarChart3, Filter, ShoppingCart } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

// === Data Types ===
type StockStatus = 'critical' | 'low' | 'ok' | 'overstock';
type MovementType = 'entry' | 'exit' | 'loss' | 'adjustment' | 'transfer';

interface StockItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  min: number;
  max: number;
  unit: string;
  status: StockStatus;
  costUnit: number;
  supplier: string;
  expiresAt?: string;
  daysToExpiry?: number;
  lastMovement: string;
}

interface StockMovement {
  id: string;
  itemName: string;
  type: MovementType;
  qty: number;
  unit: string;
  operator: string;
  timestamp: string;
  reason?: string;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  items: number;
  total: number;
  status: 'pending' | 'approved' | 'delivered';
  createdAt: string;
}

// === Mock Data ===
const stockItems: StockItem[] = [
  { id: '1', name: 'Filé Mignon', category: 'Carnes', qty: 8, min: 10, max: 50, unit: 'kg', status: 'low', costUnit: 89.90, supplier: 'Friboi Premium', expiresAt: '15/04', daysToExpiry: 3, lastMovement: '14:30' },
  { id: '2', name: 'Salmão Fresco', category: 'Peixes', qty: 2, min: 5, max: 20, unit: 'kg', status: 'critical', costUnit: 79.90, supplier: 'Mar & Cia', expiresAt: '13/04', daysToExpiry: 1, lastMovement: '10:15' },
  { id: '3', name: 'Arroz Arbóreo', category: 'Grãos', qty: 15, min: 5, max: 30, unit: 'kg', status: 'ok', costUnit: 18.50, supplier: 'Cereais SA', lastMovement: '09:00' },
  { id: '4', name: 'Azeite Extra Virgem', category: 'Condimentos', qty: 4, min: 3, max: 12, unit: 'L', status: 'ok', costUnit: 42.00, supplier: 'Azeites Portugal', lastMovement: 'Ontem' },
  { id: '5', name: 'Gin Tanqueray', category: 'Bebidas', qty: 1, min: 3, max: 10, unit: 'un', status: 'critical', costUnit: 120.00, supplier: 'Diageo', lastMovement: '16:00' },
  { id: '6', name: 'Queijo Parmesão', category: 'Laticínios', qty: 6, min: 4, max: 15, unit: 'kg', status: 'ok', costUnit: 95.00, supplier: 'Laticínios Real', expiresAt: '20/04', daysToExpiry: 8, lastMovement: '11:30' },
  { id: '7', name: 'Camarão Rosa', category: 'Frutos do Mar', qty: 3, min: 5, max: 20, unit: 'kg', status: 'low', costUnit: 65.00, supplier: 'Mar & Cia', expiresAt: '14/04', daysToExpiry: 2, lastMovement: '08:45' },
  { id: '8', name: 'Tomate Cereja', category: 'Hortifruti', qty: 25, min: 3, max: 20, unit: 'kg', status: 'overstock', costUnit: 12.00, supplier: 'Horta Viva', expiresAt: '16/04', daysToExpiry: 4, lastMovement: '07:30' },
  { id: '9', name: 'Farinha de Trigo', category: 'Grãos', qty: 10, min: 5, max: 25, unit: 'kg', status: 'ok', costUnit: 6.50, supplier: 'Cereais SA', lastMovement: '2 dias' },
  { id: '10', name: 'Cerveja Artesanal IPA', category: 'Bebidas', qty: 4, min: 6, max: 24, unit: 'un', status: 'low', costUnit: 18.00, supplier: 'Cervejaria Local', lastMovement: 'Ontem' },
];

const movements: StockMovement[] = [
  { id: 'm1', itemName: 'Filé Mignon', type: 'exit', qty: 4, unit: 'kg', operator: 'Chef Rafael', timestamp: '14:30', reason: 'Produção do dia' },
  { id: 'm2', itemName: 'Salmão Fresco', type: 'entry', qty: 10, unit: 'kg', operator: 'Recebimento', timestamp: '10:15', reason: 'Pedido #PO-042' },
  { id: 'm3', itemName: 'Arroz Arbóreo', type: 'entry', qty: 5, unit: 'kg', operator: 'Recebimento', timestamp: '09:00', reason: 'Pedido #PO-041' },
  { id: 'm4', itemName: 'Gin Tanqueray', type: 'loss', qty: 1, unit: 'un', operator: 'Barman Lucas', timestamp: '16:00', reason: 'Garrafa quebrada' },
  { id: 'm5', itemName: 'Camarão Rosa', type: 'exit', qty: 2, unit: 'kg', operator: 'Chef Rafael', timestamp: '08:45', reason: 'Preparo mise en place' },
  { id: 'm6', itemName: 'Tomate Cereja', type: 'adjustment', qty: 5, unit: 'kg', operator: 'Gerente Ana', timestamp: '07:30', reason: 'Ajuste inventário' },
  { id: 'm7', itemName: 'Cerveja IPA', type: 'exit', qty: 6, unit: 'un', operator: 'Barman Lucas', timestamp: 'Ontem', reason: 'Consumo serviço' },
];

const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-043', supplier: 'Mar & Cia', items: 3, total: 1250.00, status: 'pending', createdAt: 'Hoje 09:00' },
  { id: 'PO-042', supplier: 'Friboi Premium', items: 2, total: 2800.00, status: 'approved', createdAt: 'Ontem' },
  { id: 'PO-041', supplier: 'Cereais SA', items: 4, total: 450.00, status: 'delivered', createdAt: '2 dias' },
];

const categories = ['Todos', 'Carnes', 'Peixes', 'Frutos do Mar', 'Grãos', 'Condimentos', 'Laticínios', 'Bebidas', 'Hortifruti'];

const statusConfig: Record<StockStatus, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Crítico' },
  low: { bg: 'bg-warning/10', text: 'text-warning', label: 'Baixo' },
  ok: { bg: 'bg-success/10', text: 'text-success', label: 'Normal' },
  overstock: { bg: 'bg-info/10', text: 'text-info', label: 'Excesso' },
};

const movementConfig: Record<MovementType, { bg: string; text: string; icon: typeof Plus; label: string }> = {
  entry: { bg: 'bg-success/10', text: 'text-success', icon: Plus, label: 'Entrada' },
  exit: { bg: 'bg-warning/10', text: 'text-warning', icon: Minus, label: 'Saída' },
  loss: { bg: 'bg-destructive/10', text: 'text-destructive', icon: AlertTriangle, label: 'Perda' },
  adjustment: { bg: 'bg-info/10', text: 'text-info', icon: ArrowUpDown, label: 'Ajuste' },
  transfer: { bg: 'bg-secondary/10', text: 'text-secondary', icon: Truck, label: 'Transferência' },
};

// === Component ===
export const StockScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'orders' | 'cmv'>('items');
  const [filter, setFilter] = useState<'all' | 'low' | 'critical' | 'expiring'>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryType, setEntryType] = useState<MovementType>('entry');

  const filtered = stockItems.filter(i => {
    if (filter === 'low') return i.status === 'low' || i.status === 'critical';
    if (filter === 'critical') return i.status === 'critical';
    if (filter === 'expiring') return i.daysToExpiry !== undefined && i.daysToExpiry <= 3;
    return true;
  }).filter(i => selectedCategory === 'Todos' || i.category === selectedCategory)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const totalCMV = stockItems.reduce((s, i) => s + i.costUnit * i.qty, 0);
  const criticalCount = stockItems.filter(i => i.status === 'critical').length;
  const lowCount = stockItems.filter(i => i.status === 'low').length;
  const expiringCount = stockItems.filter(i => i.daysToExpiry !== undefined && i.daysToExpiry <= 3).length;

  const tabs = [
    { key: 'items' as const, label: 'Itens', icon: Package },
    { key: 'movements' as const, label: 'Histórico', icon: Clock },
    { key: 'orders' as const, label: 'Compras', icon: ShoppingCart },
    { key: 'cmv' as const, label: 'CMV', icon: BarChart3 },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Gestão de Estoque</h1>
            <p className="text-xs text-muted-foreground">{stockItems.length} itens · CMV R$ {totalCMV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <button
            onClick={() => { setShowEntryModal(true); setEntryType('entry'); }}
            className="p-2 rounded-xl bg-primary text-primary-foreground"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Alert badges */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${filter === 'critical' ? 'bg-destructive text-destructive-foreground' : 'bg-destructive/10 text-destructive'}`}>
            <AlertTriangle className="w-3 h-3" /> {criticalCount} Críticos
          </button>
          <button onClick={() => setFilter(filter === 'low' ? 'all' : 'low')} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${filter === 'low' ? 'bg-warning text-warning-foreground' : 'bg-warning/10 text-warning'}`}>
            <TrendingDown className="w-3 h-3" /> {lowCount} Baixos
          </button>
          <button onClick={() => setFilter(filter === 'expiring' ? 'all' : 'expiring')} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${filter === 'expiring' ? 'bg-info text-info-foreground' : 'bg-info/10 text-info'}`}>
            <CalendarClock className="w-3 h-3" /> {expiringCount} Vencendo
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'items' && (
          <div className="p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar item..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground" />
            </div>

            {/* Category chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selectedCategory === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Items list */}
            {filtered.map(item => {
              const sc = statusConfig[item.status];
              const isExpanded = expandedItem === item.id;
              const pct = Math.min((item.qty / item.max) * 100, 100);
              return (
                <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <button onClick={() => setExpandedItem(isExpanded ? null : item.id)} className="w-full p-3 flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${sc.bg}`}>
                      {item.status === 'critical' ? <AlertTriangle className={`w-5 h-5 ${sc.text}`} /> : <Package className={`w-5 h-5 ${sc.text}`} />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                        {item.daysToExpiry !== undefined && item.daysToExpiry <= 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/10 text-destructive">
                            {item.daysToExpiry === 0 ? 'VENCE HOJE' : `${item.daysToExpiry}d`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.category} · R$ {item.costUnit.toFixed(2)}/{item.unit}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.status === 'critical' ? 'bg-destructive' : item.status === 'low' ? 'bg-warning' : item.status === 'overstock' ? 'bg-info' : 'bg-success'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-foreground">{item.qty}{item.unit}</span>
                        <span className="text-[10px] text-muted-foreground">/ {item.max}{item.unit}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
                      {/* Details grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-muted text-center">
                          <p className="text-[10px] text-muted-foreground">Custo Total</p>
                          <p className="text-sm font-bold text-foreground">R$ {(item.costUnit * item.qty).toFixed(2)}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted text-center">
                          <p className="text-[10px] text-muted-foreground">Mínimo</p>
                          <p className="text-sm font-bold text-foreground">{item.min}{item.unit}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted text-center">
                          <p className="text-[10px] text-muted-foreground">{item.expiresAt ? 'Validade' : 'Último Mov.'}</p>
                          <p className={`text-sm font-bold ${item.daysToExpiry !== undefined && item.daysToExpiry <= 3 ? 'text-destructive' : 'text-foreground'}`}>
                            {item.expiresAt || item.lastMovement}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Fornecedor: <b className="text-foreground">{item.supplier}</b></span>
                      </div>
                      {/* Quick actions */}
                      <div className="flex gap-2">
                        <button onClick={() => { setShowEntryModal(true); setEntryType('entry'); }} className="flex-1 py-2 rounded-xl bg-success/10 text-success text-xs font-medium flex items-center justify-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Entrada
                        </button>
                        <button onClick={() => { setShowEntryModal(true); setEntryType('exit'); }} className="flex-1 py-2 rounded-xl bg-warning/10 text-warning text-xs font-medium flex items-center justify-center gap-1">
                          <Minus className="w-3.5 h-3.5" /> Saída
                        </button>
                        <button onClick={() => { setShowEntryModal(true); setEntryType('loss'); }} className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-medium flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Perda
                        </button>
                      </div>
                      {item.qty <= item.min && (
                        <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5" /> Gerar Pedido de Compra
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Movimentações Recentes</h3>
              <button className="p-1.5 rounded-lg bg-muted"><Filter className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
            {movements.map(m => {
              const mc = movementConfig[m.type];
              const Icon = mc.icon;
              return (
                <div key={m.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mc.bg}`}>
                    <Icon className={`w-4 h-4 ${mc.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{m.itemName}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${mc.bg} ${mc.text}`}>{mc.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.reason}</p>
                    <p className="text-[10px] text-muted-foreground">{m.operator} · {m.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${m.type === 'entry' ? 'text-success' : m.type === 'loss' ? 'text-destructive' : 'text-warning'}`}>
                      {m.type === 'entry' ? '+' : '-'}{m.qty}{m.unit}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-foreground">Pedidos de Compra</h3>
              <button className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Novo
              </button>
            </div>

            {/* Auto-suggested orders */}
            {stockItems.filter(i => i.qty <= i.min).length > 0 && (
              <div className="p-3 rounded-2xl bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <p className="text-xs font-semibold text-foreground">Reposição Sugerida</p>
                </div>
                <div className="space-y-1.5">
                  {stockItems.filter(i => i.qty <= i.min).map(i => (
                    <div key={i.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{i.name}</span>
                      <span className="text-muted-foreground">{i.max - i.qty}{i.unit} de {i.supplier}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-2 py-2 rounded-xl bg-warning text-warning-foreground text-xs font-semibold">
                  Gerar Pedido Automático
                </button>
              </div>
            )}

            {purchaseOrders.map(po => (
              <div key={po.id} className="bg-card rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{po.id}</p>
                      <p className="text-xs text-muted-foreground">{po.supplier}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    po.status === 'pending' ? 'bg-warning/10 text-warning' :
                    po.status === 'approved' ? 'bg-info/10 text-info' :
                    'bg-success/10 text-success'
                  }`}>
                    {po.status === 'pending' ? 'Pendente' : po.status === 'approved' ? 'Aprovado' : 'Entregue'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{po.items} itens</span>
                  <span className="font-semibold text-foreground">R$ {po.total.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{po.createdAt}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cmv' && (
          <div className="p-4 space-y-3">
            {/* CMV Overview */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-4">
              <p className="text-xs text-muted-foreground">Custo Total do Estoque (CMV)</p>
              <p className="text-3xl font-bold text-foreground">R$ {totalCMV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-success font-medium">-3.2% vs mês anterior</span>
              </div>
            </div>

            {/* CMV by category */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">CMV por Categoria</h3>
              {(() => {
                const catTotals = stockItems.reduce((acc, i) => {
                  acc[i.category] = (acc[i.category] || 0) + i.costUnit * i.qty;
                  return acc;
                }, {} as Record<string, number>);
                const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
                const maxVal = sorted[0]?.[1] || 1;
                return sorted.map(([cat, total]) => (
                  <div key={cat} className="mb-2.5 last:mb-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground font-medium">{cat}</span>
                      <span className="text-muted-foreground">R$ {total.toFixed(2)} · {((total / totalCMV) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(total / maxVal) * 100}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Top cost items */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">Maiores Custos Unitários</h3>
              {stockItems.sort((a, b) => b.costUnit - a.costUnit).slice(0, 5).map((item, i) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">R$ {item.costUnit.toFixed(2)}/{item.unit}</p>
                    <p className="text-[10px] text-muted-foreground">Total: R$ {(item.costUnit * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entry/Exit Modal */}
      {showEntryModal && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-4 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {entryType === 'entry' ? 'Registrar Entrada' : entryType === 'exit' ? 'Registrar Saída' : 'Registrar Perda'}
              </h3>
              <button onClick={() => setShowEntryModal(false)} className="p-2 rounded-full bg-muted">✕</button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Item</label>
              <select className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground">
                {stockItems.map(i => <option key={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Quantidade</label>
                <input type="number" placeholder="0" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Unidade</label>
                <input defaultValue="kg" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Motivo</label>
              <input placeholder="Ex: Produção do dia, Pedido #PO-043..." className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
            </div>
            <button onClick={() => setShowEntryModal(false)} className={`w-full py-3 rounded-xl font-semibold text-sm ${
              entryType === 'entry' ? 'bg-success text-success-foreground' :
              entryType === 'exit' ? 'bg-warning text-warning-foreground' :
              'bg-destructive text-destructive-foreground'
            }`}>
              Confirmar {entryType === 'entry' ? 'Entrada' : entryType === 'exit' ? 'Saída' : 'Perda'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockScreen;