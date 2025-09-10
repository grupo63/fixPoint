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

// export type ProfessionalResponse ={
//   {
//   id: string,
//   speciality: Carpintero,
//   aboutMe: carpineria,
//   longitud: null,
//   latitude: null,
//   workingRadius: 10,
//   location: Buenos AIRES,
//   profileImg: https://tumayorferretero.net/22457-large_default/producto-generico.jpg,
//   createdAt: 2025-09-09T23:14:20.214Z,
//   isActive: true,
//   user: {
//     id: f9845db0-c998-4b09-980c-b0d8d16655e1,
//     email: juan@example.com,
//     provider: local,
//     providerId: null,
//     role: user,
//     firstName: juan,
//     lastName: castillo,
//     birthDate: null,
//     phone: null,
//     address: san martin 2012,
//     city: null,
//     zipCode: null,
//     isActive: true,
//     profileImage: null,
//     createdAt: 2025-09-08T15:02:10.815Z,
//     updatedAt: 2025-09-08T15:02:10.815Z
//   }
// }
// }