import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/createService.dto';
import { UpdateServiceDto } from './dto/updateService.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Service as ServiceEntity } from './entities/service.entity';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new service',
    description: 'Creates a service bound to a Category and a Professional.',
  })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: 201, description: 'Service created', type: ServiceEntity })
  @ApiResponse({ status: 404, description: 'Category not found / Professional not found' })
  create(@Body() dto: CreateServiceDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List services',
    description: 'Returns all services with their Category and Professional relations.',
  })
  @ApiResponse({ status: 200, description: 'List of services', type: [ServiceEntity] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get service by ID',
    description: 'Retrieves a single service by its UUID, including relations.',
  })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({ status: 200, description: 'Service found', type: ServiceEntity })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update service',
    description:
      'Partially updates the service. You may change title/description, or reassign category/professional via their UUIDs.',
  })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: 200, description: 'Service updated', type: ServiceEntity })
  @ApiResponse({ status: 404, description: 'Service not found / Category not found / Professional not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete service',
    description: 'Deletes a service by ID. Returns { deleted: true } on success.',
  })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({ status: 200, description: 'Service deleted' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}