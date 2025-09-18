import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/createService.dto';
import { UpdateServiceDto } from './dto/updateService.dto';
import { Category } from '../category/entities/category.entity';
import { Professional } from '../professional/entity/professional.entity';

@Injectable()
export class ServiceRepository {
  constructor(
    @InjectRepository(Service)
    private readonly repo: Repository<Service>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(Professional)
    private readonly professionals: Repository<Professional>,
  ) {}

  // Crear uno
  async createOne(dto: CreateServiceDto) {
    const category = await this.categories.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const professional = await this.professionals.findOne({
      where: { id: dto.professionalId },
    });
    if (!professional) throw new NotFoundException('Professional not found');

    const entity = this.repo.create({
      title: dto.title,
      description: dto.description,
      category,
      categoryId: category.id, // si tu entidad expone la FK explícita
      professional,
    });
    return this.repo.save(entity);
  }

  // Listar todos
  findAll() {
    return this.repo.find({
      relations: { category: true, professional: true },
      order: { title: 'ASC' },
    });
  }

  // Obtener uno por id
  async findOne(id: string) {
    const found = await this.repo.findOne({
      where: { id },
      relations: { category: true, professional: true },
    });
    if (!found) throw new NotFoundException('Service not found');
    return found;
  }

  // Actualizar uno
  async updateOne(id: string, dto: UpdateServiceDto) {
    const service = await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categories.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
      service.category = category;
      // si tu entidad tiene columna FK explícita:
      (service as any).categoryId = category.id;
    }

    if (dto.professionalId) {
      const professional = await this.professionals.findOne({
        where: { id: dto.professionalId },
      });
      if (!professional) throw new NotFoundException('Professional not found');
      service.professional = professional;
      // si tu entidad tiene columna FK explícita:
      // (service as any).professionalId = professional.id;
    }

    if (dto.title !== undefined) service.title = dto.title;
    if (dto.description !== undefined) service.description = dto.description;

    return this.repo.save(service);
  }

  // Eliminar uno
  async removeOne(id: string) {
    const service = await this.findOne(id);
    await this.repo.remove(service);
    return { deleted: true };
  }

  // 🔹 NUEVO: listar servicios por profesional (para onboarding y reservas)
  findByProfessional(professionalId: string) {
    return this.repo.find({
      where: { professional: { id: professionalId } },
      relations: { category: true, professional: true },
      order: { title: 'ASC' },
    });
  }

  // 🔹 NUEVO: buscar por (professional, category, title) → evitar duplicados
  findByProfessionalCategoryTitle(
    professionalId: string,
    categoryId: string,
    title: string,
  ) {
    return this.repo.findOne({
      where: {
        professional: { id: professionalId },
        category: { id: categoryId },
        title,
      },
      relations: { category: true, professional: true },
    });
  }

  // (Opcional) 🔹 listar por profesional + categoría
  findByProfessionalAndCategory(professionalId: string, categoryId: string) {
    return this.repo.find({
      where: {
        professional: { id: professionalId },
        category: { id: categoryId },
      },
      relations: { category: true, professional: true },
      order: { title: 'ASC' },
    });
  }
}
