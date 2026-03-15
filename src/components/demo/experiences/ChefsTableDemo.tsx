/**
 * Chef's Table Demo — Mesa do Chef Noowe
 * Journey: Exclusive Reservation → Preferences → Experience Day → Course by Course → Photo & Review
 */
import React, { useState, useEffect } from 'react';
import { GuidedHint } from '../DemoShared';
import {
  ArrowLeft, Check, Star, Clock, CreditCard, Gift, Calendar,
  Crown, ChefHat, Wine, Camera, ArrowRight, Sparkles, Heart,
  Users, Lock, MessageCircle,
} from 'lucide-react';

type Screen = 'home' | 'detail' | 'reservation' | 'preferences' | 'day-of' | 'course-1' | 'course-2' | 'course-3' | 'finale';

export const JOURNEY_STEPS = [
  { step: 1, label: 'Descobrir experiência', screens: ['home', 'detail'] },
  { step: 2, label: 'Reserva exclusiva', screens: ['reservation'] },
  { step: 3, label: 'Questionário de preferências', screens: ['preferences'] },
  { step: 4, label: 'Dia da experiência', screens: ['day-of'] },
  { step: 5, label: 'Cursos do menu', screens: ['course-1', 'course-2', 'course-3'] },
  { step: 6, label: 'Encerramento', screens: ['finale'] },
];

export const SCREEN_INFO: Record<Screen, { emoji: string; title: string; desc: string }> = {
  'home': { emoji: '🏠', title: 'Descoberta', desc: 'Experiências gastronômicas exclusivas com poucos lugares.' },
  'detail': { emoji: '👨‍🍳', title: 'Mesa do Chef', desc: 'Jantar exclusivo para 8 pessoas com o Chef Ricardo.' },
  'reservation': { emoji: '📅', title: 'Reserva', desc: 'Pré-pagamento obrigatório com lugares limitados.' },
  'preferences': { emoji: '📝', title: 'Preferências', desc: 'Questionário de alergias, restrições e preferências.' },
  'day-of': { emoji: '🎉', title: 'Dia da Experiência', desc: 'Recepção com champagne e apresentação do menu.' },
  'course-1': { emoji: '🍽️', title: '1º Curso', desc: 'Amuse-bouche com história contada pelo chef.' },
  'course-2': { emoji: '🍷', title: '2º Curso', desc: 'Prato principal com harmonização do sommelier.' },
  'course-3': { emoji: '🍰', title: '3º Curso', desc: 'Sobremesa e encerramento da experiência.' },
  'finale': { emoji: '📸', title: 'Encerramento', desc: 'Foto com o chef, menu assinado e avaliação.' },
};

interface Props { onNavigate: (s: Screen) => void; screen: Screen; }

export const ChefsTableDemo: React.FC<Props> = ({ onNavigate, screen }) => {
  switch (screen) {
    case 'home':
      return (
        <div className="px-5 pb-4">
          <div className="pt-2 pb-4">
            <p className="text-sm text-muted-foreground">Experiências ✨</p>
            <h1 className="font-display text-xl font-bold">Chef's Table</h1>
          </div>
          <GuidedHint text="Descubra experiências gastronômicas exclusivas" />
          <button onClick={() => onNavigate('detail')} className="w-full text-left mb-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-800/20 to-stone-700/20 border border-zinc-600/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-accent" />
                <span className="text-xs text-accent font-bold uppercase tracking-wider">Exclusivo</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-1">Mesa do Chef Noowe</h3>
              <p className="text-sm text-muted-foreground mb-2">Chef Ricardo Oliveira · 7 cursos · Harmonização completa</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />8 lugares</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />3h</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" />4.9</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">R$ 680/pessoa</span>
                <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-bold">3 vagas restantes</span>
              </div>
            </div>
          </button>
        </div>
      );

    case 'detail':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('home')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Mesa do Chef</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold">Chef Ricardo Oliveira</h2>
            <p className="text-sm text-muted-foreground">2 estrelas Michelin · São Paulo</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <h3 className="font-semibold text-sm mb-3">O que esperar</h3>
            {[
              '🍽️ 7 cursos de degustação',
              '🍷 Harmonização completa de vinhos',
              '👨‍🍳 Interação direta com o chef',
              '📜 Menu personalizado de lembrança',
              '📸 Foto com o chef',
              '⏱️ Duração: ~3 horas',
            ].map((item, i) => (
              <p key={i} className="text-xs text-muted-foreground py-1">{item}</p>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4">
            <Lock className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning font-semibold">Apenas 3 vagas para Sáb, 22 Mar</span>
          </div>
          <GuidedHint text="Reserve sua vaga nesta experiência exclusiva" />
          <button onClick={() => onNavigate('reservation')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Crown className="w-5 h-5" />Reservar · R$ 680/pessoa
          </button>
        </div>
      );

    case 'reservation':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('detail')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Reservar</h1>
            <div className="w-8" />
          </div>
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-sm font-semibold mb-2 block">Data</label>
              <div className="flex gap-2">
                {['Sáb 22', 'Sáb 29', 'Sáb 5 Abr'].map((d, i) => (
                  <button key={d} className={`flex-1 py-3 rounded-xl text-xs font-medium border ${i === 0 ? 'border-primary bg-primary/10 text-primary' : i === 2 ? 'border-border text-muted-foreground/40 line-through' : 'border-border text-muted-foreground'}`}>
                    {d}
                    {i === 2 && <p className="text-[9px]">Esgotado</p>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Convidados</label>
              <div className="flex gap-2">
                {[1, 2].map((n, i) => (
                  <button key={n} className={`flex-1 py-3 rounded-xl text-sm font-medium border ${i === 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{n} {n === 1 ? 'pessoa' : 'pessoas'}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">2 × R$ 680</span><span>R$ 1.360</span></div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Harmonização incluída</span><span className="text-success">✓ Sim</span></div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold text-lg"><span>Total</span><span className="text-primary">R$ 1.360</span></div>
          </div>
          <button onClick={() => onNavigate('preferences')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />Confirmar & Pagar
          </button>
        </div>
      );

    case 'preferences':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('reservation')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Suas Preferências</h1>
            <div className="w-8" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">O chef personalizará a experiência com base nas suas respostas</p>
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-sm font-semibold mb-2 block">Restrições alimentares</label>
              <div className="flex flex-wrap gap-2">
                {['Nenhuma', 'Vegetariano', 'Sem glúten', 'Sem lactose', 'Alergia a frutos do mar'].map((p, i) => (
                  <button key={p} className={`px-3 py-2 rounded-xl text-xs font-medium border ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Preferência de vinho</label>
              <div className="flex flex-wrap gap-2">
                {['Tinto', 'Branco', 'Espumante', 'Sem álcool'].map((p, i) => (
                  <button key={p} className={`px-3 py-2 rounded-xl text-xs font-medium border ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Ocasião especial?</label>
              <div className="flex flex-wrap gap-2">
                {['Sem ocasião', 'Aniversário', 'Proposta', 'Negócios'].map((p, i) => (
                  <button key={p} className={`px-3 py-2 rounded-xl text-xs font-medium border ${i === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-success/10 border border-success/20 mb-4">
            <p className="text-xs text-success font-semibold flex items-center gap-2"><Check className="w-4 h-4" />Reserva confirmada para Sáb, 22 Mar · 20:00</p>
          </div>
          <button onClick={() => onNavigate('day-of')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold">
            Salvar Preferências
          </button>
        </div>
      );

    case 'day-of':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('preferences')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="font-display font-bold">Experiência</h1>
            <div className="w-8" />
          </div>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Bem-vindo à Mesa do Chef</h2>
            <p className="text-sm text-muted-foreground">Sáb, 22 Mar · 20:00</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 mb-4">
            <h3 className="font-semibold text-sm mb-2">Menu de Hoje — 7 Cursos</h3>
            {[
              '1. Amuse-Bouche · Tartar de Vieira',
              '2. Entrada · Carpaccio de Atum Trufado',
              '3. Sopa · Creme de Abóbora com Foie Gras',
              '4. Peixe · Robalo em Crosta de Ervas',
              '5. Carne · Wagyu A5 com Aspargos',
              '6. Queijos · Seleção Francesa',
              '7. Sobremesa · Soufflé de Chocolate 70%',
            ].map((course, i) => (
              <p key={i} className="text-xs text-muted-foreground py-0.5">{course}</p>
            ))}
          </div>
          <GuidedHint text="O chef apresentará cada curso pessoalmente" />
          <button onClick={() => onNavigate('course-1')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Iniciar Experiência <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'course-1':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('day-of')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <span className="text-xs text-muted-foreground font-medium">Curso 1 de 7</span>
            <div className="w-8" />
          </div>
          <div className="h-1.5 bg-muted rounded-full mb-5"><div className="h-full bg-primary rounded-full" style={{ width: '14%' }} /></div>
          <div className="text-center mb-4">
            <span className="text-5xl mb-3 block">🍽️</span>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Amuse-Bouche</p>
            <h2 className="font-display text-xl font-bold">Tartar de Vieira</h2>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Chef Ricardo</p>
                <p className="text-xs text-muted-foreground italic">"Este prato é inspirado nas vieiras frescas da costa catarinense. A combinação com yuzu e microgreens cria um contraste cítrico que prepara o paladar para a jornada."</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-4 flex items-center gap-3">
            <Wine className="w-5 h-5 text-accent" />
            <div><p className="text-xs font-semibold">Harmonização</p><p className="text-xs text-muted-foreground">Champagne Brut · Veuve Clicquot</p></div>
          </div>
          <button onClick={() => onNavigate('course-2')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Próximo Curso <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'course-2':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('course-1')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <span className="text-xs text-muted-foreground font-medium">Curso 5 de 7</span>
            <div className="w-8" />
          </div>
          <div className="h-1.5 bg-muted rounded-full mb-5"><div className="h-full bg-primary rounded-full" style={{ width: '71%' }} /></div>
          <div className="text-center mb-4">
            <span className="text-5xl mb-3 block">🥩</span>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Prato Principal</p>
            <h2 className="font-display text-xl font-bold">Wagyu A5 com Aspargos</h2>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Chef Ricardo</p>
                <p className="text-xs text-muted-foreground italic">"O Wagyu A5 de Miyazaki é o corte mais marmorizado do mundo. Preparamos na brasa de carvão binchotan para preservar a textura e os sucos naturais."</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-4 flex items-center gap-3">
            <Wine className="w-5 h-5 text-accent" />
            <div><p className="text-xs font-semibold">Harmonização</p><p className="text-xs text-muted-foreground">Barolo DOCG 2018 · Piemonte, Itália</p></div>
          </div>
          <button onClick={() => onNavigate('course-3')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
            Próximo Curso <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case 'course-3':
      return (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => onNavigate('course-2')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
            <span className="text-xs text-muted-foreground font-medium">Curso 7 de 7</span>
            <div className="w-8" />
          </div>
          <div className="h-1.5 bg-muted rounded-full mb-5"><div className="h-full bg-primary rounded-full" style={{ width: '100%' }} /></div>
          <div className="text-center mb-4">
            <span className="text-5xl mb-3 block">🍰</span>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Gran Finale</p>
            <h2 className="font-display text-xl font-bold">Soufflé de Chocolate 70%</h2>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border mb-4">
            <div className="flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground italic">"O grand finale: chocolate 70% de cacau belga, servido com sorvete de baunilha de Madagascar. Cada soufflé é preparado individualmente."</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mb-4 flex items-center gap-3">
            <Wine className="w-5 h-5 text-accent" />
            <div><p className="text-xs font-semibold">Harmonização</p><p className="text-xs text-muted-foreground">Porto Vintage 2017 · Douro, Portugal</p></div>
          </div>
          <button onClick={() => onNavigate('finale')} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold shadow-glow flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />Encerramento
          </button>
        </div>
      );

    case 'finale':
      return (
        <div className="flex flex-col items-center justify-center h-full px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Experiência Completa! ✨</h2>
          <p className="text-sm text-muted-foreground mb-4">7 cursos · 3h · Uma noite inesquecível</p>
          <div className="w-full space-y-3 mb-4">
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <Camera className="w-5 h-5 text-primary" /><span className="text-sm">📸 Foto com Chef Ricardo</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary" /><span className="text-sm">📜 Menu assinado digital</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <Crown className="w-5 h-5 text-accent" /><span className="text-sm">🎖️ Certificado da experiência</span>
            </div>
          </div>
          <div className="flex gap-2 mb-5">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Star className={`w-5 h-5 text-accent fill-accent`} />
              </button>
            ))}
          </div>
          <div className="w-full p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 flex items-center gap-3">
            <Gift className="w-5 h-5 text-primary" />
            <div className="text-left"><p className="text-sm font-semibold">+200 pontos ganhos!</p><p className="text-xs text-muted-foreground">Acesso VIP a próximas experiências</p></div>
          </div>
          <button onClick={() => onNavigate('home')} className="w-full py-3 border border-border rounded-xl font-semibold text-sm">Voltar ao Início</button>
        </div>
      );

    default: return null;
  }
};
