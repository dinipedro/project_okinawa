/**
 * Casual Dining Demo — Cantina Noowe
 * Journey: Walk-in or Reserve → Smart Waitlist → Family Mode → Menu → Order → Split → Review
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard, Gift, QrCode,
  Users, Timer, ArrowRight, UtensilsCrossed, CalendarDays, Baby, Heart,
  HandMetal, MapPin, Search,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'entry-choice' | 'waitlist' | 'family-mode' | 'menu' | 'comanda' | 'split' | 'payment-success';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir restaurante', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Walk-in ou reserva', screens: ['entry-choice'] },
  { step: 3, label: 'Lista de espera inteligente', screens: ['waitlist'] },
  { step: 4, label: 'Modo família', screens: ['family-mode'] },
  { step: 5, label: 'Cardápio & pedido', screens: ['menu', 'comanda'] },
  { step: 6, label: 'Dividir conta', screens: ['split'] },
  { step: 7, label: 'Pagamento', screens: ['payment-success'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Encontre restaurantes casuais para a família.' },
  'restaurant': { emoji: '🍕', title: 'Cantina Noowe', desc: 'Restaurante casual familiar com reserva opcional.' },
  'entry-choice': { emoji: '🚶', title: 'Entrada', desc: 'Escolha: Walk-in com lista de espera ou reserva antecipada.' },
  'waitlist': { emoji: '⏱️', title: 'Lista de Espera', desc: 'Lista inteligente: peça bebidas enquanto espera.' },
  'family-mode': { emoji: '👨‍👩‍👧‍👦', title: 'Modo Família', desc: 'Cardápio kids, cadeirão e atividades para crianças.' },
  'menu': { emoji: '📋', title: 'Cardápio', desc: 'Menu completo com destaque para opções kids.' },
  'comanda': { emoji: '📝', title: 'Comanda', desc: 'Pedido com indicação de quem pediu cada item.' },
  'split': { emoji: '💳', title: 'Dividir Conta', desc: 'Divisão facilitada para grupos e famílias.' },
  'payment-success': { emoji: '✅', title: 'Pagamento', desc: 'Gorjeta sugerida e pontos de fidelidade.' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const CasualDiningDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [queuePos, setQueuePos] = useState(3);
  const [familyMode, setFamilyMode] = useState(false);

  useEffect(() => {
    if (screen === 'waitlist') {
      const t = setInterval(() => setQueuePos(prev => Math.max(1, prev - 1)), 3000);
      return () => clearInterval(t);
    }
  }, [screen]);

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Boa noite 👨‍👩‍👧‍👦</p>
            <h1 className="font-display text-xl font-bold">Jantar em família</h1>
          </div>
          <GuidedHint text="Encontre restaurantes casuais com Modo Família" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🍕</span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold">Cantina Noowe</h3>
                  <p className="text-xs text-muted-foreground">Casual Dining · R$$$ · 500m</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <Star className="w-3 h-3 text-accent fill-accent" /><span className="font-semibold">4.6</span>
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-semibold">👶 Kids Friendly</span>
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
            <h1 className="font-display font-bold">Cantina Noowe</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <span className="text-6xl">🍕</span>
            <h2 className="font-display text-xl font-bold mt-2">Cantina Noowe</h2>
            <p className="text-sm text-muted-foreground">Comida italiana casual · Ambiente familiar</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" />4.6</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">R$ 60-150/pessoa</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Garçom na mesa', 'Kids Friendly', 'Reserva opcional', 'Grupos'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">{f}</span>
            ))}
          </div>
          <GuidedHint text="Walk-in com lista de espera ou reserve antecipado" />
          <button onClick={() => onNavigate('entry-choice')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
            Entrar no Restaurante
          </button>
        </div>
      );

    case 'entry-choice':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Como entrar?</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-3">
            <button onClick={() => onNavigate('waitlist')} className="w-full p-5 rounded-2xl border-2 border-primary bg-primary/10 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Timer className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-bold text-sm text-primary">Walk-in · Lista de Espera</p>
                  <p className="text-xs text-muted-foreground">~15 min de espera · Peça bebidas enquanto aguarda</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-warning"><span>⚠️ 3 grupos na fila</span></div>
            </button>
            <button className="w-full p-5 rounded-2xl border-2 border-border bg-card text-left">
              <div className="flex items-center gap-3 mb-2">
                <CalendarDays className="w-6 h-6 text-muted-foreground" />
                <div>
                  <p className="font-bold text-sm">Reserva Antecipada</p>
                  <p className="text-xs text-muted-foreground">Garanta sua mesa · Ideal para grupos 5+</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      );

    case 'waitlist':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('entry-choice')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Lista de Espera</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Posição: {queuePos}º</h2>
            <p className="text-sm text-muted-foreground">Espera: ~{queuePos * 5} min</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <p className="text-xs font-semibold text-primary mb-2">💡 Enquanto espera, você pode:</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>🍺 Pedir bebidas e aperitivos (vão para sua comanda)</p>
              <p>🚶 Passear e ser notificado por push</p>
              <p>📋 Ver o cardápio e favoritar itens</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-muted/30">
            <Baby className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Modo Família disponível</p>
              <p className="text-xs text-muted-foreground">Ative para cardápio kids e cadeirão</p>
            </div>
            <button onClick={() => { setFamilyMode(true); onNavigate('family-mode'); }} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Ativar</button>
          </div>
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <UtensilsCrossed className="w-5 h-5" />Ver Cardápio Enquanto Espera
          </button>
        </div>
      );

    case 'family-mode':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('waitlist')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold flex items-center gap-2"><Baby className="w-4 h-4 text-primary" />Modo Família</h1>
            <div className="w-8" />
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <p className="text-sm font-bold text-foreground mb-2">👨‍👩‍👧‍👦 Modo Família Ativado</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" />Cardápio Kids em destaque</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" />Cadeirão reservado automaticamente</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" />Kit de atividades para crianças</p>
              <p className="flex items-center gap-2"><Check className="w-3 h-3 text-success" />Pratos kids chegam primeiro</p>
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-3">🍟 Cardápio Kids</h3>
          {[
            { name: 'Mini Pizza Margherita', price: 25, emoji: '🍕' },
            { name: 'Nuggets com Batata', price: 22, emoji: '🍗' },
            { name: 'Macarrão com Queijo', price: 20, emoji: '🧀' },
            { name: 'Suco Natural', price: 10, emoji: '🧃' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card mb-2">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1"><p className="font-semibold text-sm">{item.name}</p><p className="text-xs text-muted-foreground">R$ {item.price}</p></div>
              <Plus className="w-4 h-4 text-primary" />
            </div>
          ))}
          <button onClick={() => onNavigate('menu')} className="w-full mt-4 py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Ver Cardápio Completo
          </button>
        </div>
      );

    case 'menu':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Cardápio</h1>
            <div className="w-8" />
          </div>
          {familyMode && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20 mb-3">
              <Baby className="w-3 h-3 text-primary" /><span className="text-[10px] text-primary font-semibold">Modo Família ativo — Kids Menu em destaque</span>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {['Kids 👶', 'Massas', 'Pizzas', 'Carnes', 'Sobremesas'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 && familyMode ? 'bg-primary text-primary-foreground' : i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          {[
            { name: 'Lasanha Bolonhesa', price: 52, emoji: '🍝' },
            { name: 'Pizza Pepperoni', price: 58, emoji: '🍕' },
            { name: 'Risoto de Camarão', price: 72, emoji: '🦐' },
            { name: 'Filé à Parmegiana', price: 65, emoji: '🥩' },
            { name: 'Tiramisù', price: 28, emoji: '🍰' },
          ].map((item, i) => (
            <button key={i} onClick={() => onNavigate('comanda')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left mb-2">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1"><p className="font-semibold text-sm">{item.name}</p><p className="text-xs text-muted-foreground">R$ {item.price}</p></div>
              <Plus className="w-4 h-4 text-primary" />
            </button>
          ))}
        </div>
      );

    case 'comanda':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Comanda</h1>
            <div className="w-8" />
          </div>
          <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3 mb-4">
            <span className="text-2xl">🍕</span>
            <div><p className="font-semibold text-sm">Cantina Noowe</p><p className="text-xs text-muted-foreground">Mesa 8 · 4 pessoas</p></div>
          </div>
          {[
            { name: 'Lasanha Bolonhesa', price: 52, who: 'Você' },
            { name: 'Pizza Pepperoni', price: 58, who: 'Maria' },
            { name: 'Mini Pizza Kids', price: 25, who: 'Sofia 👶' },
            { name: 'Risoto de Camarão', price: 72, who: 'João' },
            { name: 'Refrigerantes (4x)', price: 36, who: 'Mesa' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border">
              <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.who}</p></div>
              <span className="font-semibold text-sm">R$ {item.price}</span>
            </div>
          ))}
          <div className="mt-4 p-4 rounded-xl bg-muted/30">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span>R$ 243</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Serviço (10%)</span><span>R$ 24,30</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg"><span>Total</span><span>R$ 267,30</span></div>
          </div>
          <button onClick={() => onNavigate('split')} className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />Dividir Conta
          </button>
        </div>
      );

    case 'split':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('comanda')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Dividir Conta</h1>
            <div className="w-8" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { name: 'Meus Itens', desc: 'R$ 52 + serviço', active: true },
              { name: 'Partes Iguais', desc: 'R$ 66,83 cada' },
              { name: 'Por Item', desc: 'Escolha os itens' },
              { name: 'Valor Fixo', desc: 'Defina o valor' },
            ].map((mode, i) => (
              <button key={i} className={`p-3 rounded-2xl border-2 text-left ${i === 0 ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <p className={`text-xs font-semibold ${i === 0 ? 'text-primary' : 'text-foreground'}`}>{mode.name}</p>
                <p className="text-[10px] text-muted-foreground">{mode.desc}</p>
              </button>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Seus itens</span><span>R$ 52,00</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Refrigerante (÷4)</span><span>R$ 9,00</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Serviço (10%)</span><span>R$ 6,10</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold"><span>Você paga</span><span className="text-primary text-lg">R$ 67,10</span></div>
          </div>
          <div className="flex gap-2 mb-4">
            {[0, 10, 15, 20].map(p => (
              <button key={p} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 ${p === 10 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                {p === 0 ? 'Sem' : `${p}%`}
              </button>
            ))}
          </div>
          <button onClick={() => onNavigate('payment-success')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar R$ 73,81
          </button>
        </div>
      );

    case 'payment-success':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Obrigado pela visita! 🍕</h2>
          <p className="text-sm text-muted-foreground mb-4">Cantina Noowe agradece a sua família</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+25 pontos ganhos!</p><p className="text-xs text-muted-foreground">Próxima sobremesa kids grátis em 2 visitas</p></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
