// upload-img.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadImgRepository } from './upload-img.repository';
import { Repository } from 'typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UploadImgService {
  constructor(
    private readonly uploadImgRepository: UploadImgRepository,
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async uploadProfileImg(file: Express.Multer.File, professionalId: string) {
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId },
    });
    if (!professional) throw new NotFoundException('Professional not found');

    const response = await this.uploadImgRepository.uploadImage(
      file,
      `professionals/${professional.id}/profile`,
    );
    if (!response.secure_url) {
      throw new NotFoundException('Could not upload the image');
    }

    professional.profileImg = response.secure_url;
    await this.professionalRepo.save(professional);
    return professional;
  }

  async uploadUserProfileImg(file: Express.Multer.File, userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const response = await this.uploadImgRepository.uploadUserImage(
      file,
      `users/${userId}/profile`,
    );
    if (!response.secure_url)
      throw new NotFoundException('Could not upload the image');

    user.profileImage = response.secure_url;
    await this.userRepo.save(user);

    return user;
  }
}
