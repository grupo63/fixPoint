import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadImgRepository } from './upload-img.repository';
import { Repository } from 'typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UploadImgService {
  constructor(
    private readonly uploadImgRepository: UploadImgRepository,
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
  ) {}

  async uploadProfileImg(file: Express.Multer.File, professionalId: string) {
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId },
    });
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    const response = await this.uploadImgRepository.uploadImage(
      file,
      `professionals/${professionalId}/profile`,
    );

    if (!response.secure_url) {
      throw new NotFoundException('Could not upload the image');
    }

    professional.profileImg = response.secure_url;
    await this.professionalRepo.save(professional);

    return professional;
  }
}
