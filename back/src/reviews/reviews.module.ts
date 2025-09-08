import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), ReservationModule],
  controllers: [ReviewsController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewsModule {}
