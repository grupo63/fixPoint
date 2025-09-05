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
  @IsOptional()
  @MaxLength(255)
  aboutMe?: string;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsNumber()
  working_radius: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  location: string;

  @IsOptional()
  @IsUrl()
  profileImg?: string;
}
