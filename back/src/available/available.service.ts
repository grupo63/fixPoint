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
  async createA(professionalId: string, dto: CreateAvailabilityDto) {
    return this.availableRepository.createA(professionalId, dto);
  }

  async findOne(id: string): Promise<Available> {
    const available = await this.availableRepository.findOne(id);
    if (!available) {
      throw new NotFoundException(`Availability with id ${id} not found`);
    }
    return available;
  }
}
