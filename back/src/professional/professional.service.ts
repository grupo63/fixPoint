import { Injectable } from '@nestjs/common';
import { ProfessionalRepository } from './professional.repository';

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
}
