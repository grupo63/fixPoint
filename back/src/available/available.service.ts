import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailableRepository } from './available.repository';
import { ProfessionalRepository } from 'src/professional/professional.repository';
import { CreateAvailabilityDto } from './dto/createAvailabilty.dto';
import { Available } from './entity/available.entity';

@Injectable()
export class AvailableService {
  constructor(
    private readonly availableRepository: AvailableRepository,
    private readonly professionalRepository: ProfessionalRepository,
  ) {}

  /**
   * Crea una disponibilidad semanal para un profesional.
   * El repositorio maneja la lógica de persistencia/validaciones.
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
   * NUEVO: Lista disponibilidades de un profesional.
   * Si se pasa `dayOfWeek`, filtra por ese día (0=Dom..6=Sáb o 1..7 según tu modelo).
   */
  async listByProfessional(
    professionalId: string,
    dayOfWeek?: number,
  ): Promise<Available[]> {
    return this.availableRepository.listByProfessional(professionalId, dayOfWeek);
  }
}
