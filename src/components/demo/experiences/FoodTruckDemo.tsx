/**
 * Food Truck Demo — Taco Noowe
 * Journey: Map Discovery → Live Location → Queue → Order → Notification → Pickup
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, CreditCard, Gift,
  MapPin, Navigation, Timer, ArrowRight, Loader2, Bell, Map,
} from 'lucide-react';

type Screen = 'home' | 'map' | 'truck-detail' | 'queue' | 'menu' | 'order' | 'waiting' | 'ready';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir no mapa', screens: ['home', 'map'] },
  { step: 2, label: 'Ver food truck', screens: ['truck-detail'] },
  { step: 3, label: 'Entrar na fila', screens: ['queue'] },
  { step: 4, label: 'Fazer pedido', screens: ['menu', 'order'] },
  { step: 5, label: 'Aguardar preparo', screens: ['waiting'] },
  { step: 6, label: 'Retirar pedido', screens: ['ready'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Encontre food trucks por perto com localização em tempo real.' },
  'map': { emoji: '🗺️', title: 'Mapa ao Vivo', desc: 'GPS em tempo real mostra onde cada truck está agora.' },
  'truck-detail': { emoji: '🚚', title: 'Taco Noowe', desc: 'Food truck mexicano com fila virtual.' },
  'queue': { emoji: '⏱️', title: 'Fila Virtual', desc: 'Entre na fila pelo app e espere onde quiser.' },
  'menu': { emoji: '📋', title: 'Cardápio', desc: 'Menu do dia com itens sazonais.' },
  'order': { emoji: '🛒', title: 'Pedido', desc: 'Confirme e pague pelo app.' },
  'waiting': { emoji: '👨‍🍳', title: 'Preparando', desc: 'Notificação push quando estiver pronto.' },
  'ready': { emoji: '✅', title: 'Pronto!', desc: 'Retire no truck com seu código.' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const FoodTruckDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [queuePos, setQueuePos] = useState(5);

  useEffect(() => {
    if (screen === 'waiting') {
      const t = setTimeout(() => onNavigate('ready'), 3500);
      return () => clearTimeout(t);
    }
  }, [screen]);

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Com fome? 🚚</p>
            <h1 className="font-display text-xl font-bold">Food Trucks por perto</h1>
          </div>
          <GuidedHint text="Veja no mapa onde estão os food trucks agora" />
          <button onClick={() => onNavigate('map')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow mb-4">
            <Map className="w-5 h-5" />Ver Mapa ao Vivo
          </button>
          {[
            { name: 'Taco Noowe', dist: '800m', cuisine: 'Mexicana', rating: 4.8, emoji: '🌮', active: true },
            { name: 'Burger Bros', dist: '1.5km', cuisine: 'Burgers', rating: 4.5, emoji: '🍔' },
            { name: 'Açaí Tropical', dist: '2.1km', cuisine: 'Açaí', rating: 4.3, emoji: '🫐' },
          ].map((truck, i) => (
            <button key={i} onClick={() => truck.active ? onNavigate('truck-detail') : undefined} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 mb-1 text-left">
              <span className="text-3xl">{truck.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{truck.name}</p>
                <p className="text-xs text-muted-foreground">{truck.cuisine} · {truck.dist}</p>
              </div>
              <div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">{truck.rating}</span></div>
            </button>
          ))}
        </div>
      );

    case 'map':
      return (
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-green-800/10 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-16 h-16 text-primary/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Mapa interativo</p>
            </div>
          </div>
          {/* Truck pins */}
          <div className="absolute top-32 left-16 flex flex-col items-center" onClick={() => onNavigate('truck-detail')}>
            <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg cursor-pointer">🌮 800m</div>
          </div>
          <div className="absolute top-48 right-12 flex flex-col items-center">
            <div className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">🍔 1.5km</div>
          </div>
          <div className="absolute bottom-40 left-24 flex flex-col items-center">
            <div className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">🫐 2.1km</div>
          </div>
          {/* You */}
          <div className="absolute bottom-52 right-20 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 border-4 border-blue-200 shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary-foreground" />
            </div>
            <span className="text-[9px] text-muted-foreground mt-1">Você</span>
          </div>
          <div className="absolute top-2 left-4 right-4">
            <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center shadow"><ArrowLeft className="w-4 h-4" /></button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <button onClick={() => onNavigate('truck-detail')} className="w-full p-4 rounded-2xl bg-background/95 backdrop-blur border border-border shadow-lg flex items-center gap-3">
              <span className="text-2xl">🌮</span>
              <div className="flex-1"><p className="font-semibold text-sm">Taco Noowe</p><p className="text-xs text-muted-foreground">800m · Aberto agora</p></div>
              <ArrowRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      );

    case 'truck-detail':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Taco Noowe</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <span className="text-6xl">🌮</span>
            <h2 className="font-display text-xl font-bold mt-2">Taco Noowe</h2>
            <p className="text-sm text-muted-foreground">Tacos artesanais mexicanos</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-success"><MapPin className="w-3 h-3" />800m — Parque Ibirapuera</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <p className="text-xs font-semibold mb-2">📅 Agenda da Semana</p>
            {['Seg-Qua: Parque Ibirapuera', 'Qui-Sex: Av. Paulista', 'Sáb-Dom: Vila Madalena'].map((loc, i) => (
              <p key={i} className={`text-xs ${i === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{loc}</p>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4">
            <Timer className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning font-semibold">{queuePos} pessoas na fila · ~12 min de espera</span>
          </div>
          <GuidedHint text="Entre na fila virtual e peça pelo app" />
          <button onClick={() => onNavigate('queue')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <Timer className="w-5 h-5" />Entrar na Fila Virtual
          </button>
        </div>
      );

    case 'queue':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('truck-detail')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Fila Virtual</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Posição: {queuePos}º</h2>
            <p className="text-sm text-muted-foreground">Espera estimada: ~12 min</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3 text-center">📲 Você será notificado quando for sua vez</p>
          <GuidedHint text="Enquanto espera, faça seu pedido para agilizar" />
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            Fazer Pedido Antecipado
          </button>
        </div>
      );

    case 'menu':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('queue')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Cardápio</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            {[
              { name: 'Taco al Pastor (3un)', price: 35, emoji: '🌮', popular: true },
              { name: 'Burrito Carne Asada', price: 38, emoji: '🌯' },
              { name: 'Quesadilla Frango', price: 28, emoji: '🧀' },
              { name: 'Nachos Supreme', price: 32, emoji: '🫔' },
              { name: 'Churros (4un)', price: 18, emoji: '🥖' },
              { name: 'Agua Fresca Hibisco', price: 12, emoji: '🌺' },
            ].map((item, i) => (
              <button key={i} onClick={() => onNavigate('order')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    {item.popular && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">Popular</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">R$ {item.price}</p>
                </div>
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
          <div className="p-4 rounded-xl bg-card border border-border mb-4 space-y-3">
            <div className="flex items-center gap-3"><span className="text-2xl">🌮</span><div className="flex-1"><p className="font-semibold text-sm">Taco al Pastor (3un)</p></div><span className="font-bold">R$ 35</span></div>
            <div className="flex items-center gap-3"><span className="text-2xl">🌺</span><div className="flex-1"><p className="font-semibold text-sm">Agua Fresca Hibisco</p></div><span className="font-bold">R$ 12</span></div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between font-display font-bold text-lg"><span>Total</span><span>R$ 47</span></div>
          </div>
          <button onClick={() => onNavigate('waiting')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar R$ 47
          </button>
        </div>
      );

    case 'waiting':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5 animate-pulse">
            <span className="text-4xl">🌮</span>
          </div>
          <h2 className="font-display text-lg font-bold mb-2">Preparando seus tacos...</h2>
          <p className="text-sm text-muted-foreground mb-4">📲 Push notification quando estiver pronto</p>
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      );

    case 'ready':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Pedido Pronto! 🌮</h2>
          <p className="text-sm text-muted-foreground mb-4">Retire no truck — Taco Noowe</p>
          <div className="w-full p-5 rounded-2xl bg-card border border-border mb-4">
            <p className="text-xs text-muted-foreground">Código</p>
            <p className="font-display text-4xl font-bold tracking-widest text-success">TN-023</p>
          </div>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+10 pontos ganhos!</p><p className="text-xs text-muted-foreground">Stamp #4 de 8 para taco grátis</p></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
