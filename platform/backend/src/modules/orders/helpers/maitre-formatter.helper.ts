import { Injectable } from '@nestjs/common';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';

export interface MaitreReservation {
  id: string;
  customer_name: string;
  party_size: number;
  reservation_time: string;
  status: string;
  table_id: string | null;
  special_requests: string | null;
}

export interface MaitreTable {
  id: string;
  table_number: string;
  seats: number;
  status: string;
  section: string | null;
  assigned_waiter: string | null;
}

export interface MaitreSummary {
  total_reservations: number;
  pending_reservations: number;
  confirmed_reservations: number;
  seated_reservations: number;
  available_tables: number;
  occupied_tables: number;
  reserved_tables: number;
  cleaning_tables: number;
}

export interface MaitreOverview {
  reservations: MaitreReservation[];
  tables: MaitreTable[];
  summary: MaitreSummary;
}

@Injectable()
export class MaitreFormatterHelper {
  /**
   * Filter reservations to today only
   */
  filterTodayReservations<T extends { reservation_date: Date }>(
    reservations: T[],
  ): T[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return reservations.filter((r) => {
      const reservationDate = new Date(r.reservation_date);
      return reservationDate >= today && reservationDate < tomorrow;
    });
  }

  /**
   * Format reservations for maitre overview
   */
  formatReservations(
    reservations: any[],
  ): MaitreReservation[] {
    return reservations.map((r) => ({
      id: r.id,
      customer_name: r.user?.full_name || 'Guest',
      party_size: r.party_size,
      reservation_time: r.reservation_time,
      status: r.status,
      table_id: r.table_id,
      special_requests: r.special_requests,
    }));
  }

  /**
   * Format tables for maitre overview
   */
  formatTables(
    tables: any[],
    waiterMap: Map<string, string>,
  ): MaitreTable[] {
    return tables.map((t) => ({
      id: t.id,
      table_number: t.table_number,
      seats: t.seats,
      status: t.status,
      section: t.section,
      assigned_waiter: t.assigned_waiter_id
        ? waiterMap.get(t.assigned_waiter_id) || 'Staff'
        : null,
    }));
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(reservations: any[], tables: any[]): MaitreSummary {
    return {
      total_reservations: reservations.length,
      pending_reservations: reservations.filter((r) => r.status === 'pending').length,
      confirmed_reservations: reservations.filter((r) => r.status === 'confirmed').length,
      seated_reservations: reservations.filter((r) => r.status === 'seated').length,
      available_tables: tables.filter((t) => t.status === 'available').length,
      occupied_tables: tables.filter((t) => t.status === 'occupied').length,
      reserved_tables: tables.filter((t) => t.status === 'reserved').length,
      cleaning_tables: tables.filter((t) => t.status === 'cleaning').length,
    };
  }

  /**
   * Build complete maitre overview
   */
  buildOverview(
    reservations: any[],
    tables: any[],
    waiterMap: Map<string, string>,
  ): MaitreOverview {
    const todayReservations = this.filterTodayReservations(reservations);

    return {
      reservations: this.formatReservations(todayReservations),
      tables: this.formatTables(tables, waiterMap),
      summary: this.calculateSummary(todayReservations, tables),
    };
  }
}
