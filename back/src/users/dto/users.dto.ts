import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty({
    description: 'User full name',
    example: 'Juan Perez',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: 'User email adress',
    example: 'juanperez@gmail.com',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  email?: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 8,
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?])[A-Za-z\d!@#$%^&*?]+$/,
    {
      message: 'Contraseña debil',
    },
  )
  @MinLength(8)
  @MaxLength(20)
  password?: string;

  @ApiProperty({
    description: 'User phone number',
    example: 123456789,
    required: false,
  })
  @IsOptional()
  @IsInt()
  phone?: number;

  @ApiProperty({
    description: 'User adress',
    example: 'Los tarcos 200',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  address?: string;

  @ApiProperty({
    description: 'City where the user lives',
    example: 'Chubut',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiProperty({
    description: 'User zip code',
    example: '4400',
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  zipCode?: string;

  @ApiProperty({
    description: 'URL of the user profile image',
    example: 'http://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profileImage?: string;
}
