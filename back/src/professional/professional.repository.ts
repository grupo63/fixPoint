import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entity/professional.entity';

@Injectable()
export class ProfessionalRepository {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
  ) {}
  async getProfessional(page: number, limit: number) {
    return await this.professionalRepo.find({
      skip: (page - 1) * limit,
      take: limit,
      where: { isActive: true },
    });
  }
}
