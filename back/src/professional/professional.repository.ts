import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entity/professional.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateProfessionalDto } from './dto/createProfessional.dto';
import { UpdateProfessionalDto } from './dto/updateProfessional.dto';

@Injectable()
export class ProfessionalRepository {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getProfessional(page: number, limit: number, speciality?: string) {
    const pageNum = Math.max(1, page || 1);
    const limitNum = Math.max(1, Math.min(limit || 12, 100));

    const query = this.professionalRepo
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.isActive = :isActive', { isActive: true })
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    if (speciality) {
      query.andWhere('LOWER(professional.speciality) = LOWER(:speciality)', {
        speciality: speciality.trim(),
      });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
  async getProfessionalById(id: string) {
    const professionalId = await this.professionalRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!professionalId) {
      throw new NotFoundException('professional not found');
    }

    return professionalId;
  }

  async createProfessional(
    userId: string,
    professional: CreateProfessionalDto,
  ): Promise<Professional> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['professional'],
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (user.professional) {
      throw new BadRequestException('User is already a professional');
    }
    const newProfessional = this.professionalRepo.create({
      ...professional,
      user,
    });
    return this.professionalRepo.save(newProfessional);
  }

  async updateProfessional(id: string, dto: UpdateProfessionalDto) {
    const professional = await this.professionalRepo.findOne({
      where: { id },
    });
    if (!professional) {
      throw new NotFoundException('professional not found');
    }
    Object.assign(professional, dto);
    return this.professionalRepo.save(professional);
  }
  async deactivateProfessional(id: string) {
    const professional = await this.professionalRepo.findOne({ where: { id } });

    if (!professional) {
      throw new NotFoundException(`Professional with id ${id} not found`);
    }

    professional.isActive = false;

    return this.professionalRepo.save(professional);
  }
}
