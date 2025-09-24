import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailableRepository } from './available.repository';
import { CreateAvailabilityDto } from './dto/createAvailabilty.dto';
import { Available } from './entity/available.entity';

@Injectable()
export class AvailableService {
  constructor(
    private readonly availableRepository: AvailableRepository,
  ) {}

  /**
   * Crea una disponibilidad por FECHA puntual para un profesional.
   */
  async createA(
    professionalId: string,
    dto: CreateAvailabilityDto,
  ): Promise<Available> {
    return this.availableRepository.createA(professionalId, dto);
  }

  /**
   * Recupera una disponibilidad por ID.
   */
  async findOne(id: string): Promise<Available> {
    const available = await this.availableRepository.findOne(id);
    if (!available) {
      throw new NotFoundException(`Availability with id ${id} not found`);
    }
    return available;
  }

  /**
   * Lista disponibilidades de un profesional.
   * Si se proveen `from` y/o `to` (YYYY-MM-DD), filtra por rango de fechas.
   */
  async listByProfessional(
    professionalId: string,
    from?: string,
    to?: string,
  ): Promise<Available[]> {
    return this.availableRepository.listByProfessional(professionalId, from, to);
  }

  /**
   * Borra UNA disponibilidad por ID.
   */
  async deleteOne(id: string): Promise<void> {
    const deleted = await this.availableRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`Availability with id ${id} not found`);
    }
  }

  /**
   * Borra TODAS las disponibilidades de un profesional.
   * Retorna cuántas se borraron.
   */
  async deleteAllForProfessional(professionalId: string): Promise<number> {
    return this.availableRepository.deleteAllForProfessional(professionalId);
  }
}
