import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AskDto {
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  message!: string;

  @IsOptional()
  @IsIn(['auto', 'es', 'en'])
  lang?: 'auto' | 'es' | 'en' = 'auto';
}