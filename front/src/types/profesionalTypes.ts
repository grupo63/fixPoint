import { Key } from "react";
import { IUser } from "./types";

export type ProfessionalImage = {
  id: string;
  professional_id: string;
  img_url: string;
  description?: string | null;
  is_primary: boolean;
  sort_index: number;
  created_at: string;
};

export type Professional = {
  id: string;
  userId: string;
  speciality: string;
  aboutMe?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  workingRadius: number;
  createdAt: string;
  location?: string | null;
  profileImg?: string | null;
  isActive: boolean;

  averageRating?: number | null;
  reviewsCount?: number | null;

  /** ✅ Relación con la tabla de usuario */
  user: IUser;
};

export type ProfessionalResponse = {
  id: string;
  speciality: string;
  aboutMe: string;
  longitud: number | null;
  latitude: number | null;
  workingRadius: number;
  location: string;
  profileImg: string;
  createdAt: string; // ISO string
  isActive: boolean;
  user: {
    id: string;
    email: string;
    provider: string;
    providerId: string | null;
    role: string;
    firstName: string;
    lastName: string;
    birthDate: string | null;
    phone: string | null;
    address: string;
    city: string | null;
    zipCode: string | null;
    isActive: boolean;
    profileImage: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type ProfessionalUpdate = {
  aboutMe: string;
  speciallity: string;
  location: string;
  working_radius: number;
};
