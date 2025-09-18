import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'User ID who owns the subscription',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Name of the subscription',
    example: 'Premium Plan',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Price of the subscription',
    example: 29.99,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @ApiProperty({
    description: 'Currency of the subscription',
    example: 'AR',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  currency?: string = 'AR';

  @ApiProperty({
    description: 'Status of the subscription',
    example: SubscriptionStatus.PENDING,
    enum: SubscriptionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus = SubscriptionStatus.PENDING;
}
