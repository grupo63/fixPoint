import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entity/professional.entity';
import { CreateProfessionalDto } from './dto/createProfessional.dto';
import { UpdateProfessionalDto } from './dto/updateProfessional.dto';

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
  ) {}

  /**
   * Listado paginado de profesionales
   */
  async getProfessional(
    page: number,
    limit: number,
    speciality?: string,
  ): Promise<{ data: Professional[]; total: number; page: number; limit: number }> {
    const qb = this.professionalRepo.createQueryBuilder('p').leftJoinAndSelect('p.user', 'user');

    if (speciality) {
      qb.where('p.speciality ILIKE :spec', { spec: `%${speciality}%` });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Buscar professional por su id
   */
  async getProfessionalById(id: string): Promise<Professional> {
    const pro = await this.professionalRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!pro) {
      throw new NotFoundException(`Professional with id ${id} not found`);
    }
    return pro;
  }

  /**
   * Buscar professional por userId
   */
  async getProfessionalByUserId(userId: string): Promise<Professional> {
    const pro = await this.professionalRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!pro) {
      throw new NotFoundException(`Professional with userId ${userId} not found`);
    }
    return pro;
  }

  /**
   * Crear un nuevo professional vinculado a un user
   */
  async createProfessional(
    userId: string,
    dto: CreateProfessionalDto,
  ): Promise<Professional> {
    const professional = this.professionalRepo.create({
      ...dto,
      user: { id: userId } as any, // vinculamos al user por su id
    });
    return this.professionalRepo.save(professional);
  }

  /**
   * Actualizar un professional existente
   */
  async updateProfessional(
    id: string,
    dto: UpdateProfessionalDto,
  ): Promise<Professional> {
    const pro = await this.getProfessionalById(id);
    Object.assign(pro, dto);
    return this.professionalRepo.save(pro);
  }

  /**
   * Desactivar un professional
   */
  async deactivateProfessional(id: string): Promise<Professional> {
    const pro = await this.getProfessionalById(id);
    pro.isActive = false;
    return this.professionalRepo.save(pro);
  }
}
