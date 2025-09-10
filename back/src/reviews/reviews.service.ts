import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationService } from 'src/reservation/reservation.service';
import { ReviewDto } from './dto/review.dto';
import { ReservationStatusEnum } from './entities/reviewStatus.entity';

@Injectable()
export class ReviewService {
  create(createReviewDto: CreateReviewDto) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly reservationService: ReservationService,
  ) {}

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    const reservation = await this.reservationService.findOne(
      createReviewDto.reservationId,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (reservation.status !== ReservationStatusEnum.CANCELED) {
      throw new BadRequestException(
        'A review can only be created for a completed reservation.',
      );
    }
    const newReview: Review = this.reviewRepository.create(createReviewDto);
    return this.reviewRepository.save(newReview);
  }
  // async getReviewaByPorofessional(professionalId): Promise<Review[]> {
  //   return await this.reviewRepository.find({
  //     where: { professionalId: { id: professionalId } },
  //     relations: ['professional'],
  //   });
  // }
  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { reviewId: id },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }
    return review;
  }

  async update(id: string, updateReviewDto: ReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    this.reviewRepository.merge(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reviewRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }
  }
}
