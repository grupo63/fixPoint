import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/createService.dto';
import { UpdateServiceDto } from './dto/updateService.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Service as ServiceEntity } from './entities/service.entity';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List services',
    description:
      'List all services or filter by professionalId/categoryId if provided.',
  })
  @ApiQuery({
    name: 'professionalId',
    required: false,
    description: 'UUID of the Professional',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'UUID of the Category',
  })
  findAll(
    @Query('professionalId') professionalId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    if (professionalId && categoryId) {
      return this.service.findByProfessionalAndCategory(
        professionalId,
        categoryId,
      );
    }
    if (professionalId) {
      return this.service.findByProfessional(professionalId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
