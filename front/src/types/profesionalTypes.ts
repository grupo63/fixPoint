import { Key } from "react";
import { IUser } from "./types";

// export type Professional = {
//   [x: string]: any;
//   name: string;
//   id: string;
//   userId: string;
//   speciality: string;
//   aboutMe?: string | null;
//   longitude?: number | null;
//   latitude?: number | null;
//   workingRadius: number;
//   createdAt: string;
//   location?: string | null;
//   profileImg?: string | null;
//   isActive: boolean;

//   displayName?: string | null;
//   averageRating?: number | null;
//   reviewsCount?: number | null;
// };


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