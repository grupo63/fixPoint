import { Injectable } from '@nestjs/common';
import { ServiceRepository } from './service.repository';
import { CreateServiceDto } from './dto/createService.dto';
import { UpdateServiceDto } from './dto/updateService.dto';
import { Service } from './entities/service.entity';

@Injectable()
export class ServiceService {
  constructor(private readonly repository: ServiceRepository) {}

  // Crear
  create(dto: CreateServiceDto) {
    return this.repository.createOne(dto);
  }

  // Listar todos
  findAll() {
    return this.repository.findAll();
  }

  // Buscar uno
  findOne(id: string) {
    return this.repository.findOne(id);
  }

  // Actualizar
  update(id: string, dto: UpdateServiceDto) {
    return this.repository.updateOne(id, dto);
  }

  // Eliminar
  remove(id: string) {
    return this.repository.removeOne(id);
  }

  // Listar por profesional
  findByProfessional(professionalId: string) {
    return this.repository.findByProfessional(professionalId);
  }

  // Listar por profesional + categoría
  findByProfessionalAndCategory(professionalId: string, categoryId: string) {
    return this.repository.findByProfessionalAndCategory(
      professionalId,
      categoryId,
    );
  }

  // Crear evitando duplicados
  async createIfNotExists(dto: CreateServiceDto) {
    const existing = await this.repository.findByProfessionalCategoryTitle(
      dto.professionalId,
      dto.categoryId,
      dto.title,
    );
    if (existing) return existing;
    return this.repository.createOne(dto);
  }

  // Crear muchos idempotente
  async createManyIdempotent(dtos: CreateServiceDto[]) {
    const out: Service[] = [];
    for (const dto of dtos) {
      const svc = await this.createIfNotExists(dto);
      out.push(svc);
    }
    return out;
  }
}
