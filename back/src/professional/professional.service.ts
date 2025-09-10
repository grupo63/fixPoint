import { Injectable } from '@nestjs/common';
import { ProfessionalRepository } from './professional.repository';
import { UpdateProfessionalDto } from './dto/updateProfessional.dto';

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

  async updateProfessional(id: string, dto: UpdateProfessionalDto) {
    return this.professionalRepository.updateProfessional(id, dto);
  }
  async deactivateProfessional(id: string) {
    return this.professionalRepository.deactivateProfessional(id);
  }
}
