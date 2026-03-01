import React, { useState, useEffect } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import {
  ArrowLeft,
  Users,
  Clock,
  Trophy,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Bell,
  MapPin,
  RefreshCw,
} from 'lucide-react';

// Queue data
const queueData = {
  userEntry: {
    id: 'qe-001',
    position: 12,
    partySize: 3,
    priority: 'guest_list',
    estimatedWaitMinutes: 25,
    joinedAt: new Date(Date.now() - 15 * 60 * 1000),
    status: 'waiting',
  },
  stats: {
    totalInQueue: 47,
    averageWait: 35,
    priorityAhead: 4,
  },
  venue: {
    name: 'Club Okinawa',
    currentOccupancy: 78, // percentage
    occupancyLabel: 'Animado',
  },
};

const priorityLevels = [
  { id: 'vip', name: 'VIP', color: 'bg-amber-500', multiplier: 0.3 },
  { id: 'guest_list', name: 'Lista', color: 'bg-primary', multiplier: 0.5 },
  { id: 'advance', name: 'Antecipado', color: 'bg-secondary', multiplier: 0.7 },
  { id: 'general', name: 'Geral', color: 'bg-muted', multiplier: 1.0 },
];

export function QueueScreen() {
  const { goBack, navigate } = useMobilePreview();
  const [position, setPosition] = useState(queueData.userEntry.position);
  const [estimatedWait, setEstimatedWait] = useState(queueData.userEntry.estimatedWaitMinutes);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate position updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (position > 1) {
        setPosition((p) => Math.max(1, p - 1));
        setEstimatedWait((w) => Math.max(2, w - 2));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [position]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 50) return 'bg-success';
    if (percentage < 80) return 'bg-warning';
    return 'bg-destructive';
  };

  const getPriorityInfo = (priorityId: string) => {
    return priorityLevels.find((p) => p.id === priorityId) || priorityLevels[3];
  };

  const priority = getPriorityInfo(queueData.userEntry.priority);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-background/50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Fila Virtual</h1>
            <p className="text-xs text-muted-foreground">{queueData.venue.name}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2.5 rounded-full bg-background/50 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Occupancy Indicator */}
        <div className="px-4 pb-4">
          <div className="p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Lotação Atual</span>
              <span className="font-semibold text-foreground">
                {queueData.venue.currentOccupancy}% - {queueData.venue.occupancyLabel}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getOccupancyColor(
                  queueData.venue.currentOccupancy
                )}`}
                style={{ width: `${queueData.venue.currentOccupancy}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Position Card */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border border-primary/30 mb-4">
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground ${priority.color}`}
            >
              {priority.name}
            </span>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-1">Sua Posição</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-6xl font-bold text-foreground">{position}</span>
              <span className="text-2xl text-muted-foreground">º</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-background/50">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Tempo estimado</p>
              <p className="font-bold text-foreground">~{estimatedWait} min</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-background/50">
              <Users className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Seu grupo</p>
              <p className="font-bold text-foreground">{queueData.userEntry.partySize} pessoas</p>
            </div>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground">Na fila</p>
            <p className="font-bold text-foreground">{queueData.stats.totalInQueue}</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground">Média</p>
            <p className="font-bold text-foreground">{queueData.stats.averageWait} min</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground">Prioridade</p>
            <p className="font-bold text-foreground">{queueData.stats.priorityAhead}</p>
          </div>
        </div>

        {/* Priority Legend */}
        <div className="p-4 rounded-xl bg-card border border-border mb-4">
          <h3 className="font-semibold text-foreground mb-3">Níveis de Prioridade</h3>
          <div className="space-y-2">
            {priorityLevels.map((level) => (
              <div key={level.id} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${level.color}`} />
                <span className="text-sm text-foreground flex-1">{level.name}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(level.multiplier * 100)}% do tempo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">Dica</p>
              <p className="text-sm text-muted-foreground">
                Fique atento às notificações! Você terá 5 minutos para se apresentar
                quando for chamado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('home')}
            className="flex-1 py-3 rounded-xl bg-destructive/10 text-destructive font-semibold"
          >
            Sair da Fila
          </button>
          <button className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações On
          </button>
        </div>
      </div>
    </div>
  );
}
