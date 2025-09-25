// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './payments.repository';
import Stripe from 'stripe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notification.module';

const stripeProvider = {
  provide: 'STRIPE',
  useFactory: () => new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil', // o la que uses
  }),
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Subscription, User]),
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository, stripeProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
