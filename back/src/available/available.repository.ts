import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Available } from './entity/available.entity';
import { Repository } from 'typeorm';
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
  async createA(professionalId: string, dto: CreateAvailabilityDto) {
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId },
    });
    if (!professional) {
      throw new NotFoundException('professional not found');
    }
    const available = this.availableRepo.create({
      ...dto,
      professional,
    });
    return this.availableRepo.save(available);
  }

  async findOne(id: string): Promise<Available | null> {
    return this.availableRepo.findOne({
      where: { id },
      relations: ['professional'],
    });
  }
}
