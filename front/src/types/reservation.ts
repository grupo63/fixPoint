export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | string;

// src/types/reservations.ts
export type Reservation = {
  id: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  clientId: string;
  client?: {               // si el back lo manda, lo usamos directo
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImg?: string | null;
    profileImage?: string | null;
    avatar?: string | null;
  } | null;
};


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
