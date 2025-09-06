import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service title', example: 'Pipe repair', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @ApiProperty({
    description: 'Optional service description',
    example: 'Professional repair of leaking pipes',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ description: 'Category UUID for this service', example: 'c2e6c2f1-0a1e-4baf-ae79-3b2a5d7c2a11' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Professional UUID who offers this service', example: '8a96f2f2-94f9-4a7e-9d30-6b7b5f5fbf10' })
  @IsString()
  @IsNotEmpty()
  professionalId: string;
}