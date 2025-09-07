import {
  IsNotEmpty,
  MaxLength,
  IsEmail,
  MinLength,
  IsStrongPassword,
  IsString,
} from 'class-validator';

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
