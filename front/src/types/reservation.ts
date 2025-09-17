export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | string;

export interface Reservation {
  reservationId: string;
  status: ReservationStatus;
  wasReviewed: boolean;
  userId: string;
  professionalId: string;
  serviceId: string;      // <- está en el back
  date: string;           // ISO
}

export interface CreateReservationDTO {
  userId: string;         // <- requerido por el back
  professionalId: string;
  serviceId: string;      // <- requerido por el back
  date: string;           // ISO con Z
}

export interface UpdateReservationDTO {
  date?: string;
  status?: ReservationStatus;
}
