export class PublicProfessionalDto {
  id: string;
  speciality: string;
  aboutMe: string;
  longitud: number;
  latitude: number;
  workingRadius: number;
  location: string;
  profileImg: string;

  services: ServiceDto[];
  profImage: ProfessionalImageDto[];
  reviews: ReviewDto[];
}
