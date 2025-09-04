// front/src/types/types.ts
export type Role = "CLIENTE" | "PROFESIONAL" | "ADMIN";

export interface IUser {
  userId: string;
  name: string;
  email: string;
  password: string;
  birthDate: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  role: Role;                 // ⬅️ antes decía "CLIENTE" | "PROFESIONAL"
  registrationDate: string;
  profileImg: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  zipCode?: string | null;
  registrationDate: string;
  profileImg?: string | null;
  role?: Role;
}
