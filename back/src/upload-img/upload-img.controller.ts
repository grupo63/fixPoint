import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadImgService } from './upload-img.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('upload-img')
@ApiTags('Upload')
export class UploadImgController {
  constructor(private readonly uploadImgService: UploadImgService) {}

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
}
