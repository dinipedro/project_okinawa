/**
 * Pub & Bar Demo — Noowe Tap House
 * Journey: Open Tab → Group Tab → Happy Hour → Order Rounds → Repeat Round → Split by Consumption → Close
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, CreditCard, Gift, QrCode,
  Users, Timer, ArrowRight, Beer, RefreshCw, UserPlus, Share2,
  Copy, Send, ChevronDown, Zap, Sparkles, HandMetal, DollarSign,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'open-tab' | 'group-tab' | 'happy-hour' | 'menu' | 'round' | 'repeat-round' | 'close-tab';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir bar', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Abrir Tab Digital', screens: ['open-tab'] },
  { step: 3, label: 'Tab compartilhado', screens: ['group-tab'] },
  { step: 4, label: 'Happy Hour', screens: ['happy-hour'] },
  { step: 5, label: 'Pedir rodada', screens: ['menu', 'round'] },
  { step: 6, label: 'Repetir rodada', screens: ['repeat-round'] },
  { step: 7, label: 'Fechar Tab', screens: ['close-tab'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Encontre bares com tab digital e happy hour.' },
  'restaurant': { emoji: '🍺', title: 'Noowe Tap House', desc: 'Pub com 20 torneiras e tab digital.' },
  'open-tab': { emoji: '💳', title: 'Abrir Tab', desc: 'Tab 100% digital com pré-autorização no cartão.' },
  'group-tab': { emoji: '👥', title: 'Tab Compartilhado', desc: 'Convide amigos — cada um registra o que pediu.' },
  'happy-hour': { emoji: '🎉', title: 'Happy Hour', desc: 'Preços automáticos de happy hour ativo agora.' },
  'menu': { emoji: '📋', title: 'Cardápio', desc: 'Torneiras, drinks clássicos e petiscos.' },
  'round': { emoji: '🍻', title: 'Rodada', desc: 'Pedido de rodada para todo o grupo.' },
  'repeat-round': { emoji: '🔄', title: 'Repetir Rodada', desc: 'Um toque para repetir a última rodada.' },
  'close-tab': { emoji: '💰', title: 'Fechar Tab', desc: 'Divisão por consumo individual ou igual.' },
};

const DRINKS = [
  { id: 'd1', name: 'IPA Artesanal', price: 28, priceHH: 19, emoji: '🍺', cat: 'Chopp' },
  { id: 'd2', name: 'Pilsen Premium', price: 22, priceHH: 15, emoji: '🍺', cat: 'Chopp' },
  { id: 'd3', name: 'Gin Tônica', price: 38, priceHH: 26, emoji: '🍸', cat: 'Drinks' },
  { id: 'd4', name: 'Aperol Spritz', price: 35, priceHH: 24, emoji: '🥂', cat: 'Drinks' },
  { id: 'd5', name: 'Porção de Batata', price: 32, priceHH: 32, emoji: '🍟', cat: 'Petiscos' },
  { id: 'd6', name: 'Nachos Supreme', price: 38, priceHH: 38, emoji: '🫔', cat: 'Petiscos' },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const PubBarDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [isHappyHour] = useState(true);
  const [tabItems, setTabItems] = useState<{ id: string; who: string }[]>([]);

  const tabTotal = tabItems.reduce((s, t) => {
    const drink = DRINKS.find(d => d.id === t.id);
    return s + (drink ? (isHappyHour ? drink.priceHH : drink.price) : 0);
  }, 0);

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Sexta-feira! 🍺</p>
            <h1 className="font-display text-xl font-bold">Bares por perto</h1>
          </div>
          <GuidedHint text="Encontre bares com tab digital e happy hour ativo" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600/10 to-yellow-700/10 border border-amber-600/20">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🍺</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">Noowe Tap House</h3>
                    {isHappyHour && <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-[10px] font-bold animate-pulse">🎉 Happy Hour</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">Pub · 20 torneiras · 400m</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">4.7</span>
                    <span className="text-xs text-muted-foreground">· Tab digital</span>
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
            <h1 className="font-display font-bold">Noowe Tap House</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-4">
            <span className="text-6xl">🍺</span>
            <h2 className="font-display text-xl font-bold mt-2">Noowe Tap House</h2>
            <p className="text-sm text-muted-foreground">20 torneiras artesanais · Ambiente social</p>
          </div>
          {isHappyHour && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-warning/10 to-accent/10 border border-warning/20 mb-4 text-center">
              <Sparkles className="w-6 h-6 text-warning mx-auto mb-1" />
              <p className="font-bold text-sm text-warning">Happy Hour Ativo!</p>
              <p className="text-xs text-muted-foreground">Chopp e drinks com até 30% off · Até 20:00</p>
            </div>
          )}
          <GuidedHint text="Abra um tab digital para começar" />
          <button onClick={() => onNavigate('open-tab')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <Beer className="w-5 h-5" />Abrir Tab Digital
          </button>
        </div>
      );

    case 'open-tab':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Abrir Tab</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Pré-autorização</h2>
            <p className="text-sm text-muted-foreground">Vinculamos seu cartão ao tab — você paga só o que consumir</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1"><p className="text-sm font-medium">•••• •••• •••• 4242</p><p className="text-xs text-muted-foreground">Visa · Crédito</p></div>
              <Check className="w-4 h-4 text-success" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4 text-center">💡 Nenhuma cobrança até você fechar o tab</p>
          <button onClick={() => onNavigate('group-tab')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
            Abrir Tab
          </button>
        </div>
      );

    case 'group-tab':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('open-tab')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Tab Compartilhado</h1>
            <div className="w-8" />
          </div>
          <div className="p-4 rounded-xl bg-success/10 border border-success/20 mb-4 text-center">
            <Check className="w-6 h-6 text-success mx-auto mb-1" />
            <p className="text-sm font-bold text-success">Tab Aberto!</p>
            <p className="text-xs text-muted-foreground">Tab #TH-284 · Noowe Tap House</p>
          </div>
          <h3 className="font-semibold text-sm mb-3">Convidar amigos</h3>
          <div className="flex gap-2 mb-4">
            {[
              { name: 'Você', status: 'host' },
              { name: 'Lucas', status: 'joined' },
              { name: 'Ana', status: 'pending' },
            ].map((p, i) => (
              <div key={i} className={`flex-1 p-3 rounded-2xl border-2 text-center ${i === 0 ? 'border-primary bg-primary/5' : i === 1 ? 'border-success bg-success/5' : 'border-border'}`}>
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-primary-foreground text-sm font-bold ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-success' : 'bg-muted text-muted-foreground'}`}>
                  {p.name[0]}
                </div>
                <p className="text-xs font-medium">{p.name}</p>
                <p className="text-[9px] text-muted-foreground">{p.status === 'host' ? 'Host' : p.status === 'joined' ? '✓ No tab' : 'Pendente'}</p>
              </div>
            ))}
            <button className="flex-1 p-3 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center">
              <UserPlus className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground">Convidar</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="flex-1 text-xs text-muted-foreground">noowe.app/tab/TH-284</span>
              <button className="p-1.5 rounded-md bg-primary/10"><Copy className="w-3 h-3 text-primary" /></button>
            </div>
          </div>
          <GuidedHint text="Convide amigos e cada um registra o que pediu" />
          <button onClick={() => onNavigate('happy-hour')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <Beer className="w-5 h-5" />Ver Cardápio
          </button>
        </div>
      );

    case 'happy-hour':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('group-tab')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">🎉 Happy Hour</h1>
            <div className="w-8" />
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-warning/10 to-accent/10 border border-warning/20 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-warning">Happy Hour Ativo!</p>
                <p className="text-xs text-muted-foreground">Até 20:00 · Faltam 1h 32min</p>
              </div>
              <Timer className="w-5 h-5 text-warning" />
            </div>
          </div>
          <div className="space-y-2">
            {DRINKS.filter(d => d.cat !== 'Petiscos').map(drink => (
              <button key={drink.id} onClick={() => { setTabItems(prev => [...prev, { id: drink.id, who: 'Você' }]); onNavigate('round'); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <span className="text-2xl">{drink.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{drink.name}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="line-through text-muted-foreground">R$ {drink.price}</span>
                    <span className="text-warning font-bold">R$ {drink.priceHH}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-warning/20 text-warning text-[9px] font-bold">-{Math.round((1 - drink.priceHH / drink.price) * 100)}%</span>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-primary" />
              </button>
            ))}
          </div>
        </div>
      );

    case 'menu':
    case 'round':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('happy-hour')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Seu Tab</h1>
            <div className="w-8" />
          </div>
          <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3 mb-4">
            <Beer className="w-5 h-5 text-primary" />
            <div className="flex-1"><p className="font-semibold text-sm">Tab #TH-284</p><p className="text-xs text-muted-foreground">3 pessoas · Happy Hour</p></div>
            <span className="font-display font-bold text-primary">R$ {tabTotal + 57}</span>
          </div>
          <h3 className="font-semibold text-sm mb-2">Última rodada</h3>
          {[
            { drink: 'IPA Artesanal', who: 'Você', price: 19 },
            { drink: 'Pilsen Premium', who: 'Lucas', price: 15 },
            { drink: 'Gin Tônica', who: 'Ana', price: 26 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border">
              <span className="text-lg">🍺</span>
              <div className="flex-1"><p className="text-sm font-medium">{item.drink}</p><p className="text-xs text-muted-foreground">{item.who}</p></div>
              <span className="text-sm font-semibold">R$ {item.price}</span>
            </div>
          ))}
          <GuidedHint text="Repita a última rodada com um toque" pulse={false} />
          <button onClick={() => onNavigate('repeat-round')} className="w-full mt-4 py-4 bg-gradient-to-r from-warning to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5" />Repetir Rodada
          </button>
          <button onClick={() => onNavigate('close-tab')} className="w-full mt-2 py-3 border border-border rounded-xl font-semibold text-sm">
            Fechar Tab
          </button>
        </div>
      );

    case 'repeat-round':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5">
            <RefreshCw className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Rodada Repetida! 🍻</h2>
          <p className="text-sm text-muted-foreground mb-4">Mesmos drinks para os 3</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-4 space-y-2">
            {['IPA Artesanal · Você', 'Pilsen Premium · Lucas', 'Gin Tônica · Ana'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm"><Check className="w-3 h-3 text-success" /><span>{item}</span></div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-4">O garçom já recebeu o pedido ⚡</p>
          <button onClick={() => onNavigate('close-tab')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Fechar Tab
          </button>
        </div>
      );

    case 'close-tab':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('round')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Fechar Tab</h1>
            <div className="w-8" />
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <h3 className="font-semibold text-sm mb-3">Resumo do Tab</h3>
            {[
              { name: 'Você', items: 3, total: 57 },
              { name: 'Lucas', items: 3, total: 45 },
              { name: 'Ana', items: 3, total: 78 },
            ].map((person, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold ${i === 0 ? 'bg-primary' : 'bg-muted text-foreground'}`}>{person.name[0]}</div>
                  <div><p className="text-sm font-medium">{person.name}</p><p className="text-xs text-muted-foreground">{person.items} drinks</p></div>
                </div>
                <span className="font-semibold text-sm">R$ {person.total}</span>
              </div>
            ))}
            <div className="border-t-2 border-border pt-3 mt-2">
              <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span>R$ 180</span></div>
              <div className="flex justify-between text-sm mb-1"><span className="text-warning font-semibold">Desconto Happy Hour</span><span className="text-warning">-R$ 36</span></div>
              <div className="flex justify-between font-display font-bold text-lg mt-2"><span>Total</span><span className="text-primary">R$ 144</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button className="p-3 rounded-xl border-2 border-primary bg-primary/10 text-center">
              <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-semibold text-primary">Por Consumo</p>
              <p className="text-[10px] text-muted-foreground">Cada um paga o que pediu</p>
            </button>
            <button className="p-3 rounded-xl border-2 border-border bg-card text-center">
              <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-semibold">Igual</p>
              <p className="text-[10px] text-muted-foreground">R$ 48 cada</p>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between font-bold"><span>Você paga</span><span className="text-primary text-xl">R$ 57,00</span></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Fechar & Pagar
          </button>
        </div>
      );

    default: return null;
  }
};
