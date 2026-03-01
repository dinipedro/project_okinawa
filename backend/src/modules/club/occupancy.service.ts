import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ClubCheckInOut } from './entities';

@Injectable()
export class OccupancyService {
  constructor(
    @InjectRepository(ClubCheckInOut)
    private checkInOutRepository: Repository<ClubCheckInOut>,
  ) {}

  /**
   * Get current occupancy for a venue
   */
  async getCurrentOccupancy(restaurantId: string): Promise<number> {
    // Count check-ins without check-outs for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.checkInOutRepository.count({
      where: {
        restaurant_id: restaurantId,
        check_out_at: IsNull(),
      },
    });

    return count;
  }

  /**
   * Get occupancy level based on capacity
   */
  async getOccupancyLevel(
    restaurantId: string,
    capacityLimit: number,
    levels: Array<{ threshold_percentage: number; label: string; color: string }>,
  ): Promise<{ current: number; percentage: number; level: string; color: string }> {
    const current = await this.getCurrentOccupancy(restaurantId);
    const percentage = capacityLimit > 0 ? Math.round((current / capacityLimit) * 100) : 0;

    // Find the appropriate level
    const sortedLevels = [...levels].sort((a, b) => b.threshold_percentage - a.threshold_percentage);
    const level = sortedLevels.find(l => percentage >= l.threshold_percentage) || {
      label: 'Livre',
      color: 'green',
    };

    return {
      current,
      percentage: Math.min(100, percentage),
      level: level.label,
      color: level.color,
    };
  }

  /**
   * Get occupancy history for a date
   */
  async getOccupancyHistory(restaurantId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const checkIns = await this.checkInOutRepository
      .createQueryBuilder('cio')
      .select("date_trunc('hour', cio.check_in_at)", 'hour')
      .addSelect('COUNT(*)', 'check_ins')
      .where('cio.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('cio.check_in_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .groupBy("date_trunc('hour', cio.check_in_at)")
      .orderBy('hour', 'ASC')
      .getRawMany();

    const checkOuts = await this.checkInOutRepository
      .createQueryBuilder('cio')
      .select("date_trunc('hour', cio.check_out_at)", 'hour')
      .addSelect('COUNT(*)', 'check_outs')
      .where('cio.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('cio.check_out_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .groupBy("date_trunc('hour', cio.check_out_at)")
      .orderBy('hour', 'ASC')
      .getRawMany();

    // Merge check-ins and check-outs into hourly stats
    const hourlyStats: Record<string, { check_ins: number; check_outs: number }> = {};

    for (const ci of checkIns) {
      const hourKey = ci.hour;
      hourlyStats[hourKey] = { check_ins: Number(ci.check_ins), check_outs: 0 };
    }

    for (const co of checkOuts) {
      const hourKey = co.hour;
      if (hourlyStats[hourKey]) {
        hourlyStats[hourKey].check_outs = Number(co.check_outs);
      } else {
        hourlyStats[hourKey] = { check_ins: 0, check_outs: Number(co.check_outs) };
      }
    }

    return Object.entries(hourlyStats)
      .map(([hour, stats]) => ({
        hour,
        ...stats,
        net: stats.check_ins - stats.check_outs,
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  /**
   * Check if venue is at capacity
   */
  async isAtCapacity(restaurantId: string, capacityLimit: number): Promise<boolean> {
    const current = await this.getCurrentOccupancy(restaurantId);
    return current >= capacityLimit;
  }
}
