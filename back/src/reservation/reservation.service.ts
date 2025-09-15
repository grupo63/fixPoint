import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { ReservationStatusEnum } from './enums/reservation-status.enum';
import { Available } from 'src/available/entity/available.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { Service } from 'src/service/entities/service.entity';

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

    @InjectRepository(Available)
    private readonly availableRepo: Repository<Available>,
  ) {}

  async create(createDto: CreateReservationDto): Promise<Reservation> {
    const reservationDate = new Date(createDto.date);
    if (reservationDate < new Date()) {
      throw new BadRequestException('Reservation date must be in the future');
    }

    const time = reservationDate.toTimeString().slice(0, 5);
    const dayOfWeek = reservationDate.getDay(); // 0 (Sunday) a 6 (Saturday)
    const slot = await this.availableRepo.findOne({
      where: {
        professional: { id: createDto.professionalId },
        dayOfWeek,
        startTime: LessThanOrEqual(time),
        endTime: MoreThanOrEqual(time),
        status: 'Available',
      },
    });
    if (!slot) {
      throw new BadRequestException(
        'The professional is not available at that time',
      );
    }

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

    const duration = 60;
    const endDate = new Date(reservationDate.getTime() + duration * 60000);
    const resOverlapping = await this.reservationRepo.find({
      where: {
        professional: { id: createDto.professionalId },
        status: ReservationStatusEnum.CONFIRMED,
        date: LessThan(endDate),
        endDate: MoreThan(reservationDate),
      },
    });
    if (resOverlapping.length > 0) {
      throw new BadRequestException(
        'There is already a reservation at that time.',
      );
    }
    const reservation = this.reservationRepo.create({
      ...createDto,
      date: reservationDate,
      user,
      professional,
    });

    const savedReservation = await this.reservationRepo.save(reservation);

    slot.status = 'Not Available';
    await this.availableRepo.save(slot);

    return savedReservation;
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
      if (!user) throw new NotFoundException('User not found');
      reservation.user = user;
    }
    if (updateDto.professionalId) {
      const professional = await this.professionalRepo.findOne({
        where: { id: updateDto.professionalId },
      });
      if (!professional) throw new NotFoundException('Professional not found');
      reservation.professional = professional;
    }
    if (updateDto.date && new Date(updateDto.date) < new Date()) {
      throw new BadRequestException('Reservation date must be in the future');
    }

    Object.assign(reservation, updateDto);
    return await this.reservationRepo.save(reservation);
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.reservationRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Reservation not found');
    }
    return { message: 'Reservation deleted succesfully' };
  }

  async markAsReviewed(reservationId: string): Promise<void> {
    const reservation = await this.findOne(reservationId);
    reservation.wasReviewed = true;
    await this.reservationRepo.save(reservation);
  }

  async createReview(dto: CreateReviewDto): Promise<Review> {
    const reservation = await this.reservationRepo.findOne({
      where: { reservationId: dto.reservationId },
      relations: ['user', 'professional'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatusEnum.COMPLETED) {
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
      rate: dto.rate,
      commentary: dto.commentary,
      date: new Date(),
      user: reservation.user,
      professional: reservation.professional,
      reservation,
    });

    await this.reviewRepo.save(review);
    await this.markAsReviewed(dto.reservationId);

    return review;
  }
}
