/**
 * Fast Casual Demo — NOOWE Fresh
 * Journey: Discover → Dish Builder (Base → Protein → Toppings → Sauce) → Nutrition → Payment → Pickup
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Loader2, Star, Clock, ChevronRight,
  Leaf, Flame, Droplets, Wheat, CreditCard, Gift, Plus,
  ArrowRight, Search, MapPin, Zap,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'builder-base' | 'builder-protein' | 'builder-toppings' | 'builder-sauce' | 'builder-summary' | 'payment' | 'ready';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir restaurante', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Escolher base', screens: ['builder-base'] },
  { step: 3, label: 'Escolher proteína', screens: ['builder-protein'] },
  { step: 4, label: 'Escolher toppings', screens: ['builder-toppings'] },
  { step: 5, label: 'Escolher molho', screens: ['builder-sauce'] },
  { step: 6, label: 'Resumo nutricional', screens: ['builder-summary'] },
  { step: 7, label: 'Pagamento', screens: ['payment'] },
  { step: 8, label: 'Pedido pronto!', screens: ['ready'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Encontre opções saudáveis e customizáveis por perto.' },
  'restaurant': { emoji: '🥗', title: 'NOOWE Fresh', desc: 'Restaurante fast casual com montagem personalizada.' },
  'builder-base': { emoji: '🍚', title: 'Escolha a Base', desc: 'Primeiro passo: escolha entre arroz, quinoa, salada ou wrap.' },
  'builder-protein': { emoji: '🥩', title: 'Proteína', desc: 'Segundo passo: selecione a proteína do seu prato.' },
  'builder-toppings': { emoji: '🥬', title: 'Toppings', desc: 'Terceiro passo: adicione vegetais e complementos ilimitados.' },
  'builder-sauce': { emoji: '🫗', title: 'Molho', desc: 'Toque final: escolha até 2 molhos artesanais.' },
  'builder-summary': { emoji: '📊', title: 'Resumo Nutricional', desc: 'Veja calorias, proteínas, carboidratos e preço final.' },
  'payment': { emoji: '💳', title: 'Pagamento', desc: 'Checkout rápido com informações nutricionais.' },
  'ready': { emoji: '✅', title: 'Pronto!', desc: 'Retire na bandeja com seu nome.' },
};

const BASES = [
  { id: 'rice', name: 'Arroz Branco', cal: 200, emoji: '🍚' },
  { id: 'brown', name: 'Arroz Integral', cal: 180, emoji: '🍙' },
  { id: 'quinoa', name: 'Quinoa', cal: 160, emoji: '🌾' },
  { id: 'salad', name: 'Mix de Folhas', cal: 30, emoji: '🥬' },
];

const PROTEINS = [
  { id: 'chicken', name: 'Frango Grelhado', cal: 165, price: 12, emoji: '🍗' },
  { id: 'beef', name: 'Carne Bovina', cal: 250, price: 16, emoji: '🥩' },
  { id: 'salmon', name: 'Salmão', cal: 208, price: 20, emoji: '🐟' },
  { id: 'tofu', name: 'Tofu Crocante', cal: 144, price: 10, emoji: '🧈' },
];

const TOPPINGS = [
  { id: 'tomato', name: 'Tomate', cal: 5, emoji: '🍅' },
  { id: 'corn', name: 'Milho', cal: 15, emoji: '🌽' },
  { id: 'cucumber', name: 'Pepino', cal: 3, emoji: '🥒' },
  { id: 'carrot', name: 'Cenoura', cal: 8, emoji: '🥕' },
  { id: 'avocado', name: 'Abacate', cal: 40, emoji: '🥑', extra: 5 },
  { id: 'egg', name: 'Ovo Cozido', cal: 70, emoji: '🥚', extra: 3 },
];

const SAUCES = [
  { id: 'tahini', name: 'Tahini', cal: 45, emoji: '🫗' },
  { id: 'caesar', name: 'Caesar', cal: 60, emoji: '🧴' },
  { id: 'oriental', name: 'Oriental', cal: 35, emoji: '🥢' },
  { id: 'mostarda', name: 'Mostarda & Mel', cal: 50, emoji: '🍯' },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const FastCasualDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [base, setBase] = useState('rice');
  const [protein, setProtein] = useState('chicken');
  const [toppings, setToppings] = useState(['tomato', 'corn', 'cucumber']);
  const [sauces, setSauces] = useState(['tahini']);

  const baseItem = BASES.find(b => b.id === base)!;
  const proteinItem = PROTEINS.find(p => p.id === protein)!;
  const selectedToppings = TOPPINGS.filter(t => toppings.includes(t.id));
  const selectedSauces = SAUCES.filter(s => sauces.includes(s.id));

  const totalCal = baseItem.cal + proteinItem.cal + selectedToppings.reduce((s, t) => s + t.cal, 0) + selectedSauces.reduce((s, sa) => s + sa.cal, 0);
  const basePrice = 28;
  const totalPrice = basePrice + proteinItem.price + selectedToppings.reduce((s, t) => s + (t.extra || 0), 0);

  const toggleTopping = (id: string) => setToppings(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  const toggleSauce = (id: string) => setSauces(prev => prev.includes(id) ? (prev.length > 0 ? prev.filter(s => s !== id) : prev) : prev.length < 2 ? [...prev, id] : prev);

  const BuilderProgress: React.FC<{ step: number }> = ({ step }) => (
    <div className="flex items-center gap-1 px-5 mb-4">
      {['Base', 'Proteína', 'Toppings', 'Molho'].map((label, i) => (
        <div key={label} className="flex-1">
          <div className={`h-1.5 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/50' : 'bg-muted'}`} />
          <p className={`text-[9px] text-center mt-1 ${i <= step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{label}</p>
        </div>
      ))}
    </div>
  );

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Olá! 🥗</p>
            <h1 className="font-display text-xl font-bold">Monte seu prato</h1>
          </div>
          <GuidedHint text="Customize cada ingrediente do seu prato ideal" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🥗</span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold">NOOWE Fresh</h3>
                  <p className="text-xs text-muted-foreground">Fast Casual · R$$ · Ingredientes frescos</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">4.7</span>
                    <span className="text-xs text-muted-foreground">· Monte seu prato</span>
                  </div>
                </div>
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
            <h1 className="font-display font-bold">NOOWE Fresh</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <span className="text-6xl">🥗</span>
            <h2 className="font-display text-xl font-bold mt-2">Monte seu prato perfeito</h2>
            <p className="text-sm text-muted-foreground">Escolha cada ingrediente. Veja as calorias em tempo real.</p>
          </div>
          <GuidedHint text="Toque para começar a montar seu prato" />
          <button onClick={() => onNavigate('builder-base')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <Leaf className="w-5 h-5" />Começar Montagem
          </button>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: Leaf, label: 'Ingredientes\nFrescos', value: '100%' },
              { icon: Flame, label: 'Calorias\nCalculadas', value: 'IA' },
              { icon: Clock, label: 'Tempo\nMédio', value: '8 min' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground whitespace-pre-line">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'builder-base':
      return (
        <div className="pb-4">
          <div className="px-5 flex items-center justify-between py-4">
            <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Escolha a Base</h1>
            <div className="w-8" />
          </div>
          <BuilderProgress step={0} />
          <div className="px-5 space-y-3">
            {BASES.map(b => (
              <button key={b.id} onClick={() => setBase(b.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${base === b.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className="text-3xl">{b.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.cal} kcal</p>
                </div>
                {base === b.id && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
          <div className="px-5 mt-5">
            <button onClick={() => onNavigate('builder-protein')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
              Próximo: Proteína <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'builder-protein':
      return (
        <div className="pb-4">
          <div className="px-5 flex items-center justify-between py-4">
            <button onClick={() => onNavigate('builder-base')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Escolha a Proteína</h1>
            <div className="w-8" />
          </div>
          <BuilderProgress step={1} />
          <div className="px-5 space-y-3">
            {PROTEINS.map(p => (
              <button key={p.id} onClick={() => setProtein(p.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${protein === p.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.cal} kcal · +R$ {p.price}</p>
                </div>
                {protein === p.id && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
          <div className="px-5 mt-5">
            <button onClick={() => onNavigate('builder-toppings')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
              Próximo: Toppings <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'builder-toppings':
      return (
        <div className="pb-4">
          <div className="px-5 flex items-center justify-between py-4">
            <button onClick={() => onNavigate('builder-protein')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Toppings</h1>
            <div className="w-8" />
          </div>
          <BuilderProgress step={2} />
          <p className="px-5 text-xs text-muted-foreground mb-3">Escolha quantos quiser (extras com custo adicional)</p>
          <div className="px-5 space-y-2">
            {TOPPINGS.map(t => (
              <button key={t.id} onClick={() => toggleTopping(t.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${toppings.includes(t.id) ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className="text-2xl">{t.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.cal} kcal{t.extra ? ` · +R$ ${t.extra}` : ' · Grátis'}</p>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${toppings.includes(t.id) ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                  {toppings.includes(t.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </button>
            ))}
          </div>
          <div className="px-5 mt-5">
            <button onClick={() => onNavigate('builder-sauce')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
              Próximo: Molho <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'builder-sauce':
      return (
        <div className="pb-4">
          <div className="px-5 flex items-center justify-between py-4">
            <button onClick={() => onNavigate('builder-toppings')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Molho</h1>
            <div className="w-8" />
          </div>
          <BuilderProgress step={3} />
          <p className="px-5 text-xs text-muted-foreground mb-3">Escolha até 2 molhos artesanais</p>
          <div className="px-5 space-y-3">
            {SAUCES.map(s => (
              <button key={s.id} onClick={() => toggleSauce(s.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${sauces.includes(s.id) ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className="text-3xl">{s.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.cal} kcal</p>
                </div>
                {sauces.includes(s.id) && <Check className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
          <div className="px-5 mt-5">
            <button onClick={() => onNavigate('builder-summary')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
              Ver Resumo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'builder-summary':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('builder-sauce')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Seu Prato</h1>
            <div className="w-8" />
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-4">
            <h2 className="font-display text-lg font-bold mb-3">Bowl Personalizado</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><span>{baseItem.emoji}</span><span>{baseItem.name}</span></div>
              <div className="flex items-center gap-2"><span>{proteinItem.emoji}</span><span>{proteinItem.name}</span></div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedToppings.map(t => (<span key={t.id} className="px-2 py-0.5 rounded-full bg-muted text-xs">{t.emoji} {t.name}</span>))}
              </div>
              <div className="flex items-center gap-2">
                {selectedSauces.map(s => (<span key={s.id} className="px-2 py-0.5 rounded-full bg-primary/10 text-xs text-primary">{s.emoji} {s.name}</span>))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: Flame, label: 'Calorias', value: `${totalCal}` },
              { icon: Droplets, label: 'Proteína', value: '32g' },
              { icon: Wheat, label: 'Carbos', value: '45g' },
              { icon: Leaf, label: 'Fibras', value: '8g' },
            ].map((n, i) => (
              <div key={i} className="p-3 rounded-xl bg-card border border-border text-center">
                <n.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{n.value}</p>
                <p className="text-[9px] text-muted-foreground">{n.label}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Base + montagem</span><span>R$ {basePrice}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Proteína</span><span>+R$ {proteinItem.price}</span></div>
            {selectedToppings.filter(t => t.extra).map(t => (
              <div key={t.id} className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{t.name}</span><span>+R$ {t.extra}</span></div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span><span className="text-primary">R$ {totalPrice}</span>
            </div>
          </div>
          <button onClick={() => onNavigate('payment')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar R$ {totalPrice}
          </button>
        </div>
      );

    case 'payment':
    case 'ready':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Prato Pronto! 🥗</h2>
          <p className="text-sm text-muted-foreground mb-2">Retire na bandeja com seu nome</p>
          <p className="text-xs text-muted-foreground mb-4">{totalCal} kcal · {totalPrice > 0 ? `R$ ${totalPrice}` : ''}</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+12 pontos ganhos!</p><p className="text-xs text-muted-foreground">Monte 10 pratos e ganhe um grátis</p></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
