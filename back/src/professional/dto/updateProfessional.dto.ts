import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfessionalDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  speciallity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  aboutMe?: string;

  @IsOptional()
  @IsNumber()
  longitude?: number;
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  working_radius?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;
}
