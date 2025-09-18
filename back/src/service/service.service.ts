import { Injectable } from '@nestjs/common';
import { ServiceRepository } from './service.repository';
import { CreateServiceDto } from './dto/createService.dto';
import { UpdateServiceDto } from './dto/updateService.dto';
import { Service } from './entities/service.entity';

@Injectable()
export class ServiceService {
  constructor(private readonly repository: ServiceRepository) {}

  // CRUD básico que ya tenías
  create(dto: CreateServiceDto) {
    return this.repository.createOne(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  findOne(id: string) {
    return this.repository.findOne(id);
  }

  update(id: string, dto: UpdateServiceDto) {
    return this.repository.updateOne(id, dto);
  }

  remove(id: string) {
    return this.repository.removeOne(id);
  }

  // 🔹 NUEVO: listar servicios por profesional (para el front de reservas/onboarding)
  findByProfessional(professionalId: string) {
    return this.repository.findByProfessional(professionalId);
  }

  // 🔹 NUEVO: crea evitando duplicados por (professionalId, categoryId, title)
  async createIfNotExists(dto: CreateServiceDto) {
    const existing = await this.repository.findByProfessionalCategoryTitle(
      dto.professionalId,
      dto.categoryId,
      dto.title,
    );
    if (existing) return existing;
    return this.repository.createOne(dto);
  }

  // 🔹 NUEVO: batch idempotente (para checklist de servicios en el paso 1 del onboarding)
  async createManyIdempotent(dtos: CreateServiceDto[]) {
    const out: Service[] = [];
    for (const dto of dtos) {
      const svc = await this.createIfNotExists(dto);
      out.push(svc);
    }
    return out;
  }
}
