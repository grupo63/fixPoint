// upload-img.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UploadImgRepository } from './upload-img.repository';
import { Repository } from 'typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ProfessionalWork } from './entity/uploadImg.entity';

@Injectable()
export class UploadImgService {
  constructor(
    private readonly uploadImgRepository: UploadImgRepository,
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ProfessionalWork)
    private readonly professionalWorkRepo: Repository<ProfessionalWork>,
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

    // Reemplazamos professional.profileImg = ... + save() por queryBuilder
    await this.professionalRepo
      .createQueryBuilder()
      .update(Professional)
      .set({ profileImg: response.secure_url })
      .where('id = :id', { id: professional.id })
      .execute();

    // Opcional: devolver el objeto actualizado
    return { ...professional, profileImg: response.secure_url };
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

  async workImg(
    file: Express.Multer.File,
    professionalId: string,
    description?: string,
  ) {
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId },
      relations: ['workImg'],
    });

    if (!professional) throw new NotFoundException('Professional not found');

    if (professional.workImg.length >= 3) {
      throw new BadRequestException('Max 3 work images allowed');
    }

    // Subir a Cloudinary
    const response = await this.uploadImgRepository.uploadImage(
      file,
      `professionals/${professional.id}/work`,
    );

    if (!response.secure_url) {
      throw new BadRequestException('Could not upload the image');
    }

    // Crear nuevo ProfessionalWork
    const workImage = this.professionalWorkRepo.create({
      imgUrl: response.secure_url,
      description: description || '',
      professional,
    });

    await this.professionalWorkRepo.save(workImage);

    // Devolver la imagen primero y luego el profesional
    return {
      id: workImage.id,
      imgUrl: workImage.imgUrl,
      description: workImage.description,
      professional: {
        id: professional.id,
        speciality: professional.speciality,
        aboutMe: professional.aboutMe,
        profileImg: professional.profileImg,
        workingRadius: professional.workingRadius,
        location: professional.location,
        createdAt: professional.createdAt,
        isActive: professional.isActive,
      },
    };
  }
}
