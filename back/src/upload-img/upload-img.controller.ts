import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadImgService } from './upload-img.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('upload-img')
@ApiTags('Upload')
export class UploadImgController {
  constructor(
    private readonly uploadImgService: UploadImgService,
    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
  ) {}

  @Put(':id/profile-image')
  @ApiOperation({
    summary: 'Upload professional profile image',
    description:
      'Uploads a profile image for a professional identified by their ID. Image is stored (Cloudinary) and professional.profileImg is updated (service también sincroniza users.profileImage).',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the professional',
    example: '7e6e4e3d-2b2f-4d5c-9e5f-12a2b3c4d5e6',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload profile image',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Profile image successfully uploaded. Returns the updated professional entity.',
  })
  @ApiResponse({ status: 404, description: 'Professional not found' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImg(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 200 * 1024,
            message: 'file size can not exceed 200kb',
          }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadImgService.uploadProfileImg(file, id);
  }

  @Put('users/:id/profile-image')
  @ApiOperation({
    summary: 'Upload user profile image',
    description:
      'Uploads a profile image for a user identified by their ID. Image is stored and users.profileImage is updated (service también sincroniza professional.profileImg si existe).',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the user',
    example: '7e6e4e3d-2b2f-4d5c-9e5f-12a2b3c4r3j8',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload profile image',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile image successfully uploaded. Returns the updated user entity.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserProfileImg(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 200 * 1024,
            message: 'file size can not exceed 200kb',
          }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadImgService.uploadUserProfileImg(file, id);
  }

  @Put('professional/:id/workImg')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a work image for a professional',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        description: { type: 'string', nullable: true },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async workImg(
    @Param('id') professionalId: string,
    @Body('description') description: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 200 * 1024 }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadImgService.workImg(file, professionalId, description);
  }

  @Get('professional/:id/workImg')
  @ApiOperation({ summary: 'Get work images of a professional' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the professional',
    example: '04a4fc16-2676-401c-8cf4-f9f3864c6afb',
  })
  @ApiResponse({
    status: 200,
    description: 'List of work images',
  })
  async getWorkImages(@Param('id') professionalId: string) {
    const professional = await this.professionalRepo.findOne({
      where: { id: professionalId },
      relations: ['workImg'],
    });

    if (!professional) throw new NotFoundException('Professional not found');

    return professional.workImg.map((w) => ({
      id: w.id,
      imgUrl: w.imgUrl,
      description: w.description,
    }));
  }
}
