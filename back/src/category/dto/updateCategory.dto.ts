import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './createCategory.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    description: 'Indicates if category is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}