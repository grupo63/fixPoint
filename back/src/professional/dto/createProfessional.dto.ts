import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateProfessionalDto {
  @ApiProperty({
    description: 'Professional specialty',
    example: 'Plumber',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  speciality: string;

  @ApiProperty({
    description: 'Short description about the professional',
    example:
      'Certified plumber with over 10 years of experience in residential and commercial plumbing.',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  aboutMe?: string;

  @ApiProperty({
    description: 'Longitude of the professional’s location',
    example: -58.3816,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Latitude of the professional’s location',
    example: -34.6037,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Working radius in kilometers',
    example: 20,
  })
  @IsNumber()
  working_radius: number;

  @ApiProperty({
    description: 'City or region where the professional is based',
    example: 'Buenos Aires',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  location: string;

  @ApiProperty({
    description: 'Profile image URL of the professional',
    example: 'https://example.com/images/professional123.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  profileImg?: string;
}
