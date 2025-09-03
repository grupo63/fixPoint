export type Role = "CLIENTE" | "PROFESIONAL" | "ADMIN";

export interface IUser {
  user_ID: string;
  name: string;
  email: string;
  password: string;
  birthDate: string;
  phone: string;
  address: string;
  city: string;
  zip_code: string;
  role: "CLIENTE" | "PROFESIONAL";
  registration_date: string; // ISO
  profileImg: string;
}

export interface UserProfile {
  user_ID: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  zip_code?: string | null;
  registration_date: string; // ISO
  profileImg?: string | null;
  role?: Role;
}
