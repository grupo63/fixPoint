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
  IsStrongPassword,
  IsISO31661Alpha2,
} from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty({
    description: 'User first name',
    example: 'Juan',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Perez',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastName?: string;

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

  @IsOptional()
  @IsStrongPassword(
    { minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    {
      message:
        'La contraseña debe tener al menos una minúscula, una mayúscula, un número y un simbolo (@, _, -, !).',
    },
  )
  @MinLength(8)
  @MaxLength(20)
  password?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '123456789',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, { message: 'El teléfono debe contener solo dígitos' })
  phone?: string;

  @ApiProperty({
    description: 'User country (ISO Alpha-2 code)',
    example: 'AR',
    required: false,
  })
  @IsOptional()
  @IsISO31661Alpha2()
  country?: string;

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
