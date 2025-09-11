import { forwardRef, Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    forwardRef(() => ReservationModule),
  ],
  controllers: [ReviewsController],
  providers: [ReviewService],
  exports: [ReviewService, TypeOrmModule],
})
export class ReviewsModule {}
