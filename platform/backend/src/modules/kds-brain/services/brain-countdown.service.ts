import { Injectable } from '@nestjs/common';
import { BrainPriorityService, PriorityInput } from './brain-priority.service';

export interface CountdownDisplay {
  /** Minutes remaining (positive) or late (negative) */
  minutes: number;
  /** Human-readable label, e.g. "3 min" or "-2 min" */
  label: string;
  /** Whether the item is past due */
  is_late: boolean;
}

/**
 * Thin wrapper around BrainPriorityService for countdown display formatting.
 */
@Injectable()
export class BrainCountdownService {
  constructor(private readonly priorityService: BrainPriorityService) {}

  /**
   * Get countdown display data for a KDS item.
   */
  getCountdownDisplay(item: PriorityInput): CountdownDisplay {
    const minutes = this.priorityService.calculateCountdown(item);
    const isLate = minutes < 0;

    return {
      minutes,
      label: isLate ? `${minutes} min` : `${minutes} min`,
      is_late: isLate,
    };
  }
}
