import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { reservationStatus, Review } from './entities/review.entity';

@Injectable()
export class reviewService {
  [x: string]: any;
  constructor() {}

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    const reservation = await this.reservationsService.getReservationById(
      createReviewDto.reservationId,
    );
    if (reservation !== reservationStatus.COMPLETED) {
      throw new BadRequestException(
        'A review can only be created for a completed reservation.',
      );
    }
    const newReview: Review = await this.createReviewEntity(createReviewDto);
    return newReview;
  }
  async getReviewaByPorofessional(professionalId: string): Promise<Review[]> {
    return await this.reviewsRepository.findByProfessionalId(professionalId);
  }
}
