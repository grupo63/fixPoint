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
    // 🔑 Cargamos también la relación user para sincronizar la foto del usuario
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId },
      relations: ['user'],
    });
    if (!professional) throw new NotFoundException('Professional not found');

    const response = await this.uploadImgRepository.uploadImage(
      file,
      `professionals/${professional.id}/profile`,
    );
    if (!response.secure_url) {
      throw new NotFoundException('Could not upload the image');
    }

    // Actualizamos la foto del professional
    await this.professionalRepo
      .createQueryBuilder()
      .update(Professional)
      .set({ profileImg: response.secure_url })
      .where('id = :id', { id: professional.id })
      .execute();

    // 🔑 Sincronizamos la foto del usuario asociado
    if (professional.user?.id) {
      await this.userRepo.update(professional.user.id, {
        profileImage: response.secure_url,
      });
    }

    // Devolvemos el objeto actualizado (con la nueva URL)
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

    // Actualizamos la foto del usuario
    user.profileImage = response.secure_url;
    await this.userRepo.save(user);

    // 🔑 Sincronizamos la del professional asociado (si existe)
    const prof = await this.professionalRepo.findOne({
      where: { user: { id: userId } },
    });
    if (prof) {
      await this.professionalRepo.update(prof.id, {
        profileImg: response.secure_url,
      });
    }

    // Devolvemos el user con la nueva imagen
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
