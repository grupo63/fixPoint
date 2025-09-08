import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  IsOptional,
  IsInt,
  IsIn,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDTO {
  /**
   * Must be a string between 3 and 50 characters
   * @example 'Test User'
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  /**
   * Must be a valid email format with a maximum of 50 characters
   * @example 'test.user@example.com'
   */
  @IsNotEmpty()
  @MaxLength(50)
  @IsEmail()
  email: string;

  /**
   * Must contain at least one lowercase, one uppercase, one number, and one symbol
   * @example 'Password123!'
   */
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña debe tener al menos una minúscula, una mayúscula, un número y un simbolo (@, _, -, !).',
    },
  )
  @MinLength(8)
  @MaxLength(20)
  password: string;


  @IsOptional()
  @IsString()
  @IsIn(['user', 'professional'], { message: 'invalid role' })
  role?: string;
}
