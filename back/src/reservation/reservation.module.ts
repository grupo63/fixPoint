import { forwardRef, Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationRepository } from './reservation.repository';
import { User } from 'src/users/entities/user.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { AvailableModule } from 'src/available/available.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, User, Professional]),
    forwardRef(() => ReviewsModule),
    AvailableModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository],
  exports: [ReservationService],
})
export class ReservationModule {}
