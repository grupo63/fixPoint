import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './createService.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiPropertyOptional({ description: 'Optional new title', example: 'Emergency pipe repair' })
  title?: string;

  @ApiPropertyOptional({ description: 'Optional new description', example: '24/7 emergency repair service' })
  description?: string;
}