import { Injectable, NotImplementedException } from '@nestjs/common';

/**
 * Google Reserve / Reserve with Google adapter.
 * PHASE 2 — implement when restaurant count justifies Google integration.
 *
 * This adapter will handle:
 * 1. Syncing restaurant availability to Google Maps / Search
 * 2. Receiving booking requests from Google Reserve API
 * 3. Confirming/declining bookings back to Google
 * 4. Sending real-time availability updates (slots, waitlist, etc.)
 *
 * Requirements:
 * - Google Maps Platform account with Reserve API enabled
 * - Merchant feed (JSON) for restaurant data
 * - Availability feed endpoint
 * - Booking server (CreateBooking, UpdateBooking, GetBookingStatus)
 *
 * Reference: https://developers.google.com/maps-booking/reference
 *
 * FOR NOW: placeholder. Implement in Phase 2.
 */

export interface GoogleReserveBooking {
  booking_id: string;
  slot_time: Date;
  party_size: number;
  user_name: string;
  user_email: string;
  user_phone: string;
}

export interface GoogleReserveAvailability {
  restaurant_id: string;
  slots: Array<{
    start_time: Date;
    duration_minutes: number;
    max_party_size: number;
    available: boolean;
  }>;
}

@Injectable()
export class GoogleReserveAdapter {
  /**
   * Sync restaurant availability to Google Reserve
   */
  async syncAvailability(
    _restaurantId: string,
  ): Promise<GoogleReserveAvailability> {
    throw new NotImplementedException(
      'Google Reserve adapter will be implemented in Phase 2. Use manual reservation flow.',
    );
  }

  /**
   * Create a booking from Google Reserve
   */
  async createBooking(
    _booking: GoogleReserveBooking,
  ): Promise<{ reservation_id: string; status: string }> {
    throw new NotImplementedException(
      'Google Reserve adapter will be implemented in Phase 2.',
    );
  }

  /**
   * Update a booking status back to Google
   */
  async updateBookingStatus(
    _bookingId: string,
    _status: 'confirmed' | 'cancelled' | 'no_show',
  ): Promise<void> {
    throw new NotImplementedException(
      'Google Reserve adapter will be implemented in Phase 2.',
    );
  }

  /**
   * Get booking status from Google Reserve
   */
  async getBookingStatus(
    _bookingId: string,
  ): Promise<{ status: string }> {
    throw new NotImplementedException(
      'Google Reserve adapter will be implemented in Phase 2.',
    );
  }
}
