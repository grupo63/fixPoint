import { Injectable, NotFoundException } from '@nestjs/common';
import { fileUploadRepository } from './upload-img.repository';
import { Repository } from 'typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UploadImgService {
  constructor(
    private readonly uploadImgRepository: fileUploadRepository,
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
  ) {}

  async uploadImage(file: Express.Multer.File, id: string) {
    const professional = await this.professionalRepo.findOneBy({
      id: id,
    });
    if (!professional) {
      throw new NotFoundException('product not found');
    }
    const response = await this.uploadImgRepository.uploadImage(file);
    if (!response.secure_url) {
      throw new NotFoundException('could not upload the image');
    }
    await this.professionalRepo.update(id, {
      profileImg: response.secure_url,
    });
    const updatedProduct = await this.professionalRepo.findOneBy({
      id: id,
    });

    return updatedProduct;
  }
}
