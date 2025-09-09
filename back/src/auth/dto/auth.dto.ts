import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
  IsNotEmpty,
  MaxLength,
  IsStrongPassword,
  IsEnum, // 👈 importa IsIn
} from 'class-validator';
import { TemporaryRole } from 'src/users/types/temporary-role';

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
      'Must be a strong password between 8 and 20 characters, una mayúscula, una minúscula, un número y un símbolo',
    example: 'StrongP@ssw0rd',
    maxLength: 50,
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

  // 👇 Acepta el campo para que el ValidationPipe no lo rechace
  @IsOptional()
  // @IsIn(['user', 'professional'], { message: 'invalid role' })
  // role?: 'user' | 'professional';
  @IsEnum(['user', 'professional'], { message: 'invalid role' })
  role?: TemporaryRole;
}

export class LoginUserDto {
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
      'Must be a strong password between 8 and 20 characters, una mayúscula, una minúscula, un número y un símbolo',
    example: 'StrongP@ssw0rd',
    maxLength: 50,
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
