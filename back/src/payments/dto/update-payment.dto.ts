import { IsString, IsOptional, IsInt, Min } from 'class-validator';
export class RefundPaymentDto {
  @IsString()
  paymentIntentId: string; // pi_...

  @IsOptional() @IsInt() @Min(1)
  amount?: number; // parcial
}