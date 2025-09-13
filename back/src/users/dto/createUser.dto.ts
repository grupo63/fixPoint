import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsStrongPassword,
  IsEnum,
} from 'class-validator';
import { TemporaryRole } from '../types/temporary-role';

export class CreateUserDto {
  /** @example 'Juan' */
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  firstName: string;

  /** @example 'Perez' */
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastName: string;

  /** @example 'test.user@example.com' */
  @IsNotEmpty()
  @MaxLength(50)
  @IsEmail()
  email: string;

  /** Debe tener minúscula, mayúscula, número y símbolo */
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

  @IsOptional()
  @IsEnum(TemporaryRole, { message: 'invalid role' })
  role?: TemporaryRole;
}
