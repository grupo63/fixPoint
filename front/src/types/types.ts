import { StaticImport } from "next/dist/shared/lib/get-img-props";

export type Role = "CLIENTE" | "PROFESIONAL" | "ADMIN";


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
