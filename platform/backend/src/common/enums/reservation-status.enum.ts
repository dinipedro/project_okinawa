export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SEATED = 'seated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'Pendente',
  [ReservationStatus.CONFIRMED]: 'Confirmada',
  [ReservationStatus.SEATED]: 'Cliente sentado',
  [ReservationStatus.COMPLETED]: 'Concluída',
  [ReservationStatus.CANCELLED]: 'Cancelada',
  [ReservationStatus.NO_SHOW]: 'Não compareceu',
};
