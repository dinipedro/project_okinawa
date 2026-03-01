import { MaitreFormatterHelper } from './maitre-formatter.helper';

describe('MaitreFormatterHelper', () => {
  let helper: MaitreFormatterHelper;

  beforeEach(() => {
    helper = new MaitreFormatterHelper();
  });

  describe('filterTodayReservations', () => {
    it('should filter only today reservations', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const reservations = [
        { id: '1', reservation_date: today },
        { id: '2', reservation_date: yesterday },
        { id: '3', reservation_date: tomorrow },
      ];

      const result = helper.filterTodayReservations(reservations);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('formatReservations', () => {
    it('should format reservations correctly', () => {
      const reservations = [
        {
          id: 'res-1',
          user: { full_name: 'John Doe' },
          party_size: 4,
          reservation_time: '19:00',
          status: 'confirmed',
          table_id: 'table-1',
          special_requests: 'Window seat',
        },
      ];

      const result = helper.formatReservations(reservations);

      expect(result).toHaveLength(1);
      expect(result[0].customer_name).toBe('John Doe');
      expect(result[0].party_size).toBe(4);
      expect(result[0].reservation_time).toBe('19:00');
      expect(result[0].special_requests).toBe('Window seat');
    });

    it('should use Guest for missing user name', () => {
      const reservations = [
        { id: 'res-1', party_size: 2, status: 'pending' },
      ];

      const result = helper.formatReservations(reservations);
      expect(result[0].customer_name).toBe('Guest');
    });
  });

  describe('formatTables', () => {
    it('should format tables correctly', () => {
      const tables = [
        {
          id: 'table-1',
          table_number: 'T1',
          seats: 4,
          status: 'available',
          section: 'Patio',
          assigned_waiter_id: 'waiter-1',
        },
      ];
      const waiterMap = new Map([['waiter-1', 'Jane Doe']]);

      const result = helper.formatTables(tables, waiterMap);

      expect(result).toHaveLength(1);
      expect(result[0].table_number).toBe('T1');
      expect(result[0].assigned_waiter).toBe('Jane Doe');
    });

    it('should return null for unassigned tables', () => {
      const tables = [
        { id: 'table-1', table_number: 'T1', seats: 4, status: 'available' },
      ];

      const result = helper.formatTables(tables, new Map());
      expect(result[0].assigned_waiter).toBeNull();
    });
  });

  describe('calculateSummary', () => {
    it('should calculate summary correctly', () => {
      const reservations = [
        { status: 'pending' },
        { status: 'confirmed' },
        { status: 'confirmed' },
        { status: 'seated' },
      ];

      const tables = [
        { status: 'available' },
        { status: 'available' },
        { status: 'occupied' },
        { status: 'reserved' },
        { status: 'cleaning' },
      ];

      const result = helper.calculateSummary(reservations, tables);

      expect(result.total_reservations).toBe(4);
      expect(result.pending_reservations).toBe(1);
      expect(result.confirmed_reservations).toBe(2);
      expect(result.seated_reservations).toBe(1);
      expect(result.available_tables).toBe(2);
      expect(result.occupied_tables).toBe(1);
      expect(result.reserved_tables).toBe(1);
      expect(result.cleaning_tables).toBe(1);
    });
  });

  describe('buildOverview', () => {
    it('should build complete overview', () => {
      const today = new Date();
      const reservations = [
        {
          id: 'res-1',
          reservation_date: today,
          user: { full_name: 'Test User' },
          party_size: 4,
          status: 'confirmed',
        },
      ];

      const tables = [
        {
          id: 'table-1',
          table_number: 'T1',
          seats: 4,
          status: 'available',
          assigned_waiter_id: 'waiter-1',
        },
      ];

      const waiterMap = new Map([['waiter-1', 'Staff Member']]);

      const result = helper.buildOverview(reservations, tables, waiterMap);

      expect(result.reservations).toHaveLength(1);
      expect(result.tables).toHaveLength(1);
      expect(result.summary.total_reservations).toBe(1);
      expect(result.summary.available_tables).toBe(1);
    });
  });
});
