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

@Injectable()
export class ProfessionalRepository {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getProfessional(page: number, limit: number) {
    return await this.professionalRepo.find({
      skip: (page - 1) * limit,
      take: limit,
      where: { isActive: true },
    });
  }
  async getProfessionalById(id: string) {
    const professionalId = await this.professionalRepo.findOne({
      where: { id },
      // relations: {
      //   reservation: {
      //     reviews: true,
      //   },
    });
    if (!professionalId) {
      throw new NotFoundException('professional not found');
    }
    // const reviews = professionalId.reservation
    //   .map((r) => r.review)
    //   .filter(Boolean);

    // return {
    //   ...professionalId,
    //   reviews,
    // };
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
}
