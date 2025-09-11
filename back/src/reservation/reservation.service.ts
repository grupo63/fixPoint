import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { User } from 'src/users/entities/user.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { Review } from 'src/reviews/entities/review.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,

    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async create(createDto: CreateReservationDto): Promise<Reservation> {
    const user = await this.userRepo.findOne({
      where: { id: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${createDto.userId} not found`);
    }

    const professional = await this.professionalRepo.findOne({
      where: { id: createDto.professionalId },
    });

    if (!professional) {
      throw new NotFoundException(
        `Professional with id ${createDto.professionalId} not found`,
      );
    }
    const reservation = this.reservationRepo.create({
      ...createDto,
      user,
      professional,
    });

    return await this.reservationRepo.save(reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return await this.reservationRepo.find({
      relations: ['user', 'professional'],
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { reservationId: id },
      relations: ['user', 'professional'],
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async update(
    id: string,
    updateDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (updateDto.userId) {
      const user = await this.userRepo.findOne({
        where: { id: updateDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `User with id ${updateDto.userId} not found`,
        );
      }
      reservation.user = user;
    }

    if (updateDto.professionalId) {
      const professional = await this.professionalRepo.findOne({
        where: { id: updateDto.professionalId },
      });
      if (!professional) {
        throw new NotFoundException(
          `Professional with id ${updateDto.professionalId} not found`,
        );
      }
      reservation.professional = professional;
    }
    Object.assign(reservation, updateDto);
    return await this.reservationRepo.save(reservation);
  }

  async remove(id: string): Promise<{ message: string }> {
    const reservation = await this.findOne(id);
    await this.reservationRepo.remove(reservation);
    return { message: 'Reservation delete succesfully' };
  }

  async markAsReview(reservationId: string): Promise<void> {
    const reservation = await this.findOne(reservationId);
    reservation.wasReviewed = true;
    await this.reservationRepo.save(reservation);
  }

  async createReview(dto: CreateReviewDto): Promise<Review> {
    const reservation = await this.reservationRepo.findOne({
      where: { reservationId: dto.reservationId },
      relations: ['user', 'professional'],
    });
    if (reservation?.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Only completed reservations can be reviewed',
      );
    }
    if (reservation.wasReviewed) {
      throw new BadRequestException(
        'This reservation has already been reviewed',
      );
    }
    if (reservation.user.id !== dto.userId) {
      throw new ForbiddenException('You can only review your own reservations');
    }

    const review = this.reviewRepo.create({
      ...dto,
      user: reservation.user,
      professional: reservation.professional,
      reservation,
    });

    await this.reviewRepo.save(review);
    await this.markAsReview(dto.reservationId);

    return review;
  }
}
