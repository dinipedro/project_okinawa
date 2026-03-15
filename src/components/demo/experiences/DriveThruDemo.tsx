/**
 * Drive-Thru Demo — NOOWE Drive
 * Journey: Order on the Way → GPS Detection → Geofencing → Pickup Window → Done
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, CreditCard, Gift,
  MapPin, Navigation, Car, ArrowRight, Loader2, Radio,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'menu' | 'order' | 'gps-approach' | 'geofence' | 'pickup' | 'done';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Pedir no caminho', screens: ['home', 'restaurant', 'menu'] },
  { step: 2, label: 'Confirmar pedido', screens: ['order'] },
  { step: 3, label: 'GPS detecta você', screens: ['gps-approach'] },
  { step: 4, label: 'Geofencing (500m)', screens: ['geofence'] },
  { step: 5, label: 'Janela de retirada', screens: ['pickup'] },
  { step: 6, label: 'Retirado!', screens: ['done'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Peça no caminho sem sair do carro.' },
  'restaurant': { emoji: '🚗', title: 'NOOWE Drive', desc: 'Drive-thru inteligente com GPS.' },
  'menu': { emoji: '📋', title: 'Menu', desc: 'Escolha enquanto dirige — o preparo começa quando você se aproxima.' },
  'order': { emoji: '🛒', title: 'Confirmar', desc: 'Pedido e pagamento pelo app.' },
  'gps-approach': { emoji: '📍', title: 'GPS Ativo', desc: 'O app detecta sua aproximação e avisa a cozinha.' },
  'geofence': { emoji: '🛰️', title: 'Geofencing', desc: 'A 500m, a cozinha finaliza seu pedido.' },
  'pickup': { emoji: '🚗', title: 'Janela de Retirada', desc: 'Pedido pronto e pago — retire na janela.' },
  'done': { emoji: '✅', title: 'Concluído', desc: 'Pedido entregue em menos de 2 minutos!' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const DriveThruDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [distance, setDistance] = useState(5.2);
  const [geoTriggered, setGeoTriggered] = useState(false);

  useEffect(() => {
    if (screen === 'gps-approach') {
      const t = setInterval(() => {
        setDistance(prev => {
          const next = prev - 0.3;
          if (next <= 0.5) { clearInterval(t); setTimeout(() => onNavigate('geofence'), 500); return 0.5; }
          return Math.round(next * 10) / 10;
        });
      }, 400);
      return () => clearInterval(t);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'geofence' && !geoTriggered) {
      setGeoTriggered(true);
      setTimeout(() => onNavigate('pickup'), 3000);
    }
  }, [screen]);

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Dirigindo? 🚗</p>
            <h1 className="font-display text-xl font-bold">Peça no caminho</h1>
          </div>
          <GuidedHint text="Peça pelo app e retire na janela sem esperar" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🚗</span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold">NOOWE Drive</h3>
                  <p className="text-xs text-muted-foreground">Drive-Thru · 5.2km · GPS ativo</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Navigation className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-semibold">Peça no caminho — preparo por GPS</span>
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
            <h1 className="font-display font-bold">NOOWE Drive</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <span className="text-6xl">🚗</span>
            <h2 className="font-display text-xl font-bold mt-2">Drive-Thru Inteligente</h2>
            <p className="text-sm text-muted-foreground">Peça agora. Retire na janela. Sem espera.</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-5 text-center">
            <p className="text-sm font-semibold text-primary">Como funciona?</p>
            <div className="mt-3 space-y-2 text-left text-xs text-muted-foreground">
              <p>📱 1. Faça o pedido pelo app</p>
              <p>🛰️ 2. O GPS detecta sua aproximação</p>
              <p>👨‍🍳 3. A cozinha começa a preparar</p>
              <p>🚗 4. Retire na janela — sem espera!</p>
            </div>
          </div>
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <Car className="w-5 h-5" />Pedir Agora
          </button>
        </div>
      );

    case 'menu':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('restaurant')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Menu Drive</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            {[
              { name: 'Combo Classic', desc: 'Burger + Batata G + Refri', price: 42, emoji: '🍔' },
              { name: 'Combo Chicken', desc: 'Chicken + Batata G + Refri', price: 45, emoji: '🍗' },
              { name: 'Combo Kids', desc: 'Mini Burger + Batata P + Suco', price: 32, emoji: '🧒' },
              { name: 'Sundae', desc: 'Chocolate, Morango ou Caramelo', price: 14, emoji: '🍦' },
              { name: 'Café 400ml', desc: 'Espresso ou Latte', price: 12, emoji: '☕' },
            ].map((item, i) => (
              <button key={i} onClick={() => onNavigate('order')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left">
                <span className="text-3xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="font-display font-bold text-sm">R$ {item.price}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'order':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Confirmar Pedido</h1>
            <div className="w-8" />
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🍔</span>
              <div className="flex-1"><p className="font-semibold text-sm">Combo Classic</p><p className="text-xs text-muted-foreground">Burger + Batata G + Refri</p></div>
              <span className="font-bold">R$ 42</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍦</span>
              <div className="flex-1"><p className="font-semibold text-sm">Sundae Chocolate</p></div>
              <span className="font-bold">R$ 14</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between font-display font-bold text-lg"><span>Total</span><span>R$ 56</span></div>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">GPS ativado — o preparo inicia quando você se aproximar</span>
          </div>
          <button onClick={() => { setDistance(5.2); onNavigate('gps-approach'); }} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar e Ir Buscar
          </button>
        </div>
      );

    case 'gps-approach':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-40 h-40 rounded-full bg-blue-500/10 border-4 border-blue-500/30 flex flex-col items-center justify-center mb-5 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            <Navigation className="w-8 h-8 text-primary mb-1" />
            <span className="font-display text-2xl font-bold text-primary">{distance}km</span>
            <span className="text-[10px] text-muted-foreground">até o drive</span>
          </div>
          <h2 className="font-display text-lg font-bold mb-1">Dirigindo até NOOWE Drive</h2>
          <p className="text-xs text-muted-foreground mb-4">A cozinha será notificada quando você estiver a 500m</p>
          <div className="w-full space-y-2">
            {[
              { dist: '5km', label: 'Pedido confirmado', done: true },
              { dist: '2km', label: 'Cozinha alertada', done: distance < 2 },
              { dist: '500m', label: 'Preparo iniciado', done: distance <= 0.5 },
              { dist: '0m', label: 'Pronto para retirar', done: false },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${step.done ? 'bg-success/10 border border-success/20' : 'bg-muted/30 border border-transparent'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? 'bg-success text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {step.done ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`text-xs ${step.done ? 'text-success font-semibold' : 'text-muted-foreground'}`}>{step.dist} — {step.label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'geofence':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center mb-5 animate-pulse">
            <Radio className="w-12 h-12 text-warning" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Geofencing Ativado! 🛰️</h2>
          <p className="text-sm text-muted-foreground mb-2">Você está a 500m do NOOWE Drive</p>
          <p className="text-xs text-primary font-semibold mb-4">👨‍🍳 Cozinha finalizando seu pedido...</p>
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      );

    case 'pickup':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5">
            <Car className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Siga para a Janela 2</h2>
          <p className="text-sm text-muted-foreground mb-4">Seu pedido está pronto e pago!</p>
          <div className="w-full p-5 rounded-2xl bg-card border border-border mb-4">
            <p className="text-xs text-muted-foreground">Código de retirada</p>
            <p className="font-display text-4xl font-bold tracking-widest text-success mt-1">ND-056</p>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Janela 2 · Pista da direita</p>
          <button onClick={() => onNavigate('done')} className="w-full py-4 bg-success text-primary-foreground rounded-xl font-semibold">
            Confirmar Retirada
          </button>
        </div>
      );

    case 'done':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Boa viagem! 🚗</h2>
          <p className="text-sm text-muted-foreground mb-2">Pedido entregue em 1min 48s</p>
          <p className="text-xs text-primary font-semibold mb-4">Sem sair do carro. Sem esperar.</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+8 pontos ganhos!</p><p className="text-xs text-muted-foreground">Visita #12 — próximo sundae grátis</p></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
