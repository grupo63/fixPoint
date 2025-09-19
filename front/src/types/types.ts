import { StaticImport } from "next/dist/shared/lib/get-img-props";

export type Role = "CLIENTE" | "PROFESIONAL" | "ADMIN" | "all";

export type IUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  zipCode?: string | null;
  registrationDate?: string | null;
  profileImg?: string | null;
};

export type MeResponse = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  zipCode?: string | null;
  registrationDate?: string | null;
  profileImg?: string | null;
};

export type User = {
  id: string;
  email: string;
  provider: string;
  providerId: string;
  role: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  zipCode: string;
  isActive: boolean;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  zipCode?: string | null;
  registrationDate?: string | null;
  profileImg?: string | null;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

// Category type (front)
export type Category = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  // Opcional: si tu endpoint incluye servicios dentro de la categoría
  services?: Service[];
};

// Service type (front)
export type Service = {
  id: string;
  title: string;
  description?: string;
  categoryId: string;

  // Relaciones opcionales (sólo si el back las expone con join)
  category?: Category;
  professionalId?: string;
  professional?: Professional;
};

// Professional (sólo lo defino base, ya que aparece en Service)
export type Professional = {
  id: string;
  displayName?: string;
  speciality?: string;
  location?: string;
  aboutMe?: string;
  isActive: boolean;
  workingRadius?: number;
};

// Paginación genérica (coincide con lo que devuelve tu back en /browse/*)
export type Paginated<T> = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
};

export type UserWithProfessional = User & {
  professional?: Professional | null;
};
