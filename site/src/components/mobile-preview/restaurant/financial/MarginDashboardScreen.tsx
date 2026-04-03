import { FC, useState } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown, DollarSign, Calculator, ChevronRight, AlertCircle, Sliders } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

interface DishMargin {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  margin: number;
  sales: number;
  revenue: number;
}

const dishes: DishMargin[] = [
  { id: '1', name: 'Bruschetta', category: 'Entradas', cost: 4.50, price: 28.00, margin: 83.9, sales: 145, revenue: 4060 },
  { id: '2', name: 'Risoto Funghi', category: 'Pratos', cost: 12.00, price: 58.00, margin: 79.3, sales: 98, revenue: 5684 },
  { id: '3', name: 'Tiramisù', category: 'Sobremesas', cost: 6.00, price: 26.00, margin: 76.9, sales: 112, revenue: 2912 },
  { id: '4', name: 'Edamame', category: 'Entradas', cost: 3.00, price: 22.00, margin: 86.4, sales: 210, revenue: 4620 },
  { id: '5', name: 'Filé Mignon', category: 'Pratos', cost: 38.00, price: 89.00, margin: 57.3, sales: 76, revenue: 6764 },
  { id: '6', name: 'Salmão Grelhado', category: 'Pratos', cost: 42.00, price: 79.00, margin: 46.8, sales: 64, revenue: 5056 },
  { id: '7', name: 'Ramen Tonkotsu', category: 'Pratos', cost: 15.00, price: 62.00, margin: 75.8, sales: 134, revenue: 8308 },
  { id: '8', name: 'Gin Tônica', category: 'Bebidas', cost: 8.00, price: 32.00, margin: 75.0, sales: 189, revenue: 6048 },
  { id: '9', name: 'Sake Premium', category: 'Bebidas', cost: 25.00, price: 62.00, margin: 59.7, sales: 55, revenue: 3410 },
  { id: '10', name: 'Camarão Tempura', category: 'Entradas', cost: 18.00, price: 45.00, margin: 60.0, sales: 88, revenue: 3960 },
];

export const MarginDashboardScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [sortBy, setSortBy] = useState<'margin' | 'revenue' | 'sales'>('margin');
  const [expandedDish, setExpandedDish] = useState<string | null>(null);
  const [simulatePrice, setSimulatePrice] = useState<{ dish: DishMargin; newPrice: string } | null>(null);

  const avgMargin = dishes.reduce((s, d) => s + d.margin, 0) / dishes.length;
  const totalRevenue = dishes.reduce((s, d) => s + d.revenue, 0);
  const totalCost = dishes.reduce((s, d) => s + d.cost * d.sales, 0);

  const sorted = [...dishes].sort((a, b) => sortBy === 'margin' ? b.margin - a.margin : sortBy === 'revenue' ? b.revenue - a.revenue : b.sales - a.sales);

  const getMarginColor = (m: number) => m >= 70 ? 'text-success' : m >= 50 ? 'text-warning' : 'text-destructive';
  const getMarginBg = (m: number) => m >= 70 ? 'bg-success' : m >= 50 ? 'bg-warning' : 'bg-destructive';

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Dashboard de Margens</h1>
            <p className="text-xs text-muted-foreground">Análise de lucratividade por prato</p>
          </div>
        </div>

        {/* Sort */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([['margin', 'Margem'], ['revenue', 'Receita'], ['sales', 'Vendas']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setSortBy(k as any)} className={`flex-1 py-2 rounded-lg text-xs font-medium ${sortBy === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl border border-success/20 p-3 text-center">
            <p className="text-2xl font-bold text-success">{avgMargin.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">Margem Média</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">R$ {(totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-[10px] text-muted-foreground">Receita</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">R$ {(totalCost / 1000).toFixed(1)}K</p>
            <p className="text-[10px] text-muted-foreground">Custo</p>
          </div>
        </div>

        {/* Low margin alert */}
        {dishes.filter(d => d.margin < 50).length > 0 && (
          <div className="p-3 rounded-2xl bg-warning/10 border border-warning/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">{dishes.filter(d => d.margin < 50).length} pratos com margem abaixo de 50%</p>
              <p className="text-[10px] text-muted-foreground">Considere ajustar preços ou renegociar com fornecedores</p>
            </div>
          </div>
        )}

        {/* Dishes */}
        {sorted.map((dish, i) => {
          const isExpanded = expandedDish === dish.id;
          return (
            <div key={dish.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button onClick={() => setExpandedDish(isExpanded ? null : dish.id)} className="w-full p-3 flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">{dish.name}</p>
                  <p className="text-[10px] text-muted-foreground">{dish.category} · {dish.sales} vendidos</p>
                </div>
                <div className="text-right mr-1">
                  <p className={`text-lg font-bold ${getMarginColor(dish.margin)}`}>{dish.margin.toFixed(1)}%</p>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getMarginBg(dish.margin)}`} style={{ width: `${dish.margin}%` }} />
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-muted text-center">
                      <p className="text-[10px] text-muted-foreground">Custo</p>
                      <p className="text-xs font-bold text-destructive">R$ {dish.cost.toFixed(2)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted text-center">
                      <p className="text-[10px] text-muted-foreground">Preço</p>
                      <p className="text-xs font-bold text-foreground">R$ {dish.price.toFixed(2)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted text-center">
                      <p className="text-[10px] text-muted-foreground">Lucro/un</p>
                      <p className="text-xs font-bold text-success">R$ {(dish.price - dish.cost).toFixed(2)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted text-center">
                      <p className="text-[10px] text-muted-foreground">Receita</p>
                      <p className="text-xs font-bold text-foreground">R$ {dish.revenue.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  {/* Price Simulator */}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Calculator className="w-3.5 h-3.5 text-primary" />
                      <p className="text-xs font-semibold text-foreground">Simulador de Preço</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder={dish.price.toFixed(2)}
                        value={simulatePrice?.dish.id === dish.id ? simulatePrice.newPrice : ''}
                        onChange={e => setSimulatePrice({ dish, newPrice: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground"
                      />
                      {simulatePrice?.dish.id === dish.id && simulatePrice.newPrice && (
                        <div className="text-right">
                          <p className={`text-sm font-bold ${getMarginColor(((parseFloat(simulatePrice.newPrice) - dish.cost) / parseFloat(simulatePrice.newPrice)) * 100)}`}>
                            {(((parseFloat(simulatePrice.newPrice) - dish.cost) / parseFloat(simulatePrice.newPrice)) * 100).toFixed(1)}%
                          </p>
                          <p className="text-[10px] text-muted-foreground">Nova margem</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};