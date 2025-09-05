import { Key } from "react";

export type Professional = {
  
  pId: string;
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

  displayName?: string | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
};


export type ProfessionalImage = {
  id: string;
  professional_id: string;
  img_url: string;
  description?: string | null;
  is_primary: boolean;
  sort_index: number;
  created_at: string;
};
