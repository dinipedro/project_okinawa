import { Injectable } from '@nestjs/common';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';

export interface RatingDistribution {
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

export interface StaffEfficiency {
  average_order_completion_time: number;
  average_tips_per_staff: number;
  attendance_rate: number;
}

@Injectable()
export class PerformanceMetricsHelper {
  /**
   * Calculate review statistics
   */
  calculateReviewStats(reviews: Review[]): {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistribution;
    sentimentScore: number;
  } {
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingDistribution: RatingDistribution = {
      five_star: reviews.filter((r) => r.rating === 5).length,
      four_star: reviews.filter((r) => r.rating === 4).length,
      three_star: reviews.filter((r) => r.rating === 3).length,
      two_star: reviews.filter((r) => r.rating === 2).length,
      one_star: reviews.filter((r) => r.rating === 1).length,
    };

    // Sentiment score based on ratings (placeholder for AI-based sentiment)
    const sentimentScore =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + (r.rating / 5) * 100, 0) / totalReviews
        : 0;

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
      sentimentScore,
    };
  }

  /**
   * Calculate reservation no-show rate
   */
  calculateNoShowRate(reservations: Reservation[]): number {
    const noShowReservations = reservations.filter(
      (r) => r.status === 'no_show',
    ).length;

    return reservations.length > 0
      ? (noShowReservations / reservations.length) * 100
      : 0;
  }

  /**
   * Calculate average tips per staff
   */
  calculateAverageTipsPerStaff(tips: Tip[]): number {
    const staffTips: Record<string, number> = {};

    tips.forEach((tip) => {
      if (!staffTips[tip.staff_id]) {
        staffTips[tip.staff_id] = 0;
      }
      staffTips[tip.staff_id] += Number(tip.amount);
    });

    const staffCount = Object.keys(staffTips).length;
    if (staffCount === 0) return 0;

    const totalTips = Object.values(staffTips).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    return totalTips / staffCount;
  }

  /**
   * Calculate attendance rate
   */
  calculateAttendanceRate(attendances: Attendance[]): number {
    const presentAttendances = attendances.filter(
      (a) => a.status === 'present' || a.status === 'late',
    ).length;

    return attendances.length > 0
      ? (presentAttendances / attendances.length) * 100
      : 0;
  }

  /**
   * Build staff efficiency metrics
   */
  buildStaffEfficiency(tips: Tip[], attendances: Attendance[]): StaffEfficiency {
    return {
      average_order_completion_time: 0, // Placeholder - would need order tracking
      average_tips_per_staff: this.calculateAverageTipsPerStaff(tips),
      attendance_rate: this.calculateAttendanceRate(attendances),
    };
  }
}
