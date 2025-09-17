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

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsUUID()
  userd: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  currency?: string = 'AR';

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus = SubscriptionStatus.PENDING;
}
