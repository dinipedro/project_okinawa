import { PerformanceMetricsHelper } from './performance-metrics.helper';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';

describe('PerformanceMetricsHelper', () => {
  let helper: PerformanceMetricsHelper;

  beforeEach(() => {
    helper = new PerformanceMetricsHelper();
  });

  describe('calculateReviewStats', () => {
    const createMockReview = (rating: number): Review =>
      ({ id: `review-${Math.random()}`, rating } as Review);

    it('should calculate review stats correctly', () => {
      const reviews = [
        createMockReview(5),
        createMockReview(5),
        createMockReview(4),
        createMockReview(3),
        createMockReview(1),
      ];

      const result = helper.calculateReviewStats(reviews);

      expect(result.totalReviews).toBe(5);
      expect(result.averageRating).toBe(3.6);
      expect(result.ratingDistribution.five_star).toBe(2);
      expect(result.ratingDistribution.four_star).toBe(1);
      expect(result.ratingDistribution.three_star).toBe(1);
      expect(result.ratingDistribution.two_star).toBe(0);
      expect(result.ratingDistribution.one_star).toBe(1);
    });

    it('should handle empty reviews', () => {
      const result = helper.calculateReviewStats([]);

      expect(result.totalReviews).toBe(0);
      expect(result.averageRating).toBe(0);
      expect(result.sentimentScore).toBe(0);
    });

    it('should calculate sentiment score correctly', () => {
      const reviews = [
        createMockReview(5),
        createMockReview(5),
      ];

      const result = helper.calculateReviewStats(reviews);
      expect(result.sentimentScore).toBe(100);
    });
  });

  describe('calculateNoShowRate', () => {
    const createMockReservation = (status: string): Reservation =>
      ({ id: `res-${Math.random()}`, status } as Reservation);

    it('should calculate no-show rate correctly', () => {
      const reservations = [
        createMockReservation('confirmed'),
        createMockReservation('confirmed'),
        createMockReservation('no_show'),
        createMockReservation('completed'),
      ];

      const result = helper.calculateNoShowRate(reservations);
      expect(result).toBe(25);
    });

    it('should return 0 for empty reservations', () => {
      expect(helper.calculateNoShowRate([])).toBe(0);
    });

    it('should return 0 when no no-shows', () => {
      const reservations = [
        createMockReservation('confirmed'),
        createMockReservation('completed'),
      ];

      expect(helper.calculateNoShowRate(reservations)).toBe(0);
    });
  });

  describe('calculateAverageTipsPerStaff', () => {
    const createMockTip = (staffId: string, amount: number): Tip =>
      ({ id: `tip-${Math.random()}`, staff_id: staffId, amount } as Tip);

    it('should calculate average tips per staff', () => {
      const tips = [
        createMockTip('staff-1', 10),
        createMockTip('staff-1', 20),
        createMockTip('staff-2', 15),
        createMockTip('staff-2', 25),
      ];

      const result = helper.calculateAverageTipsPerStaff(tips);
      expect(result).toBe(35); // (30 + 40) / 2
    });

    it('should return 0 for empty tips', () => {
      expect(helper.calculateAverageTipsPerStaff([])).toBe(0);
    });
  });

  describe('calculateAttendanceRate', () => {
    const createMockAttendance = (status: string): Attendance =>
      ({ id: `att-${Math.random()}`, status } as Attendance);

    it('should calculate attendance rate correctly', () => {
      const attendances = [
        createMockAttendance('present'),
        createMockAttendance('present'),
        createMockAttendance('late'),
        createMockAttendance('absent'),
      ];

      const result = helper.calculateAttendanceRate(attendances);
      expect(result).toBe(75);
    });

    it('should return 0 for empty attendances', () => {
      expect(helper.calculateAttendanceRate([])).toBe(0);
    });
  });

  describe('buildStaffEfficiency', () => {
    it('should build staff efficiency metrics', () => {
      const tips = [{ staff_id: 'staff-1', amount: 50 }] as Tip[];
      const attendances = [
        { status: 'present' },
        { status: 'present' },
      ] as Attendance[];

      const result = helper.buildStaffEfficiency(tips, attendances);

      expect(result.average_order_completion_time).toBe(0);
      expect(result.average_tips_per_staff).toBe(50);
      expect(result.attendance_rate).toBe(100);
    });
  });
});
