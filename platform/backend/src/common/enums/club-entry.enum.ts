/**
 * Club entry purchase type
 */
export enum ClubEntryPurchaseType {
  ADVANCE = 'advance',
  DOOR = 'door',
  GUEST_LIST = 'guest_list',
  BIRTHDAY = 'birthday',
  TABLE_INCLUDED = 'table_included',
}

/**
 * Club entry status
 */
export enum ClubEntryStatus {
  ACTIVE = 'active',
  USED = 'used',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * VIP table reservation status
 */
export enum VipTableReservationStatus {
  PENDING_CONFIRMATION = 'pending_confirmation',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  COMPLETED = 'completed',
}

/**
 * VIP table guest status
 */
export enum VipTableGuestStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  CHECKED_IN = 'checked_in',
}

/**
 * Queue entry status for virtual queue
 */
export enum QueueEntryStatus {
  WAITING = 'waiting',
  CALLED = 'called',
  ENTERED = 'entered',
  LEFT = 'left',
  NO_SHOW = 'no_show',
}

/**
 * Guest list status
 */
export enum GuestListStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
}

/**
 * Artist type for lineup
 */
export enum ArtistType {
  RESIDENT_DJ = 'resident_dj',
  GUEST_DJ = 'guest_dj',
  LIVE_BAND = 'live_band',
  MC = 'mc',
  PERFORMANCE = 'performance',
}

/**
 * Day of week for schedules
 */
export enum DayOfWeek {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}

/**
 * Cover charge schedule type
 */
export enum CoverChargeScheduleType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

/**
 * Happy hour discount type
 */
export enum HappyHourDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  BOGO = 'bogo', // Buy One Get One
}

/**
 * Happy hour applies to
 */
export enum HappyHourAppliesTo {
  ALL = 'all',
  CATEGORIES = 'categories',
  ITEMS = 'items',
}
