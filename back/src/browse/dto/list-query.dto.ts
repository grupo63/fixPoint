import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Free-text search', example: 'plumber' })
  @IsString()
  @IsOptional()
  q?: string;

  // Sorting
  @ApiPropertyOptional({ example: 'price' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'ASC', enum: ['ASC', 'DESC'] })
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC';

  // Common filters
  @ApiPropertyOptional({ description: 'Filter by active state', example: true })
  @IsOptional()
  isActive?: boolean | string;

  // Service-specific filters
  @ApiPropertyOptional({ description: 'Filter by category', example: 'uuid-category' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Min price', example: 50 })
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Max price', example: 200 })
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  maxPrice?: number;
}