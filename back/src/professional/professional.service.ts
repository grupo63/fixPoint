import { Injectable } from '@nestjs/common';
import { ProfessionalRepository } from './professional.repository';
import { CreateProfessionalDto } from './dto/createProfessional.dto';
import { Professional } from './entity/professional.entity';
import { UpdateProfessionalDto } from './dto/updateProfessional.dto';

@Injectable()
export class ProfessionalService {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
  ) {}
  async getProfessional(page: number, limit: number, speciality: string) {
    return this.professionalRepository.getProfessional(page, limit, speciality);
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
  async updateProfessional(id: string, dto: UpdateProfessionalDto) {
    return this.professionalRepository.updateProfessional(id, dto);
  }
  async deactivateProfessional(id: string) {
    return this.professionalRepository.deactivateProfessional(id);
  }
}
