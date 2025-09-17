import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';

export class QuerySubscriptionDto {
  @IsOptional()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsDateString()
  startedDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateFrom?: string;
}
