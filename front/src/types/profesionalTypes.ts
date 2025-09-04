export type Professional = {
  p_ID: string; // PK uuid
  user_id: string; // FK uuid -> users
  speciality: string; // varchar(50)
  aboutMe?: string | null; // varchar(255)
  longitude?: number | null; // decimal(9,6)
  latitude?: number | null; // decimal(9,6)
  working_radius: number; // int (km)
  createdAt: string; // timestamp ISO
  location?: string | null; // var100 (ciudad/zona)
  profileImg?: string | null; // var255
  isActive: boolean; // boolean

  displayName?: string | null; // nombre público del profesional
  averageRating?: number | null; // 0–5
  reviewsCount?: number | null; // cantidad de reseñas
};

export type ProfessionalImage = {
  id: string;
  professional_id: string;
  img_url: string;
  description?: string | null;
  is_primary: boolean;
  sort_index: number;
  created_at: string; // ISO
};
