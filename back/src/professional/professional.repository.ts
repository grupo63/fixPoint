import { Injectable, NotFoundException } from '@nestjs/common';
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
  async getProfessionalById(id: string) {
    const professionalId = await this.professionalRepo.findOne({
      where: { id },
      relations: {
        reservation: {
          reviews: true,
        },
        professionalImg: true,
        service: true,
      },
    });
    if (!professionalId) {
      throw new NotFoundException('professional not found');
    }
    const reviews = professionalId.reservation
      .map((r) => r.review)
      .filter(Boolean);

    return {
      ...professionalId,
      reviews,
    };
  }
}
