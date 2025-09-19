import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Stripe PaymentIntent ID (pi_...)',
    example: 'pi_3S977vFomeILf1I40I92ZV3w',
  })
  @IsString()
  paymentIntentId!: string; // pi_...

  @ApiPropertyOptional({
    description:
      'Refund amount in major units (e.g., 200 = USD 200.00). Omit for full refund.',
    example: 200,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount?: number; // en dólares (no centavos)
}
