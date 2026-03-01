import React from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import {
  ArrowLeft,
  Music,
  Clock,
  Star,
  Instagram,
  ExternalLink,
  Calendar,
} from 'lucide-react';

// Lineup data
const lineupData = {
  event: {
    name: 'Friday Night Party',
    date: 'Sexta, 31 Jan 2025',
    venue: 'Club Okinawa',
  },
  slots: [
    {
      id: 'ls1',
      artistName: 'DJ Warm Up',
      artistType: 'resident_dj',
      photo: 'https://images.unsplash.com/photo-1571266028243-d220c6a31fe4?w=100&h=100&fit=crop',
      startTime: '23:00',
      endTime: '00:30',
      stage: 'Main Stage',
      genre: 'House',
      isHeadliner: false,
      instagram: '@djwarmup',
    },
    {
      id: 'ls2',
      artistName: 'DJ Snake',
      artistType: 'guest_dj',
      photo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      startTime: '00:30',
      endTime: '02:30',
      stage: 'Main Stage',
      genre: 'EDM / Trap',
      isHeadliner: true,
      instagram: '@djsnake',
    },
    {
      id: 'ls3',
      artistName: 'The Night Crew',
      artistType: 'live_band',
      photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop',
      startTime: '02:30',
      endTime: '04:00',
      stage: 'Main Stage',
      genre: 'House / Tech House',
      isHeadliner: false,
      instagram: '@thenightcrew',
    },
    {
      id: 'ls4',
      artistName: 'MC Flow',
      artistType: 'mc',
      photo: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=100&h=100&fit=crop',
      startTime: '00:00',
      endTime: '04:00',
      stage: 'Main Stage',
      genre: 'Hip Hop / R&B',
      isHeadliner: false,
      instagram: '@mcflow',
    },
  ],
};

const artistTypeLabels: Record<string, { label: string; color: string }> = {
  resident_dj: { label: 'DJ Residente', color: 'bg-secondary' },
  guest_dj: { label: 'DJ Convidado', color: 'bg-primary' },
  live_band: { label: 'Live Act', color: 'bg-accent' },
  mc: { label: 'MC', color: 'bg-muted' },
  performance: { label: 'Performance', color: 'bg-muted' },
};

export function LineupScreen() {
  const { goBack } = useMobilePreview();

  // Sort by start time, headliner first
  const sortedSlots = [...lineupData.slots].sort((a, b) => {
    if (a.isHeadliner && !b.isHeadliner) return -1;
    if (!a.isHeadliner && b.isHeadliner) return 1;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-background/50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Lineup</h1>
            <p className="text-xs text-muted-foreground">{lineupData.event.venue}</p>
          </div>
          <div className="p-2 rounded-full bg-primary/10">
            <Music className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Event Info */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{lineupData.event.date}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Headliner */}
        {sortedSlots.filter((s) => s.isHeadliner).map((slot) => (
          <div
            key={slot.id}
            className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border border-primary/30 mb-4"
          >
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-semibold">
                <Star className="w-3 h-3" />
                HEADLINER
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={slot.photo}
                alt={slot.artistName}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div>
                <p className="text-2xl font-bold text-foreground">{slot.artistName}</p>
                <p className="text-sm text-muted-foreground">{slot.genre}</p>
                <div className="flex items-center gap-1 mt-1 text-primary">
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm">{slot.instagram}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{slot.startTime} - {slot.endTime}</span>
              </div>
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                {slot.stage}
              </span>
            </div>
          </div>
        ))}

        {/* Other Artists */}
        <h2 className="font-semibold text-foreground mb-3">Todas as Atrações</h2>
        <div className="space-y-3">
          {sortedSlots.map((slot) => {
            const typeInfo = artistTypeLabels[slot.artistType] || artistTypeLabels.performance;

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-xl bg-card border ${
                  slot.isHeadliner ? 'border-primary/30' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={slot.photo}
                    alt={slot.artistName}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">{slot.artistName}</p>
                      {slot.isHeadliner && (
                        <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{slot.genre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground ${typeInfo.color}`}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{slot.startTime}</p>
                    <p className="text-xs text-muted-foreground">{slot.stage}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Share */}
        <button className="w-full mt-4 p-4 rounded-xl bg-muted flex items-center justify-center gap-2 text-foreground">
          <ExternalLink className="w-4 h-4" />
          <span className="font-medium">Compartilhar Lineup</span>
        </button>
      </div>
    </div>
  );
}
