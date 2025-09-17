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
    summary: 'upload profile image',
    description:
      'Uploads a profile image for a professional identified by their ID. The image is validated, stored in Cloudinary, and the `profileImg` field of the `Professional` entity is updated.',
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
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Profile image successfully uploaded. Returns the updated professional entity.',
    schema: {
      example: {
        id: '7e6e4e3d-2b2f-4d5c-9e5f-12a2b3c4d5e6',
        name: 'John Doe',
        profileImg:
          'https://res.cloudinary.com/demo/image/upload/v1693456789/professionals/7e6e4e3d/profile.jpg',
      },
    },
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
    summary: 'upload profile image',
    description:
      'Uploads a profile image for a user identified by their ID. The image is validated, stored in Cloudinary, and the `profileImg` field of the `User` entity is updated.',
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
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Profile image successfully uploaded. Returns the updated user entity.',
    schema: {
      example: {
        id: '7e6e4e3d-2b2f-4d5c-9e5f-12a2b3c4e9g7',
        name: 'Juan Garcia',
        profileImg:
          'https://res.cloudinary.com/demo/image/upload/v1693456789/users/7e6e4e3d/profile.jpg',
      },
    },
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
    @Param('id') professionalId: string, // id del professional viene por URL
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
    schema: {
      example: [
        {
          id: 'img-1',
          imgUrl: 'https://res.cloudinary.com/.../1.jpg',
          description: 'Puerta de madera terminada',
        },
        {
          id: 'img-2',
          imgUrl: 'https://res.cloudinary.com/.../2.jpg',
          description: 'Armario restaurado',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Professional not found' })
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
