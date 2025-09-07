import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsUrl,
  Validate,
} from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { Professional } from 'src/professional/entity/professional.entity';
import { TemporaryRole } from 'src/users/types/temporary-role';
import { MatchPassword } from '../decorators/matchPassword.decorators';

export class CreateUserDto {
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
}

export class LoginUserDto {
  /**
   * Must be a valid email format with a maximum of 50 characters
   * @example 'test.user@example.com'
   */

  @IsNotEmpty({
    message: 'El email es obligatorio.',
  })
  @MaxLength(50)
  @IsEmail()
  email: string;

  /**
   * Must contain at least one lowercase, one uppercase, one number, and one symbol
   * @example 'Password123!'
   */

  @IsNotEmpty({
    message: 'La contraseña es obligatoria.',
  })
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
