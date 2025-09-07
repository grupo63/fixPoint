import { Module } from '@nestjs/common';
import { reviewService } from './reviews.service';

@Module({
  controllers: [],
  providers: [reviewService],
})
export class ReviewsModule {}
