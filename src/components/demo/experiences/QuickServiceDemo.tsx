/**
 * Quick Service Demo — NOOWE Express
 * Journey: Skip the Line → Menu → Order → Payment → Pickup Code → Ready → Rating
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Search, Star, Clock, Minus, Plus, Check, Loader2,
  Zap, Timer, QrCode, ChevronRight, CreditCard, Gift, Smartphone,
  ChefHat, CheckCircle, MapPin, ShoppingBag, ArrowRight, Receipt,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'menu' | 'item' | 'order' | 'payment' | 'pickup' | 'ready' | 'rating';

const MENU = [
  { id: 'q1', name: 'Smash Burger Classic', price: 29, cat: 'Burgers', time: 5, img: '🍔' },
  { id: 'q2', name: 'Chicken Crispy', price: 32, cat: 'Burgers', time: 6, img: '🍗' },
  { id: 'q3', name: 'Batata Frita G', price: 18, cat: 'Acompanhamentos', time: 4, img: '🍟' },
  { id: 'q4', name: 'Onion Rings', price: 16, cat: 'Acompanhamentos', time: 4, img: '🧅' },
  { id: 'q5', name: 'Milkshake Nutella', price: 22, cat: 'Bebidas', time: 3, img: '🥤' },
  { id: 'q6', name: 'Refrigerante', price: 9, cat: 'Bebidas', time: 1, img: '🥤' },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir restaurante', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Skip the Line', screens: ['menu'] },
  { step: 3, label: 'Montar pedido', screens: ['item', 'order'] },
  { step: 4, label: 'Pagamento rápido', screens: ['payment'] },
  { step: 5, label: 'Código de retirada', screens: ['pickup'] },
  { step: 6, label: 'Pedido pronto!', screens: ['ready'] },
  { step: 7, label: 'Avaliar', screens: ['rating'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'O cliente encontra o Quick Service mais próximo.' },
  'restaurant': { emoji: '⚡', title: 'NOOWE Express', desc: 'Restaurante focado em velocidade com pedido antecipado.' },
  'menu': { emoji: '📋', title: 'Menu Rápido', desc: 'Menu padronizado com combos e tempo de preparo visível.' },
  'item': { emoji: '🍔', title: 'Detalhe', desc: 'Visualização rápida do item com adição instantânea.' },
  'order': { emoji: '🛒', title: 'Resumo do Pedido', desc: 'Revisão rápida antes de pagar.' },
  'payment': { emoji: '💳', title: 'Pagamento', desc: 'Checkout em um toque — PIX, cartão ou carteira.' },
  'pickup': { emoji: '📱', title: 'Código de Retirada', desc: 'Código único para retirar no balcão express.' },
  'ready': { emoji: '✅', title: 'Pronto!', desc: 'Notificação push: seu pedido está no balcão!' },
  'rating': { emoji: '⭐', title: 'Avaliação', desc: 'Avaliação rápida de 1-5 estrelas + pontos de fidelidade.' },
};

export const QuickServiceDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [preparing, setPreparing] = useState(false);

  const cartTotal = cart.reduce((s, c) => {
    const item = MENU.find(m => m.id === c.id);
    return s + (item ? item.price * c.qty : 0);
  }, 0);

  const addItem = (id: string) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === id);
      return exists ? prev.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { id, qty: 1 }];
    });
  };

  useEffect(() => {
    if (screen === 'pickup' && !preparing) {
      setPreparing(true);
      const t = setTimeout(() => onNavigate('ready'), 4000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Bom dia 👋</p>
            <h1 className="font-display text-xl font-bold">Pedido rápido</h1>
          </div>
          <GuidedHint text="Toque para fazer um pedido antecipado e pular a fila" />
          <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Buscar restaurantes rápidos...</span>
          </div>
          <div className="flex gap-3 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {['Skip the Line', 'Burgers', 'Pizza', 'Açaí'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4 group">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <span className="text-4xl">⚡</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">NOOWE Express</h3>
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold">Aberto</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Fast Food · R$ · 350m</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-xs font-semibold">4.5</span>
                    <span className="text-xs text-muted-foreground">· Tempo médio: 5 min</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Skip the Line disponível — Peça antes de chegar!</span>
              </div>
            </div>
          </button>
        </div>
      );

    case 'restaurant':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">NOOWE Express</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <span className="text-6xl">⚡</span>
            <h2 className="font-display text-xl font-bold mt-2">NOOWE Express</h2>
            <p className="text-sm text-muted-foreground">Fast Food Premium · Tempo médio 5 min</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-accent fill-accent" /><span className="font-semibold">4.5</span></div>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-muted-foreground">350m</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button onClick={() => onNavigate('menu')} className="py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex flex-col items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Skip the Line</span>
              <span className="text-[10px] opacity-70">Peça antes de chegar</span>
            </button>
            <button onClick={() => onNavigate('menu')} className="py-4 rounded-xl border border-border font-semibold text-sm flex flex-col items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <span>Pedir no Local</span>
              <span className="text-[10px] text-muted-foreground">Fila virtual</span>
            </button>
          </div>
          <GuidedHint text="Escolha 'Skip the Line' para pular a fila" />
        </div>
      );

    case 'menu':
      return (
        <div className="pb-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-5 pb-3 pt-2">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
              <div className="text-center">
                <h1 className="font-display font-bold text-sm">NOOWE Express</h1>
                <div className="flex items-center gap-1 justify-center text-xs text-success"><Zap className="w-3 h-3" /><span className="font-semibold">Skip the Line ativo</span></div>
              </div>
              <div className="w-8" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['Combos', 'Burgers', 'Acompanhamentos', 'Bebidas'].map((cat, i) => (
                <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
              ))}
            </div>
          </div>
          {cart.length === 0 && <div className="px-5"><GuidedHint text="Monte seu pedido e retire no balcão express" /></div>}
          <div className="px-5 space-y-2 mt-3">
            {MENU.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <span className="text-3xl">{item.img}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>R$ {item.price}</span>
                    <span>·</span>
                    <div className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{item.time}min</div>
                  </div>
                </div>
                <button onClick={() => addItem(item.id)} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <div className="fixed bottom-20 left-4 right-4" style={{ maxWidth: 345, margin: '0 auto' }}>
              <button onClick={() => onNavigate('order')} className="w-full flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-glow">
                <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" />Ver Pedido ({cart.reduce((s, c) => s + c.qty, 0)})</span>
                <span className="font-display">R$ {cartTotal}</span>
              </button>
            </div>
          )}
        </div>
      );

    case 'order':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Meu Pedido</h1>
            <div className="w-8" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20 mb-4">
            <Zap className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-semibold">Skip the Line — Retire no balcão express</span>
          </div>
          {cart.map(c => {
            const item = MENU.find(m => m.id === c.id)!;
            return (
              <div key={c.id} className="flex items-center gap-3 py-3 border-b border-border">
                <span className="text-2xl">{item.img}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">R$ {item.price}</p>
                </div>
                <span className="text-sm font-bold">{c.qty}x</span>
              </div>
            );
          })}
          <div className="mt-4 p-4 rounded-xl bg-muted/30">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span>R$ {cartTotal}</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span><span>R$ {cartTotal}</span>
            </div>
          </div>
          <button onClick={() => onNavigate('payment')} className="w-full mt-4 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
            Pagar R$ {cartTotal}
          </button>
        </div>
      );

    case 'payment':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('order')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Pagamento</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-3 mb-5">
            {[
              { id: 'pix', name: 'PIX', icon: QrCode, desc: 'Instantâneo' },
              { id: 'credit', name: 'Cartão de Crédito', icon: CreditCard, desc: '•••• 4242' },
              { id: 'apple', name: 'Apple Pay', icon: Smartphone, desc: 'Touch ID' },
            ].map((m, i) => (
              <button key={m.id} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${i === 0 ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <m.icon className={`w-5 h-5 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                {i === 0 && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
          <button onClick={() => onNavigate('pickup')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Confirmar Pagamento
          </button>
        </div>
      );

    case 'pickup':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5 animate-pulse">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Preparando seu pedido...</h2>
          <p className="text-sm text-muted-foreground mb-6">Tempo estimado: ~5 min</p>
          <div className="w-full p-5 rounded-2xl bg-card border border-border mb-4">
            <p className="text-xs text-muted-foreground mb-2">Seu código de retirada</p>
            <p className="font-display text-4xl font-bold tracking-widest text-primary">NE-847</p>
            <p className="text-xs text-muted-foreground mt-2">Mostre no balcão express</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Acompanhando em tempo real...</span>
          </div>
        </div>
      );

    case 'ready':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Pedido Pronto! 🎉</h2>
          <p className="text-sm text-muted-foreground mb-4">Retire no balcão express</p>
          <div className="w-full p-5 rounded-2xl bg-card border border-border mb-4">
            <p className="font-display text-4xl font-bold tracking-widest text-success">NE-847</p>
            <p className="text-xs text-muted-foreground mt-2">Tempo total: 4 min 32s ⚡</p>
          </div>
          <button onClick={() => onNavigate('rating')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
            Avaliar Experiência
          </button>
        </div>
      );

    case 'rating':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <span className="text-5xl mb-4">⚡</span>
          <h2 className="font-display text-xl font-bold mb-2">Como foi sua experiência?</h2>
          <p className="text-sm text-muted-foreground mb-6">NOOWE Express</p>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} className={`w-12 h-12 rounded-xl flex items-center justify-center ${s <= 4 ? 'bg-accent/20' : 'bg-muted'}`}>
                <Star className={`w-6 h-6 ${s <= 4 ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-semibold">+15 pontos ganhos!</p>
              <p className="text-xs text-muted-foreground">Acumule e troque por refeições grátis</p>
            </div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default:
      return null;
  }
};
