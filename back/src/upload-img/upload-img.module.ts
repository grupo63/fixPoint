import { Module } from '@nestjs/common';
import { UploadImgController } from './upload-img.controller';
import { UploadImgService } from './upload-img.service';
import { UploadImgRepository } from './upload-img.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from 'src/professional/entity/professional.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professional]), // 👈 necesario para @InjectRepository
  ],
  controllers: [UploadImgController],
  providers: [UploadImgService, UploadImgRepository],
})
export class UploadImgModule {}
