import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatusEnum } from './enums/reservation-status.enum';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly repo: Repository<Reservation>,
  ) {}

  // Crear reserva (inicia en PENDING)
  async create(data: Partial<Reservation>) {
    try {
      const reservation = this.repo.create({
        ...data,
        status: ReservationStatusEnum.PENDING,
      });
      return await this.repo.save(reservation);
    } catch (e) {
      throw new InternalServerErrorException('No se pudo crear la reserva');
    }
  }

  // Listar todas (con relaciones seguras + try/catch para evitar 500 sin mensaje)
  async findAll() {
    try {
      return await this.repo.find({
        relations: ['user', 'professional', 'professional.user'],
        order: { date: 'ASC' },
      });
    } catch (e) {
      // log útil
      // console.error('findAll reservations error:', e);
      throw new InternalServerErrorException('No se pudieron listar las reservas');
    }
  }

  // Buscar una
  async findOne(id: string) {
    const r = await this.repo.findOne({
      where: { reservationId: id },
      relations: ['user', 'professional', 'professional.user'],
    });
    if (!r) throw new NotFoundException('Reserva no encontrada');
    return r;
  }

  // Eliminar
  async remove(id: string) {
    const r = await this.findOne(id);
    await this.repo.remove(r);
    return { deleted: true };
  }

  /**
   * Helper: chequea ownership aceptando 2 variantes:
   * - token trae userId del profesional (professional.user.id)
   * - token trae professionalId directamente
   */
  private assertOwnership(
    r: Reservation,
    requesterId: string,
  ) {
    const professionalUserId = r?.professional?.user?.id;
    const professionalId = r?.professional?.id;

    const matchesUser = !!professionalUserId && professionalUserId === requesterId;
    const matchesProfessional = !!professionalId && professionalId === requesterId;

    if (!matchesUser && !matchesProfessional) {
      throw new ForbiddenException('No tienes permiso para operar esta reserva');
    }
  }

  // Confirmar (profesional acepta) → PENDING -> CONFIRMED
  async confirmReservation(reservationId: string, requesterId: string) {
    if (!requesterId) throw new UnauthorizedException('No autenticado');

    const r = await this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.professional', 'p')
      .leftJoinAndSelect('p.user', 'pu')
      .leftJoinAndSelect('r.user', 'u')
      .where('r.reservationId = :id', { id: reservationId })
      .getOne();

    if (!r) throw new NotFoundException('Reserva no encontrada');

    this.assertOwnership(r, requesterId);

    if (r.status !== ReservationStatusEnum.PENDING) {
      throw new BadRequestException('La reserva no está pendiente');
    }

    r.status = ReservationStatusEnum.CONFIRMED;
    return this.repo.save(r);
  }

  // Cancelar (profesional rechaza) → PENDING -> CANCELLED
  async cancelReservationByProfessional(
    reservationId: string,
    requesterId: string,
  ) {
    if (!requesterId) throw new UnauthorizedException('No autenticado');

    const r = await this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.professional', 'p')
      .leftJoinAndSelect('p.user', 'pu')
      .leftJoinAndSelect('r.user', 'u')
      .where('r.reservationId = :id', { id: reservationId })
      .getOne();

    if (!r) throw new NotFoundException('Reserva no encontrada');

    this.assertOwnership(r, requesterId);

    if (r.status !== ReservationStatusEnum.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar reservas pendientes');
    }

    r.status = ReservationStatusEnum.CANCELLED;
    return this.repo.save(r);
  }
}
