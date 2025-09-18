import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { QuerySubscriptionDto } from './dto/query-subscription.dto';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createSubscription(
    createSub: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const user = await this.userRepo.findOne({
      where: { id: createSub.userId },
    });
    if (!user)
      throw new NotFoundException(`User with id ${createSub.userId} not found`);

    const existingActiveSub = await this.subscriptionRepo.findOne({
      where: {
        user: { id: createSub.userId },
        status: SubscriptionStatus.ACTIVE,
      },
    });
    if (existingActiveSub)
      throw new BadRequestException(
        `User with id ${createSub.userId} is already active`,
      );

    const subscription = await this.subscriptionRepo.save({
      name: createSub.name,
      price: createSub.price,
      currency: createSub.currency || 'AR',
      status: createSub.status || SubscriptionStatus.PENDING,
      user: user,
    });

    return subscription;
  }

  async getSubscriptions(page: number, limit: number): Promise<Subscription[]> {
    const skip = (page - 1) * limit;
    const subs = await this.subscriptionRepo.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: skip,
    });

    return subs;
  }

  async findById(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: {
        id: subscriptionId,
      },
      relations: ['user'],
    });
    if (!subscription)
      throw new NotFoundException(
        `Subscription with id ${subscriptionId} wasn't found`,
      );

    return subscription;
  }

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['user'],
    });
  }

  async findAllActive(): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      where: { status: SubscriptionStatus.ACTIVE },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.findById(subscriptionId);

    if (subscription.status === SubscriptionStatus.CANCELLED)
      throw new BadRequestException('Subscription is already cancelled');

    if (subscription.status === SubscriptionStatus.EXPIRED)
      throw new BadRequestException(
        'Imposible to cancel an expired subscription',
      );

    subscription.status = SubscriptionStatus.CANCELLED;

    await this.subscriptionRepo.save(subscription);
    return subscription;
  }

  async activateSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.findById(subscriptionId);
    if (subscription.status === SubscriptionStatus.ACTIVE)
      throw new BadRequestException('Subscription is already active');

    const activeSub = await this.findActiveByUserId(subscription.user.id);
    if (activeSub)
      throw new BadRequestException(
        'The user already has another active subscription',
      );

    subscription.status = SubscriptionStatus.ACTIVE;

    await this.subscriptionRepo.save(subscription);
    return subscription;
  }

  async getSubStats(userId?: string): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    totalRevenue: number;
  }> {
    const queryBuilder =
      this.subscriptionRepo.createQueryBuilder('subscription');

    if (userId) queryBuilder.where('subscription.userId = :userId', { userId });

    const [
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      revenueResult,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('subscription.status = :status', {
          status: SubscriptionStatus.ACTIVE,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('subscription.status = :status', {
          status: SubscriptionStatus.CANCELLED,
        })
        .getCount(),
      queryBuilder
        .clone()
        .select('SUM(subscription.price)', 'total')
        .getRawOne(),
    ]);

    return {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      totalRevenue: parseFloat((revenueResult?.total as string) || '0'),
    };
  }

  async getAllSubStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    totalRevenue: number;
  }> {
    const queryBuilder =
      this.subscriptionRepo.createQueryBuilder('subscription');

    const [
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      revenueResult,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('subscription.status = :status', {
          status: SubscriptionStatus.ACTIVE,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('subscription.status = :status', {
          status: SubscriptionStatus.CANCELLED,
        })
        .getCount(),
      queryBuilder
        .clone()
        .select('SUM(subscription.price)', 'total')
        .getRawOne(),
    ]);

    return {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      totalRevenue: parseFloat((revenueResult?.total as string) || '0'),
    };
  }
}
