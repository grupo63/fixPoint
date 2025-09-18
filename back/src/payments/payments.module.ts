import { Module } from '@nestjs/common';
import Stripe from 'stripe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

const stripeProvider = {
  provide: 'STRIPE',
  useFactory: () =>
    new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
    }),
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [stripeProvider, PaymentRepository, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
