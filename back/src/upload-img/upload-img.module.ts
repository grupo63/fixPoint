import { Module } from '@nestjs/common';
import { UploadImgController } from './upload-img.controller';
import { UploadImgService } from './upload-img.service';
import { UploadImgRepository } from './upload-img.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { User } from 'src/users/entities/user.entity';
import { CloudinaryConfig } from 'src/config/cloudinary';

@Module({
  imports: [TypeOrmModule.forFeature([Professional, User])], // 👈 necesario para @InjectRepository
  controllers: [UploadImgController],
  providers: [UploadImgService, UploadImgRepository, CloudinaryConfig],
})
export class UploadImgModule {}
