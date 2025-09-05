import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateProfessionalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  speciality: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  aboutMe: string;

  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  working_radius: number;

  @IsString()
  @MaxLength(100)
  location: string;

  @IsOptional()
  @IsUrl()
  profileImg?: string;
}
