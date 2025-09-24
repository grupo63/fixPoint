import { forwardRef, Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationRepository } from './reservation.repository';
import { User } from 'src/users/entities/user.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { AvailableModule } from 'src/available/available.module';
import { NotificationsModule } from 'src/notifications/notification.module';
import { ReservationService } from './reservation.service';
import { AuthModule } from 'src/auth/auth.module'; // 👈 Importa tu módulo de auth

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, User, Professional]),
    forwardRef(() => ReviewsModule),
    AvailableModule,
    NotificationsModule,
    AuthModule, // 👈 añade esto para que funcione AuthGuard('jwt')
  ],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository],
  exports: [ReservationService],
})
export class ReservationModule {}
