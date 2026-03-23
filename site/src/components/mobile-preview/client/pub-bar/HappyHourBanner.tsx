import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Tag,
  ChevronRight,
  Beer,
  Wine,
  Coffee,
} from 'lucide-react';

interface HappyHourBannerProps {
  name: string;
  discount: string;
  endsAt: string;
  discountType: 'percentage' | 'bogo' | 'fixed';
  discountValue: number;
  appliesTo: string[];
  onViewDetails?: () => void;
}

export function HappyHourBanner({
  name,
  discount,
  endsAt,
  discountType,
  discountValue,
  appliesTo,
  onViewDetails,
}: HappyHourBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const [hours, minutes] = endsAt.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes, 0, 0);

      if (endTime < now) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const diff = endTime.getTime() - now.getTime();
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hoursLeft > 0) {
        setTimeRemaining(`${hoursLeft}h ${minutesLeft}min`);
      } else {
        setTimeRemaining(`${minutesLeft}min`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const getDiscountDisplay = () => {
    switch (discountType) {
      case 'percentage':
        return `${discountValue}% OFF`;
      case 'bogo':
        return 'LEVE 2 PAGUE 1';
      case 'fixed':
        return `R$ ${discountValue.toFixed(2)} OFF`;
      default:
        return discount;
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('cerveja') || category.toLowerCase().includes('chop')) {
      return Beer;
    }
    if (category.toLowerCase().includes('vinho') || category.toLowerCase().includes('drink')) {
      return Wine;
    }
    return Coffee;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-primary/20 border border-amber-500/30">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 text-xs font-semibold">
                ATIVO
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Termina em {timeRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* Discount Display */}
        <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gradient-primary">
                {getDiscountDisplay()}
              </p>
              <p className="text-xs text-muted-foreground">{discount}</p>
            </div>
          </div>
        </div>

        {/* Applicable Categories */}
        <div className="flex flex-wrap gap-2 mb-3">
          {appliesTo.map((category, index) => {
            const Icon = getCategoryIcon(category);
            return (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium text-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-amber-500" />
                {category}
              </span>
            );
          })}
        </div>

        {/* View Details */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center gap-2 text-amber-600 font-medium text-sm transition-colors"
          >
            Ver Itens em Promoção
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Compact version for list views
export function HappyHourBadge({ discount, endsAt }: { discount: string; endsAt: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
      <Sparkles className="w-3 h-3 text-amber-500" />
      <span className="text-xs font-semibold text-amber-600">{discount}</span>
      <span className="text-xs text-muted-foreground">• até {endsAt}</span>
    </div>
  );
}
