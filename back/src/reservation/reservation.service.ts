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

  /** Crear reserva (inicia en PENDING) mapeando relaciones por ID */
  async create(data: {
    userId: string;
    professionalId: string;
    serviceId?: string; // si tenés relación service, mapear similar
    date: string | Date;
  }) {
    try {
      const parsedDate =
        typeof data.date === 'string' ? new Date(data.date) : data.date;

      const reservation = this.repo.create({
        date: parsedDate,
        status: ReservationStatusEnum.PENDING,

        // FK + relación (evita desincronizaciones)
        userId: data.userId,
        user: { id: data.userId } as any,

        professionalId: data.professionalId,
        professional: { id: data.professionalId } as any,

        // Si existe relación service en tu entity:
        // service: data.serviceId ? ({ id: data.serviceId } as any) : undefined,
      });

      return await this.repo.save(reservation);
    } catch (e) {
      throw new InternalServerErrorException('No se pudo crear la reserva');
    }
  }

  /** Listar todas (incluye relaciones comunes) */
  async findAll() {
    try {
      return await this.repo.find({
        order: { date: 'ASC' },
      });
    } catch {
      throw new InternalServerErrorException(
        'No se pudieron listar las reservas',
      );
    }
  }

  /** Buscar una por ID (UUID en reservationId) */
  async findOne(id: string) {
    const r = await this.repo.findOne({
      where: { reservationId: id },
    });
    if (!r) throw new NotFoundException('Reserva no encontrada');
    return r;
  }

  /** Eliminar una */
  async remove(id: string) {
    const r = await this.findOne(id);
    await this.repo.remove(r);
    return { deleted: true };
  }

  /**
   * Helper: verifica que quien opera sea el dueño del perfil profesional
   * Acepta requesterId como userId del profesional (p.user.id) o como professionalId.
   */
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

  /** Confirmar (profesional acepta) → PENDING -> CONFIRMED */
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

  /** Cancelar (profesional rechaza) → PENDING -> CANCELLED */
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
      throw new BadRequestException(
        'Solo se pueden cancelar reservas pendientes',
      );
    }

    r.status = ReservationStatusEnum.CANCELLED;
    return this.repo.save(r);
  }

  /**
   * PENDIENTES para un profesional (por professionalId),
   * incluyendo el CLIENTE (user) con sus datos básicos para avatar/nombre.
   */
  /** PENDIENTES para un profesional (por professionalId) */
  async getPendingForProfessional(proId: string) {
    try {
      // Con eager en la entity ya trae r.user y r.professional;
      // igual dejamos relations:['user'] por claridad/compatibilidad.
      return await this.repo.find({
        where: {
          professionalId: proId,
          status: ReservationStatusEnum.PENDING,
        },
        relations: ['user'],
        order: { date: 'ASC' },
      });
    } catch {
      throw new InternalServerErrorException(
        'No se pudieron listar las pendientes del profesional',
      );
    }
  }

  /**
   * Datos básicos del cliente de una reserva (seguro):
   * Solo devuelve info si el requester es el dueño del perfil profesional de esa reserva.
   */
  async getClientForReservation(reservationId: string, requesterId: string) {
    const r = await this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.professional', 'p')
      .leftJoinAndSelect('p.user', 'pu') // dueño del perfil profesional
      .leftJoinAndSelect('r.user', 'u') // cliente
      .where('r.reservationId = :id', { id: reservationId })
      .getOne();

    if (!r) throw new NotFoundException('Reserva no encontrada');

    // valida que el requester sea el dueño de la reserva
    this.assertOwnership(r, requesterId);

    if (!(r as any).user) return null;

    const u = (r as any).user;
    // ⬇️ devolvemos más campos del perfil
    return {
      id: u.id,
      firstName: u.firstName ?? null,
      lastName: u.lastName ?? null,
      email: u.email ?? null,
      phone: u.phone ?? null,
      country: u.country ?? null,
      city: u.city ?? null,
      address: u.address ?? null,
      zipCode: u.zipCode ?? null,
      profileImage: u.profileImage ?? null,
      profileImg: u.profileImg ?? null,
    };
  }
}
