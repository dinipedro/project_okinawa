import React from 'react';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface OccupancyIndicatorProps {
  percentage: number;
  capacity?: number;
  currentCount?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function OccupancyIndicator({
  percentage,
  capacity,
  currentCount,
  showLabel = true,
  size = 'md',
}: OccupancyIndicatorProps) {
  const getOccupancyInfo = (pct: number) => {
    if (pct < 30) {
      return {
        label: 'Tranquilo',
        color: 'bg-success',
        textColor: 'text-success',
        icon: TrendingDown,
        description: 'Pouco movimento',
      };
    }
    if (pct < 60) {
      return {
        label: 'Moderado',
        color: 'bg-info',
        textColor: 'text-info',
        icon: Minus,
        description: 'Movimento normal',
      };
    }
    if (pct < 85) {
      return {
        label: 'Animado',
        color: 'bg-warning',
        textColor: 'text-warning',
        icon: TrendingUp,
        description: 'Bastante movimento',
      };
    }
    return {
      label: 'Lotado',
      color: 'bg-destructive',
      textColor: 'text-destructive',
      icon: TrendingUp,
      description: 'Capacidade máxima',
    };
  };

  const info = getOccupancyInfo(percentage);
  const Icon = info.icon;

  const sizeClasses = {
    sm: {
      container: 'p-2',
      bar: 'h-1.5',
      text: 'text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'p-3',
      bar: 'h-2',
      text: 'text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'p-4',
      bar: 'h-3',
      text: 'text-base',
      icon: 'w-5 h-5',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`rounded-xl bg-card border border-border ${classes.container}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className={`${classes.icon} text-muted-foreground`} />
            <span className={`${classes.text} text-muted-foreground`}>Lotação</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon className={`${classes.icon} ${info.textColor}`} />
            <span className={`${classes.text} font-semibold ${info.textColor}`}>
              {info.label}
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className={`rounded-full bg-muted overflow-hidden ${classes.bar}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${info.color}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {/* Details */}
      <div className="flex items-center justify-between mt-2">
        <span className={`${classes.text} text-muted-foreground`}>
          {percentage}% ocupado
        </span>
        {capacity && currentCount !== undefined && (
          <span className={`${classes.text} text-muted-foreground`}>
            {currentCount}/{capacity}
          </span>
        )}
      </div>
    </div>
  );
}

// Compact badge version for headers
export function OccupancyBadge({ percentage }: { percentage: number }) {
  const getColor = (pct: number) => {
    if (pct < 30) return 'bg-success/20 text-success';
    if (pct < 60) return 'bg-info/20 text-info';
    if (pct < 85) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  const getLabel = (pct: number) => {
    if (pct < 30) return 'Tranquilo';
    if (pct < 60) return 'Moderado';
    if (pct < 85) return 'Animado';
    return 'Lotado';
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${getColor(
        percentage
      )}`}
    >
      <Users className="w-3 h-3" />
      {getLabel(percentage)}
    </span>
  );
}
