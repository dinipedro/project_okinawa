/**
 * Club & Balada Demo — NOOWE Club
 * Journey: Lineup → Buy Ticket → Guest List → VIP Table → Bottle Service → Min Spend Tracker → Close
 */
import React, { useState } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, Plus, CreditCard, Gift, QrCode,
  Users, Timer, ArrowRight, Music, Ticket, Crown, MapPin, UserPlus,
  Share2, Copy, Send, Sparkles, Lock, Eye, Loader2,
} from 'lucide-react';

type Screen = 'home' | 'club-detail' | 'lineup' | 'tickets' | 'guest-list' | 'vip-table' | 'bottle-service' | 'min-spend' | 'close';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir evento', screens: ['home', 'club-detail'] },
  { step: 2, label: 'Ver lineup', screens: ['lineup'] },
  { step: 3, label: 'Comprar ingresso', screens: ['tickets'] },
  { step: 4, label: 'Lista de convidados', screens: ['guest-list'] },
  { step: 5, label: 'Reservar camarote VIP', screens: ['vip-table'] },
  { step: 6, label: 'Bottle service', screens: ['bottle-service'] },
  { step: 7, label: 'Tracker de consumação', screens: ['min-spend'] },
  { step: 8, label: 'Encerramento', screens: ['close'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Eventos', desc: 'Descubra as melhores noites da cidade.' },
  'club-detail': { emoji: '🎵', title: 'NOOWE Club', desc: 'Club com entrada, camarote VIP e fila virtual.' },
  'lineup': { emoji: '🎧', title: 'Lineup', desc: 'DJs e atrações da noite.' },
  'tickets': { emoji: '🎫', title: 'Ingressos', desc: 'Compre antecipado com desconto.' },
  'guest-list': { emoji: '📋', title: 'Guest List', desc: 'Entre na lista de convidados pelo app.' },
  'vip-table': { emoji: '👑', title: 'Camarote VIP', desc: 'Reserve mesa VIP com consumação mínima.' },
  'bottle-service': { emoji: '🍾', title: 'Bottle Service', desc: 'Cardápio de garrafas premium.' },
  'min-spend': { emoji: '📊', title: 'Consumação', desc: 'Tracker em tempo real de consumação mínima.' },
  'close': { emoji: '✅', title: 'Encerramento', desc: 'Noite concluída com pontos e avaliação.' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const ClubDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  const [ticketType, setTicketType] = useState<'pista' | 'vip' | 'open'>('pista');
  const consumed = 1580;
  const minimum = 3000;
  const progress = Math.round((consumed / minimum) * 100);

  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Hoje à noite 🎵</p>
            <h1 className="font-display text-xl font-bold">Eventos & Clubs</h1>
          </div>
          <GuidedHint text="Descubra as melhores festas e compre ingressos pelo app" />
          <button onClick={() => onNavigate('club-detail')} className="w-full text-left mb-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Hoje</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-1">NOOWE Club</h3>
              <p className="text-sm text-muted-foreground mb-2">Tech House Night · DJ Marcos + Special Guest</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />23:00 - 06:00</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Vila Olímpia</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display font-bold">A partir de R$ 60</span>
                <span className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-bold">Lote 2</span>
              </div>
            </div>
          </button>
        </div>
      );

    case 'club-detail':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">NOOWE Club</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-4">
            <span className="text-6xl">🎵</span>
            <h2 className="font-display text-xl font-bold mt-2">Tech House Night</h2>
            <p className="text-sm text-muted-foreground">Sáb, 22 Mar · 23:00</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Lotação', value: '72%', color: 'text-warning' },
              { label: 'Na Fila', value: '45', color: 'text-primary' },
              { label: 'Camarotes', value: '3 livres', color: 'text-success' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 mb-4">
            <button onClick={() => onNavigate('lineup')} className="w-full py-3.5 border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><Music className="w-4 h-4" />Ver Lineup</button>
            <button onClick={() => onNavigate('tickets')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow flex items-center justify-center gap-2"><Ticket className="w-5 h-5" />Comprar Ingresso</button>
            <button onClick={() => onNavigate('vip-table')} className="w-full py-3.5 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-600/20 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><Crown className="w-4 h-4 text-accent" />Reservar Camarote VIP</button>
          </div>
        </div>
      );

    case 'lineup':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('club-detail')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Lineup</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'DJ Marcos', time: '23:00 - 01:00', genre: 'Tech House', headliner: false },
              { name: 'Special Guest', time: '01:00 - 03:00', genre: '???', headliner: true },
              { name: 'DJ Fernanda', time: '03:00 - 05:00', genre: 'Minimal', headliner: false },
              { name: 'Sunset Closing', time: '05:00 - 06:00', genre: 'Chill', headliner: false },
            ].map((dj, i) => (
              <div key={i} className={`p-4 rounded-xl border ${dj.headliner ? 'border-primary bg-gradient-to-r from-primary/10 to-accent/10' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{dj.name}</p>
                      {dj.headliner && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">Headliner</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{dj.genre} · {dj.time}</p>
                  </div>
                  <Music className={`w-5 h-5 ${dj.headliner ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('tickets')} className="w-full mt-5 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
            Comprar Ingresso
          </button>
        </div>
      );

    case 'tickets':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('club-detail')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Ingressos</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-3 mb-5">
            {[
              { id: 'pista' as const, name: 'Pista', price: 60, desc: 'Acesso à pista', original: 80 },
              { id: 'vip' as const, name: 'VIP', price: 120, desc: 'Área VIP + 1 drink', original: 150 },
              { id: 'open' as const, name: 'Open Bar', price: 200, desc: 'Open bar até 03:00', original: 250 },
            ].map(ticket => (
              <button key={ticket.id} onClick={() => setTicketType(ticket.id)} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${ticketType === ticket.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm">{ticket.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs line-through text-muted-foreground">R$ {ticket.original}</span>
                    <span className="font-display font-bold text-primary">R$ {ticket.price}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{ticket.desc}</p>
                {ticket.id === 'pista' && <p className="text-[10px] text-success mt-1">💡 Valor da entrada vira crédito de consumação</p>}
              </button>
            ))}
          </div>
          <button onClick={() => onNavigate('guest-list')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <Ticket className="w-5 h-5" />Comprar · R$ {ticketType === 'pista' ? 60 : ticketType === 'vip' ? 120 : 200}
          </button>
          <button onClick={() => onNavigate('guest-list')} className="w-full mt-2 py-3 border border-border rounded-xl font-semibold text-sm text-muted-foreground">
            Entrar na Guest List (Grátis)
          </button>
        </div>
      );

    case 'guest-list':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('tickets')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Sua Entrada</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3 relative">
              <Ticket className="w-12 h-12 text-primary" />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>
            </div>
            <h2 className="font-display text-xl font-bold">Ingresso Confirmado!</h2>
            <p className="text-sm text-muted-foreground">NOOWE Club · Tech House Night</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border mb-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Código de entrada</p>
            <p className="font-display text-3xl font-bold tracking-widest text-primary">NC-847</p>
            <p className="text-xs text-muted-foreground mt-2">Tipo: Pista · R$ 60 (= R$ 60 crédito consumação)</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">Lotação atual: 72% · Fila: ~15 min</span>
          </div>
          <GuidedHint text="Reserve um camarote VIP para sua turma" />
          <button onClick={() => onNavigate('vip-table')} className="w-full py-4 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-600/20 rounded-xl font-semibold flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-accent" />Reservar Camarote VIP
          </button>
        </div>
      );

    case 'vip-table':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('guest-list')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold flex items-center gap-2"><Crown className="w-4 h-4 text-accent" />Camarotes VIP</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-3 mb-5">
            {[
              { name: 'Camarote Lounge', people: '6-8', min: 'R$ 2.000', deposit: 'R$ 800', avail: true },
              { name: 'Camarote Premium', people: '8-12', min: 'R$ 3.000', deposit: 'R$ 1.200', avail: true },
              { name: 'Camarote Stage', people: '10-15', min: 'R$ 5.000', deposit: 'R$ 2.000', avail: false },
            ].map((table, i) => (
              <button key={i} onClick={() => table.avail ? onNavigate('bottle-service') : undefined} className={`w-full p-4 rounded-xl border-2 text-left ${i === 1 ? 'border-primary bg-primary/10' : table.avail ? 'border-border bg-card' : 'border-border bg-muted/50 opacity-50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm">{table.name}</p>
                  {!table.avail && <span className="text-xs text-destructive font-semibold">Esgotado</span>}
                </div>
                <p className="text-xs text-muted-foreground">{table.people} pessoas · Mínimo {table.min}</p>
                <p className="text-[10px] text-muted-foreground">Depósito: {table.deposit} (convertido em consumação)</p>
              </button>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-muted/30 mb-4">
            <h3 className="font-semibold text-xs mb-2">Convidar para o camarote</h3>
            <div className="flex gap-2">
              {['Você', 'Pedro', 'Camila', '+'].map((name, i) => (
                <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border-2 border-dashed border-border'}`}>
                  {name === '+' ? <UserPlus className="w-4 h-4" /> : name[0]}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'bottle-service':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('vip-table')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">🍾 Bottle Service</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'Absolut Vodka', price: 350, emoji: '🍸' },
              { name: 'Grey Goose', price: 580, emoji: '🍸' },
              { name: 'Moët Chandon', price: 650, emoji: '🍾' },
              { name: 'Johnnie Walker Black', price: 480, emoji: '🥃' },
              { name: 'Balde de Cerveja (6)', price: 120, emoji: '🍺' },
            ].map((bottle, i) => (
              <button key={i} onClick={() => onNavigate('min-spend')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left">
                <span className="text-2xl">{bottle.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{bottle.name}</p>
                  <p className="text-xs text-muted-foreground">Garrafa 750ml</p>
                </div>
                <span className="font-display font-bold text-sm">R$ {bottle.price}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'min-spend':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('bottle-service')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Consumação</h1>
            <div className="w-8" />
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">Mínimo: R$ {minimum.toLocaleString()}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${progress >= 100 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>{progress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Consumido</span><span className="font-semibold">R$ {consumed.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Crédito entradas (3×R$ 60)</span><span className="text-success">-R$ 180</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Depósito camarote</span><span className="text-success">-R$ 1.200</span></div>
              <div className="border-t border-border pt-1 mt-1 flex justify-between font-bold"><span>Faltam</span><span className="text-warning">R$ {(minimum - consumed).toLocaleString()}</span></div>
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-2">Últimos pedidos</h3>
          {[
            { item: 'Grey Goose', who: 'Você', price: 580, time: '01:45' },
            { item: 'Balde Cerveja', who: 'Pedro', price: 120, time: '02:10' },
            { item: 'Gin Tônica (3x)', who: 'Mesa', price: 114, time: '02:30' },
          ].map((order, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border">
              <div className="flex-1"><p className="text-sm font-medium">{order.item}</p><p className="text-xs text-muted-foreground">{order.who} · {order.time}</p></div>
              <span className="text-sm font-semibold">R$ {order.price}</span>
            </div>
          ))}
          <button onClick={() => onNavigate('close')} className="w-full mt-5 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow">
            Fechar Camarote
          </button>
        </div>
      );

    case 'close':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-xl shadow-purple-500/30">
            <Music className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Noite Incrível! 🎵</h2>
          <p className="text-sm text-muted-foreground mb-4">NOOWE Club · Tech House Night</p>
          <div className="w-full p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Camarote Premium</span><span>R$ 3.000</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Consumido</span><span>R$ 3.214</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-success">Créditos aplicados</span><span className="text-success">-R$ 1.380</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold"><span>Total pago</span><span className="text-primary">R$ 1.834</span></div>
          </div>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+150 pontos ganhos!</p><p className="text-xs text-muted-foreground">Acesso VIP garantido no próximo evento</p></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
