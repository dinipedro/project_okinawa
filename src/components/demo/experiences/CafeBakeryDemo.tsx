/**
 * Café & Bakery Demo — Café Noowe
 * Journey: Arrive → QR Scan → Work Mode → Coffee Customize → Order More → Refill → Payment
 */
import React, { useState } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, Minus, CreditCard,
  Wifi, Battery, Plug, Volume2, Coffee, Gift, QrCode, RefreshCw,
  Search, MapPin, Laptop, ArrowRight,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'qr-scan' | 'work-mode' | 'menu' | 'customize' | 'comanda' | 'payment-success';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir café', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Escanear QR da mesa', screens: ['qr-scan'] },
  { step: 3, label: 'Modo trabalho', screens: ['work-mode'] },
  { step: 4, label: 'Personalizar bebida', screens: ['menu', 'customize'] },
  { step: 5, label: 'Comanda & refil', screens: ['comanda'] },
  { step: 6, label: 'Pagamento', screens: ['payment-success'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Encontre cafeterias com Wi-Fi, tomadas e ambiente tranquilo.' },
  'restaurant': { emoji: '☕', title: 'Café Noowe', desc: 'Cafeteria work-friendly com personalização de bebidas.' },
  'qr-scan': { emoji: '📷', title: 'QR da Mesa', desc: 'Escaneie o QR Code da mesa e peça sem sair do lugar.' },
  'work-mode': { emoji: '💻', title: 'Modo Trabalho', desc: 'Informações essenciais: Wi-Fi, tomadas, ruído.' },
  'menu': { emoji: '📋', title: 'Cardápio', desc: 'Cafés especiais, chás, e opções de refil.' },
  'customize': { emoji: '🎨', title: 'Personalização', desc: 'Ajuste leite, temperatura, intensidade e tamanho.' },
  'comanda': { emoji: '📝', title: 'Comanda', desc: 'Peça refils e adicione itens sem sair da mesa.' },
  'payment-success': { emoji: '✅', title: 'Pagamento', desc: 'Pague pelo app quando quiser ir embora.' },
};

const CAFE_MENU = [
  { id: 'c1', name: 'Cappuccino', price: 16, cat: 'Cafés', emoji: '☕', refill: false },
  { id: 'c2', name: 'Café Filtrado', price: 10, cat: 'Cafés', emoji: '☕', refill: true },
  { id: 'c3', name: 'Latte Caramelo', price: 19, cat: 'Cafés', emoji: '🥛', refill: false },
  { id: 'c4', name: 'Chá Verde', price: 12, cat: 'Chás', emoji: '🍵', refill: true },
  { id: 'c5', name: 'Croissant Misto', price: 14, cat: 'Comer', emoji: '🥐', refill: false },
  { id: 'c6', name: 'Pão de Queijo (6un)', price: 12, cat: 'Comer', emoji: '🧀', refill: false },
];

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const CafeBakeryDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [scanned, setScanned] = useState(false);
  const [cart, setCart] = useState<string[]>(['c1', 'c5']);
  const [refillCount, setRefillCount] = useState(0);

  const cartTotal = cart.reduce((s, id) => {
    const item = CAFE_MENU.find(m => m.id === id);
    return s + (item ? item.price : 0);
  }, 0);

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Bom dia ☕</p>
            <h1 className="font-display text-xl font-bold">Encontrar um café</h1>
          </div>
          <GuidedHint text="Encontre o café perfeito para trabalhar ou relaxar" />
          <div className="flex gap-3 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {['Wi-Fi', 'Tomadas', 'Silencioso', 'Pet Friendly'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-700/10 to-orange-800/10 border border-amber-700/20">
              <div className="flex items-center gap-3">
                <span className="text-4xl">☕</span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold">Café Noowe</h3>
                  <p className="text-xs text-muted-foreground">Café & Padaria · R$$ · 200m</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-success" />Wi-Fi</span>
                    <span className="flex items-center gap-1"><Plug className="w-3 h-3 text-success" />Tomadas</span>
                    <span className="flex items-center gap-1"><Volume2 className="w-3 h-3 text-warning" />Moderado</span>
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
            <h1 className="font-display font-bold">Café Noowe</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <span className="text-6xl">☕</span>
            <h2 className="font-display text-xl font-bold mt-2">Café Noowe</h2>
            <p className="text-sm text-muted-foreground">Seu espaço para trabalhar e saborear</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: Wifi, label: 'Wi-Fi\n150Mbps', color: 'text-success' },
              { icon: Plug, label: 'Tomadas\nem todas mesas', color: 'text-success' },
              { icon: Volume2, label: 'Ruído\nModerado', color: 'text-warning' },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <f.icon className={`w-5 h-5 mx-auto mb-1 ${f.color}`} />
                <p className="text-[9px] text-muted-foreground whitespace-pre-line">{f.label}</p>
              </div>
            ))}
          </div>
          <GuidedHint text="Escaneie o QR Code da mesa para pedir do seu lugar" />
          <button onClick={() => onNavigate('qr-scan')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <QrCode className="w-5 h-5" />Escanear QR da Mesa
          </button>
        </div>
      );

    case 'qr-scan':
      return (
        <div className="px-5 pb-4 flex flex-col items-center justify-center h-full text-center">
          {!scanned ? (
            <>
              <div className="w-40 h-40 rounded-3xl border-2 border-primary/30 flex items-center justify-center bg-foreground/5 mb-4 relative">
                <div className="absolute inset-4 border-2 border-primary rounded-2xl" />
                <Coffee className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Aponte para o QR Code da mesa</p>
              <button onClick={() => setScanned(true)} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">Simular Scan</button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4"><Check className="w-8 h-8 text-success" /></div>
              <h2 className="font-display text-xl font-bold mb-2">Mesa 3 · Janela</h2>
              <p className="text-xs text-muted-foreground mb-2">☕ Café Noowe</p>
              <div className="flex items-center gap-2 text-xs text-success mb-5">
                <Plug className="w-3 h-3" /><span>Tomada disponível nesta mesa</span>
              </div>
              <div className="space-y-2 w-full">
                <button onClick={() => onNavigate('work-mode')} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><Laptop className="w-4 h-4" />Modo Trabalho</button>
                <button onClick={() => onNavigate('menu')} className="w-full py-3.5 border border-border rounded-xl font-semibold text-sm">Ver Cardápio</button>
              </div>
            </>
          )}
        </div>
      );

    case 'work-mode':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('qr-scan')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold flex items-center gap-2"><Laptop className="w-4 h-4 text-primary" />Modo Trabalho</h1>
            <div className="w-8" />
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <h3 className="font-semibold text-sm mb-2">📶 Conectar Wi-Fi</h3>
            <div className="p-3 rounded-lg bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">CafeNoowe_Clientes</p>
                <p className="text-xs text-muted-foreground">Senha: noowe2026</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Copiar</button>
            </div>
          </div>
          <div className="space-y-3 mb-5">
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <Wifi className="w-5 h-5 text-success" />
              <div className="flex-1"><p className="text-sm font-medium">Velocidade</p><p className="text-xs text-muted-foreground">Download: 150 Mbps · Upload: 80 Mbps</p></div>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-warning" />
              <div className="flex-1"><p className="text-sm font-medium">Nível de ruído</p><p className="text-xs text-muted-foreground">Moderado — bom para conversas e trabalho</p></div>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <Battery className="w-5 h-5 text-success" />
              <div className="flex-1"><p className="text-sm font-medium">Tomadas</p><p className="text-xs text-muted-foreground">Sua mesa tem 2 tomadas disponíveis</p></div>
            </div>
          </div>
          <GuidedHint text="Peça um café sem sair da sua mesa" />
          <button onClick={() => onNavigate('menu')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-glow">
            <Coffee className="w-5 h-5" />Pedir pelo App
          </button>
        </div>
      );

    case 'menu':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('work-mode')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Cardápio</h1>
            <div className="w-8" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {['Cafés', 'Chás', 'Comer', 'Doces'].map((cat, i) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{cat}</button>
            ))}
          </div>
          <div className="space-y-2">
            {CAFE_MENU.map(item => (
              <button key={item.id} onClick={() => { setCart(prev => [...prev, item.id]); onNavigate('comanda'); }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-left">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    {item.refill && <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-semibold">♻️ Refil</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">R$ {item.price}</p>
                </div>
                <Plus className="w-4 h-4 text-primary" />
              </button>
            ))}
          </div>
        </div>
      );

    case 'customize':
    case 'comanda':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('menu')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Minha Comanda</h1>
            <div className="w-8" />
          </div>
          <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-3 mb-4">
            <span className="text-2xl">☕</span>
            <div><p className="font-semibold text-sm">Café Noowe</p><p className="text-xs text-muted-foreground">Mesa 3 · Janela · Modo Trabalho</p></div>
          </div>
          {cart.map((id, i) => {
            const item = CAFE_MENU.find(m => m.id === id)!;
            return (
              <div key={`${id}-${i}`} className="flex items-center gap-3 py-3 border-b border-border">
                <span className="text-xl">{item.emoji}</span>
                <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">R$ {item.price}</p></div>
              </div>
            );
          })}
          {refillCount > 0 && (
            <div className="flex items-center gap-3 py-3 border-b border-border">
              <RefreshCw className="w-5 h-5 text-success" />
              <div className="flex-1"><p className="text-sm font-medium text-success">Refil x{refillCount}</p><p className="text-xs text-muted-foreground">R$ {refillCount * 5}</p></div>
            </div>
          )}
          <button onClick={() => setRefillCount(prev => prev + 1)} className="w-full mt-4 p-3 rounded-xl border border-dashed border-success flex items-center justify-center gap-2 text-success hover:bg-success/5 transition-colors">
            <RefreshCw className="w-4 h-4" /><span className="text-xs font-semibold">Pedir Refil · R$ 5</span>
          </button>
          <button onClick={() => onNavigate('menu')} className="w-full mt-2 p-3 rounded-xl border border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground">
            <Plus className="w-4 h-4" /><span className="text-xs font-medium">Adicionar mais itens</span>
          </button>
          <div className="mt-4 p-4 rounded-xl bg-muted/30">
            <div className="flex justify-between font-display font-bold text-lg">
              <span>Total</span><span>R$ {cartTotal + refillCount * 5}</span>
            </div>
          </div>
          <button onClick={() => onNavigate('payment-success')} className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Fechar Conta
          </button>
        </div>
      );

    case 'payment-success':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Conta Fechada! ☕</h2>
          <p className="text-sm text-muted-foreground mb-4">Obrigado pela visita — volte sempre!</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">Café #8 de 10!</p><p className="text-xs text-muted-foreground">Mais 2 cafés e o próximo é grátis</p></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
