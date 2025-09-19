import {
  IsString,
  IsInt,
  IsOptional,
  IsEmail,
  IsUrl,
  IsObject,
  Min,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckoutPaymentDto {
  @ApiProperty({
    description: 'Amount in major units (e.g., 499 = USD 499.00)',
    example: 499,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: "Currency code, e.g. 'usd'", example: 'usd' })
  @IsString()
  currency!: string;

  @ApiProperty({
    description: 'Description shown to the customer',
    example: 'Monthly subscription - PRO Plan',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    description: 'Receipt email',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsEmail()
  receiptEmail?: string;

  @ApiProperty({
    description: 'Success redirect URL',
    example:
      'http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  successUrl!: string;

  @ApiProperty({
    description: 'Cancel redirect URL',
    example: 'http://localhost:5173/checkout/cancel',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  cancelUrl!: string;

  @ApiPropertyOptional({
    description: 'Extra metadata (key→value)',
    example: { orderId: 'ORD-2025-000123', source: 'web' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
export class CreateCheckoutSubscriptionDto {
  @ApiProperty({
    description: 'Stripe price identifier (starts with price_...).',
    example: 'price_1QXyzAbCdEfGhijkLmNo',
  })
  @IsString()
  priceId!: string;

  @ApiPropertyOptional({
    description: 'Number of items for this subscription (default: 1).',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @ApiProperty({
    description:
      'URL where Stripe redirects after successful subscription creation.',
    example:
      'https://myapp.com/subscribe/success?session_id={CHECKOUT_SESSION_ID}',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  successUrl!: string;

  @ApiProperty({
    description:
      'URL where Stripe redirects when the customer cancels the subscription process.',
    example: 'https://myapp.com/subscribe/cancel',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  cancelUrl!: string;

  @ApiPropertyOptional({
    description: 'Number of free trial days before first charge (optional).',
    example: 7,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  trialDays?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata (key → value).',
    example: { plan: 'pro', referral: 'linkedin' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  @ApiPropertyOptional({
    description:
      'Local user ID to associate with the Session/Subscription (optional).',
    example: 'bd0a0a5e-2f0c-4e7e-9a0f-5b5c3c8a9e12',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
