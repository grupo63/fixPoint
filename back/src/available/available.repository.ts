import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Available } from './entity/available.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { CreateAvailabilityDto } from './dto/createAvailabilty.dto';

@Injectable()
export class AvailableRepository {
  constructor(
    @InjectRepository(Available)
    private readonly availableRepo: Repository<Available>,
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
  ) {}

  /**
   * Crea una disponibilidad POR FECHA PUNTUAL.
   * Bloquea duplicados por (professionalId, date, startTime, endTime).
   * Bloquea solapes dentro de la MISMA fecha.
   * Lanza 409 (Conflict) si ya existe o se solapa.
   */
  async createA(professionalId: string, dto: CreateAvailabilityDto): Promise<Available> {
    const professional = await this.professionalRepo.findOne({ where: { id: professionalId } });
    if (!professional) throw new NotFoundException('professional not found');

    const { date, startTime, endTime } = dto;

    // 1) Validación básica de rango horario
    if (!startTime || !endTime) {
      throw new BadRequestException('startTime y endTime son requeridos');
    }
    if (startTime >= endTime) {
      throw new BadRequestException('startTime debe ser menor a endTime');
    }

    // 2) Duplicado exacto (mismo pro + date + start + end)
    const already = await this.availableRepo.findOne({
      where: {
        professionalId,
        date,
        startTime,
        endTime,
      },
      select: { id: true },
    });
    if (already) {
      throw new ConflictException('Ya existe una disponibilidad para esa fecha y horario');
    }

    // 3) Solape dentro de la misma fecha:
    //    Solapa si: (new.start < existing.end) && (new.end > existing.start)
    const overlap = await this.availableRepo
      .createQueryBuilder('a')
      .where('a."professionalId" = :professionalId', { professionalId })
      .andWhere('a."date" = :date', { date })
      .andWhere('a."startTime" < :endTime', { endTime })
      .andWhere('a."endTime" > :startTime', { startTime })
      .getOne();

    if (overlap) {
      throw new ConflictException(
        `El rango ${startTime}-${endTime} se solapa con ${overlap.startTime}-${overlap.endTime} para la fecha ${date}.`,
      );
    }

    // 4) Crear
    const available = this.availableRepo.create({
      professionalId,
      date,
      startTime,
      endTime,
      status: 'Available',
    });
    return this.availableRepo.save(available);
  }

  async findOne(id: string): Promise<Available | null> {
    return this.availableRepo.findOne({ where: { id }, relations: ['professional'] });
  }

  /**
   * Lista disponibilidades de un profesional.
   * Si se pasan `from` y/o `to` (YYYY-MM-DD), filtra por rango de fechas.
   */
  async listByProfessional(
    professionalId: string,
    from?: string,
    to?: string,
  ): Promise<Available[]> {
    const where: any = { professionalId };

    if (from && to) {
      where.date = Between(from, to);
    } else if (from) {
      where.date = Between(from, '9999-12-31');
    } else if (to) {
      where.date = Between('0001-01-01', to);
    }

    return this.availableRepo.find({
      where,
      order: { date: 'ASC', startTime: 'ASC' },
      // relations: ['professional'],
    });
  }

  /**
   * Borra una disponibilidad por ID.
   * Devuelve true si se borró, false si no existía.
   */
  async deleteOne(id: string): Promise<boolean> {
    const result = await this.availableRepo.delete(id);
    return !!result.affected && result.affected > 0;
  }

  /**
   * Borra TODAS las disponibilidades de un profesional.
   * Retorna cuántas filas fueron borradas.
   */
  async deleteAllForProfessional(professionalId: string): Promise<number> {
    const result = await this.availableRepo
      .createQueryBuilder()
      .delete()
      .from(Available)
      .where('"professionalId" = :professionalId', { professionalId })
      .execute();

    return result.affected ?? 0;
  }
}
