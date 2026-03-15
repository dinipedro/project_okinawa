/**
 * Buffet Demo — Sabores Noowe
 * Journey: Check-in → Smart Scale → Weight → Drinks → Payment
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, CreditCard, Gift, QrCode,
  Search, MapPin, Scale, ArrowRight, Utensils, Droplets,
} from 'lucide-react';

type Screen = 'home' | 'restaurant' | 'checkin' | 'buffet-info' | 'scale' | 'drinks' | 'comanda' | 'payment-success';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir buffet', screens: ['home', 'restaurant'] },
  { step: 2, label: 'Check-in digital', screens: ['checkin'] },
  { step: 3, label: 'Informações do buffet', screens: ['buffet-info'] },
  { step: 4, label: 'Balança inteligente', screens: ['scale'] },
  { step: 5, label: 'Adicionar bebidas', screens: ['drinks'] },
  { step: 6, label: 'Comanda & pagamento', screens: ['comanda', 'payment-success'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Encontre buffets por peso ou preço fixo.' },
  'restaurant': { emoji: '🍽️', title: 'Sabores Noowe', desc: 'Buffet self-service com balança inteligente.' },
  'checkin': { emoji: '📱', title: 'Check-in', desc: 'Check-in digital vincula sua comanda automaticamente.' },
  'buffet-info': { emoji: '🍖', title: 'Cardápio do Dia', desc: 'Veja o que está disponível antes de se servir.' },
  'scale': { emoji: '⚖️', title: 'Balança Inteligente', desc: 'QR Code na balança registra o peso automaticamente.' },
  'drinks': { emoji: '🥤', title: 'Bebidas', desc: 'Peça bebidas pelo app — entregam na mesa.' },
  'comanda': { emoji: '📝', title: 'Comanda', desc: 'Veja o total: comida por peso + bebidas.' },
  'payment-success': { emoji: '✅', title: 'Pagamento', desc: 'Pague sem fila no caixa.' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const BuffetDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [weight, setWeight] = useState(0);
  const [weighing, setWeighing] = useState(false);
  const pricePerKg = 79.9;
  const foodTotal = Math.round(weight * pricePerKg / 1000 * 100) / 100;
  const drinkTotal = 18;
  const total = foodTotal + drinkTotal;

  useEffect(() => {
    if (weighing) {
      let w = 0;
      const interval = setInterval(() => {
        w += Math.random() * 50 + 10;
        if (w > 485) { w = 485; clearInterval(interval); setWeighing(false); }
        setWeight(Math.round(w));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [weighing]);

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Bom almoço 🍽️</p>
            <h1 className="font-display text-xl font-bold">Buffet por perto</h1>
          </div>
          <GuidedHint text="Descubra buffets com balança inteligente NOOWE" />
          <button onClick={() => onNavigate('restaurant')} className="w-full text-left mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🍽️</span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold">Sabores Noowe</h3>
                  <p className="text-xs text-muted-foreground">Buffet por Peso · R$ 79,90/kg</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-accent fill-accent" /><span className="text-xs font-semibold">4.4</span>
                    <span className="text-xs text-muted-foreground">· 80+ opções hoje</span>
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
            <h1 className="font-display font-bold">Sabores Noowe</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <span className="text-6xl">🍽️</span>
            <h2 className="font-display text-xl font-bold mt-2">Buffet Self-Service</h2>
            <p className="text-sm text-muted-foreground">Sirva-se à vontade · R$ 79,90/kg</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Opções Hoje', value: '84', emoji: '🍖' },
              { label: 'Preço/kg', value: 'R$ 79,90', emoji: '⚖️' },
              { label: 'Sobremesas', value: '12', emoji: '🍰' },
              { label: 'Ocupação', value: '65%', emoji: '👥' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <span className="text-2xl">{s.emoji}</span>
                <p className="text-sm font-bold mt-1">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <GuidedHint text="Faça check-in para vincular sua comanda digital" />
          <button onClick={() => onNavigate('checkin')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />Check-in Digital
          </button>
        </div>
      );

    case 'checkin':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Check-in realizado!</h2>
          <p className="text-sm text-muted-foreground mb-1">Mesa 12 · Sabores Noowe</p>
          <p className="text-xs text-muted-foreground mb-5">Sua comanda digital está ativa</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <p className="text-xs text-muted-foreground">Código da comanda</p>
            <p className="font-display text-3xl font-bold tracking-widest text-primary mt-1">SN-012</p>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Apresente este código na balança após se servir</p>
          <button onClick={() => onNavigate('buffet-info')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Ver Cardápio do Dia
          </button>
        </div>
      );

    case 'buffet-info':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('checkin')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Cardápio do Dia</h1>
            <div className="w-8" />
          </div>
          {[
            { cat: 'Carnes', items: ['Fraldinha grelhada', 'Frango ao molho', 'Costela BBQ'] },
            { cat: 'Acompanhamentos', items: ['Arroz branco', 'Feijão tropeiro', 'Purê de batata', 'Farofa'] },
            { cat: 'Saladas', items: ['Mix de folhas', 'Tabule', 'Salada grega', 'Beterraba ralada'] },
            { cat: 'Sobremesas', items: ['Pudim', 'Mousse de chocolate', 'Frutas da estação'] },
          ].map((section) => (
            <div key={section.cat} className="mb-4">
              <h3 className="font-semibold text-sm text-primary mb-2">{section.cat}</h3>
              <div className="flex flex-wrap gap-1.5">
                {section.items.map(item => (
                  <span key={item} className="px-3 py-1.5 rounded-full bg-muted text-xs">{item}</span>
                ))}
              </div>
            </div>
          ))}
          <GuidedHint text="Sirva-se e vá à balança com o código da comanda" />
          <button onClick={() => onNavigate('scale')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            <Scale className="w-5 h-5" />Ir para Balança
          </button>
        </div>
      );

    case 'scale':
      return (
        <div className="px-5 pb-4 flex flex-col items-center justify-center h-full text-center">
          <Scale className="w-12 h-12 text-primary mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Balança Inteligente</h2>
          {weight === 0 && !weighing ? (
            <>
              <p className="text-sm text-muted-foreground mb-5">Coloque seu prato na balança e escaneie o QR Code</p>
              <button onClick={() => setWeighing(true)} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">Simular Pesagem</button>
            </>
          ) : weight < 485 ? (
            <>
              <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center mb-4">
                <span className="font-display text-3xl font-bold text-primary">{weight}g</span>
              </div>
              <p className="text-sm text-muted-foreground">Pesando...</p>
            </>
          ) : (
            <>
              <div className="w-32 h-32 rounded-full border-4 border-success bg-success/5 flex flex-col items-center justify-center mb-4">
                <span className="font-display text-3xl font-bold text-success">485g</span>
                <span className="text-xs text-success">✓ Registrado</span>
              </div>
              <div className="w-full p-4 rounded-xl bg-card border border-border mb-4">
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Peso</span><span>485g</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Preço/kg</span><span>R$ 79,90</span></div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold"><span>Comida</span><span className="text-primary">R$ {(485 * 79.9 / 1000).toFixed(2)}</span></div>
              </div>
              <button onClick={() => onNavigate('drinks')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
                Adicionar Bebidas
              </button>
            </>
          )}
        </div>
      );

    case 'drinks':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('scale')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Bebidas</h1>
            <div className="w-8" />
          </div>
          <p className="text-xs text-muted-foreground mb-3">Peça pelo app — entregam na sua mesa</p>
          {[
            { name: 'Suco Natural (500ml)', price: 12, emoji: '🧃' },
            { name: 'Refrigerante Lata', price: 8, emoji: '🥤' },
            { name: 'Água Mineral', price: 6, emoji: '💧' },
            { name: 'Cerveja Artesanal', price: 18, emoji: '🍺' },
          ].map((drink, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card mb-2">
              <span className="text-2xl">{drink.emoji}</span>
              <div className="flex-1"><p className="text-sm font-medium">{drink.name}</p><p className="text-xs text-muted-foreground">R$ {drink.price}</p></div>
              <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => onNavigate('comanda')} className="w-full mt-4 py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Ver Comanda Completa
          </button>
        </div>
      );

    case 'comanda':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('drinks')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Minha Comanda</h1>
            <div className="w-8" />
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Comida (485g)</span><span>R$ {(485 * 79.9 / 1000).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Cerveja Artesanal</span><span>R$ 18,00</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg">
              <span>Total</span><span className="text-primary">R$ {(485 * 79.9 / 1000 + 18).toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => onNavigate('payment-success')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Pagar Sem Fila
          </button>
        </div>
      );

    case 'payment-success':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-xl shadow-success/30">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Bom apetite! 🍽️</h2>
          <p className="text-sm text-muted-foreground mb-4">Pagamento confirmado — sem fila no caixa!</p>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+20 pontos ganhos!</p><p className="text-xs text-muted-foreground">Visita #5 — próxima sobremesa grátis!</p></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
