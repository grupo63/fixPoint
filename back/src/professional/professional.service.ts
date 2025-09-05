import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfessionalService {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
  ) {}
  async getProfessional(page: number, limit: number) {
    return this.professionalRepository.getProfessional(page, limit);
  }
}
