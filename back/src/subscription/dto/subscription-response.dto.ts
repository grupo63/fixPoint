import { Expose, Type } from 'class-transformer';
import { SubscriptionStatus } from '../entities/subscription.entity';

export class UserBasicInfoDto {
  @Expose()
  userId: string;

  @Expose()
  email: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;
}

export class SubscriptionResponseDto {
  @Expose()
  subscriptionId: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  currency: string;

  @Expose()
  status: SubscriptionStatus;

  @Expose()
  startDate: Date;

  @Expose()
  @Type(() => UserBasicInfoDto)
  user?: UserBasicInfoDto;
}
