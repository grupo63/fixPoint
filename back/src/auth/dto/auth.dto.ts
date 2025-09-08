import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Must be a string between 3 and 50 characters',
    example: 'Test User',
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Must be a valid email format with a maximum of 50 characters',
    example: 'test.user@example.com',
    maxLength: 50,
  })
  @IsNotEmpty()
  @MaxLength(50)
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Must contain at least one lowercase, one uppercase, one number, and one symbol',
    example: 'Password123!',
    minLength: 8,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsStrongPassword(
    { minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    {
      message:
        'La contraseña debe tener al menos una minúscula, una mayúscula, un número y un simbolo (@, _, -, !).',
    },
  )
  @MinLength(8)
  @MaxLength(20)
  password: string;
}

export class LoginUserDto {
  @ApiProperty({
    description: 'Must be a valid email format with a maximum of 50 characters',
    example: 'test.user@example.com',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'El email es obligatorio.' })
  @MaxLength(50)
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Must contain at least one lowercase, one uppercase, one number, and one symbol',
    example: 'Password123!',
    minLength: 8,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword(
    { minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    {
      message:
        'La contraseña debe tener al menos una minúscula, una mayúscula, un número y un símbolo (@, _, -, !).',
    },
  )
  password: string;
}
