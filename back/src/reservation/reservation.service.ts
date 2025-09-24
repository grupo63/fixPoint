import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  LessThan,
  MoreThan,
} from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatusEnum } from './enums/reservation-status.enum';
import { Available } from 'src/available/entity/available.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { NotificationsService } from 'src/notifications/notification.service';
import { User } from 'src/users/entities/user.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';

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

    private readonly notificationsService: NotificationsService,
  ) {}

  /** Crear reserva */
  async create(createDto: CreateReservationDto): Promise<Reservation> {
    const reservationDate = new Date(createDto.date);
    if (reservationDate < new Date()) {
      throw new BadRequestException('Reservation date must be in the future');
    }

    const time = reservationDate.toTimeString().slice(0, 5);
    const dayOfWeek = reservationDate.getDay();

    const slot = await this.availableRepo.findOne({
      where: {
        professional: { id: createDto.professionalId },
        // dayOfWeek,
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
      relations: ['user'],
    });
    if (!professional) {
      throw new NotFoundException(
        `Professional with id ${createDto.professionalId} not found`,
      );
    }
    if (!professional.user) {
      throw new BadRequestException('Professional has no linked user');
    }

    const duration = 60; // minutos
    const endDate = new Date(reservationDate.getTime() + duration * 60000);

    // verificar solapamientos
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
      endDate,
      user,
      professional,
      status: ReservationStatusEnum.PENDING,
    });

    const savedReservation = await this.reservationRepo.save(reservation);

    // bloquear el slot
    slot.status = 'Not Available';
    await this.availableRepo.save(slot);

    // notificación
    await this.notificationsService.sendReservationNotification({
      userEmail: user.email,
      userName: user.firstName ?? 'User',
      professionalName: professional.user.firstName ?? 'Professional',
      date: reservationDate.toLocaleDateString('es-CO'),
      hourStart: reservationDate.toTimeString().slice(0, 5),
      hourEnd: endDate.toTimeString().slice(0, 5),
    });

    return savedReservation;
  }

  async findAll(): Promise<Reservation[]> {
    return await this.reservationRepo.find({
      relations: ['user', 'professional'],
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { reservationId: id },
      relations: ['user', 'professional'],
    });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    return reservation;
  }

  async getPendingForProfessional(
    professionalId: string,
  ): Promise<Reservation[]> {
    return await this.reservationRepo.find({
      where: {
        professional: { id: professionalId },
        status: ReservationStatusEnum.PENDING,
      },
      relations: ['user', 'professional'],
      order: { date: 'ASC' },
    });
  }
  /** Eliminar una */
  async remove(id: string) {
    const reservation = await this.findOne(id);
    await this.reservationRepo.remove(reservation);
    return { deleted: true };
  }

  async getClientForReservation(
    reservationId: string,
    requesterId: string,
  ): Promise<User> {
    const reservation = await this.reservationRepo.findOne({
      where: { reservationId },
      relations: ['user'],
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.user.id !== requesterId) {
      throw new ForbiddenException('No tienes acceso a esta reserva');
    }
    return reservation.user;
  }

  /** Confirmar (profesional acepta) → PENDING -> CONFIRMED */
  async confirmReservation(reservationId: string, requesterId: string) {
    if (!requesterId) throw new UnauthorizedException('No autenticado');

    const r = await this.reservationRepo.findOne({
      where: { reservationId },
      relations: ['professional', 'professional.user', 'user'],
    });

    if (!r) throw new NotFoundException('Reserva no encontrada');
    this.assertOwnership(r, requesterId);

    if (r.status !== ReservationStatusEnum.PENDING) {
      throw new BadRequestException('La reserva no está pendiente');
    }

    r.status = ReservationStatusEnum.CONFIRMED;
    return this.reservationRepo.save(r);
  }

  async cancelReservationByProfessional(
    reservationId: string,
    requesterId: string,
  ) {
    if (!requesterId) throw new UnauthorizedException('No autenticado');

    const r = await this.reservationRepo.findOne({
      where: { reservationId },
      relations: ['professional', 'professional.user', 'user'],
    });

    if (!r) throw new NotFoundException('Reserva no encontrada');
    this.assertOwnership(r, requesterId);

    if (r.status !== ReservationStatusEnum.PENDING) {
      throw new BadRequestException(
        'Solo se pueden cancelar reservas pendientes',
      );
    }

    r.status = ReservationStatusEnum.CANCELLED;
    return this.reservationRepo.save(r);
  }

  /** Helper de permisos */
  private assertOwnership(r: Reservation, requesterId: string) {
    const professionalUserId = (r as any)?.professional?.user?.id;
    const professionalId = (r as any)?.professional?.id;

    const matchesUser =
      !!professionalUserId && professionalUserId === requesterId;
    const matchesProfessional =
      !!professionalId && professionalId === requesterId;

    if (!matchesUser && !matchesProfessional) {
      throw new ForbiddenException(
        'No tienes permiso para operar esta reserva',
      );
    }
  }
}
