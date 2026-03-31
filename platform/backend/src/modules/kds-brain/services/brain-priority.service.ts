import { Injectable, Logger } from '@nestjs/common';
import { KdsPriority } from '../dto/station-queue.dto';

export interface PriorityInput {
  fire_at?: Date | null;
  expected_ready_at?: Date | null;
  created_at: Date;
  estimated_prep_minutes?: number;
  delivery_rider_eta?: Date | null;
  status: string;
}

@Injectable()
export class BrainPriorityService {
  private readonly logger = new Logger(BrainPriorityService.name);

  /**
   * Calculate priority level for a KDS item.
   *
   * Ratio = elapsed_since_fire / estimated_prep_minutes
   *   ratio < 0.5  -> queued
   *   0.5 - 0.9    -> normal
   *   0.9 - 1.2    -> high
   *   > 1.2        -> urgent
   *
   * Delivery boost: if rider ETA is within 5 minutes and priority < high, bump to high.
   */
  calculatePriority(item: PriorityInput): KdsPriority {
    const now = new Date();
    const fireAt = item.fire_at ? new Date(item.fire_at) : new Date(item.created_at);
    const prepMinutes = item.estimated_prep_minutes || 10;

    const elapsedMs = now.getTime() - fireAt.getTime();
    const elapsedMinutes = elapsedMs / (1000 * 60);
    const ratio = elapsedMinutes / prepMinutes;

    let priority: KdsPriority;

    if (ratio < 0.5) {
      priority = 'queued';
    } else if (ratio < 0.9) {
      priority = 'normal';
    } else if (ratio < 1.2) {
      priority = 'high';
    } else {
      priority = 'urgent';
    }

    // Delivery boost: if rider ETA is within 5 minutes, bump to at least 'high'
    if (item.delivery_rider_eta) {
      const riderEta = new Date(item.delivery_rider_eta);
      const minutesUntilRider = (riderEta.getTime() - now.getTime()) / (1000 * 60);

      if (minutesUntilRider <= 5 && (priority === 'queued' || priority === 'normal')) {
        priority = 'high';
      }
    }

    return priority;
  }

  /**
   * Calculate countdown in minutes for a KDS item.
   *
   * Returns positive number = minutes remaining.
   * Returns negative number = minutes late.
   *
   * Uses expected_ready_at if available, otherwise fire_at + prep_minutes,
   * otherwise created_at + prep_minutes.
   */
  calculateCountdown(item: PriorityInput): number {
    const now = new Date();
    let targetTime: Date;

    if (item.expected_ready_at) {
      targetTime = new Date(item.expected_ready_at);
    } else {
      const baseTime = item.fire_at ? new Date(item.fire_at) : new Date(item.created_at);
      const prepMinutes = item.estimated_prep_minutes || 10;
      targetTime = new Date(baseTime.getTime() + prepMinutes * 60 * 1000);
    }

    const diffMs = targetTime.getTime() - now.getTime();
    return Math.round(diffMs / (1000 * 60));
  }
}
