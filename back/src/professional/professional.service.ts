import { Injectable } from '@nestjs/common';
import { ProfessionalRepository } from './professional.repository';
import { CreateProfessionalDto } from './dto/createProfessional.dto';

@Injectable()
export class ProfessionalService {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
  ) {}
  async getProfessional(page: number, limit: number) {
    return this.professionalRepository.getProfessional(page, limit);
  }

  async getProfessionalById(id: string) {
    return this.professionalRepository.getProfessionalById(id);
  }

  async createProfessional(
    userId: string,
    professional: CreateProfessionalDto,
  ) {
    return this.professionalRepository.createProfessional(userId, professional);
  }
}
