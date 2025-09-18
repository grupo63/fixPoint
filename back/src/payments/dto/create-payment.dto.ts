import { IsInt, Min, IsString, IsOptional, IsEmail, IsIn, IsUUID } from 'class-validator';


const ALLOWED_CURRENCIES = ['usd','eur','ars','brl','mxn']; // ampliá si hace falta
export class CreatePaymentIntentDto {
  @IsInt() @Min(1)
  amount: number;           // centavos

  @IsString()
  @IsIn(ALLOWED_CURRENCIES, { message: 'currency inválida (usa: ' + ALLOWED_CURRENCIES.join(', ') + ')' })
  currency: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEmail()
  receiptEmail?: string;

  @IsOptional() @IsUUID()
  subscriptionId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

