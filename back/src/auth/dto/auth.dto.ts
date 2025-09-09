import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn, // 👈 importa IsIn
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  // 👇 Acepta el campo para que el ValidationPipe no lo rechace
  @IsOptional()
  @IsIn(['user', 'professional'], { message: 'invalid role' })
  role?: 'user' | 'professional';
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}