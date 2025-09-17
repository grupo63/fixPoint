import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfessionalDto {
  @ApiPropertyOptional({
    description: 'Professional specialty',
    example: 'Electrician',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  speciality?: string;

  @ApiPropertyOptional({
    description: 'Short description about the professional',
    example:
      'Experienced electrician specialized in residential wiring and installations.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  aboutMe?: string;

  @ApiPropertyOptional({
    description: 'Longitude of the professional’s location',
    example: -58.3816,
  })
  @IsOptional()
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional({
    description: 'Latitude of the professional’s location',
    example: -34.6037,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Working radius in kilometers',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  workingRadius?: number;

  @ApiPropertyOptional({
    description: 'City or region where the professional is based',
    example: 'Rosario',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;
}
