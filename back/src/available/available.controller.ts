import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AvailableService } from './available.service';
import { CreateAvailabilityDto } from './dto/createAvailabilty.dto';
import { Available } from './entity/available.entity';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('available')
@Controller('available')
export class AvailableController {
  constructor(private readonly availableService: AvailableService) {}

  @Post(':professionalId')
  @ApiOperation({ summary: 'Create professional availability (by date)' })
  @ApiBody({ type: CreateAvailabilityDto })
  @ApiResponse({
    status: 201,
    description: 'Availability created successfully',
    type: Available,
  })
  @ApiResponse({
    status: 404,
    description: 'Professional was not found',
  })
  createA(
    @Param('professionalId', new ParseUUIDPipe()) professionalId: string,
    @Body() dto: CreateAvailabilityDto,
  ): Promise<Available> {
    return this.availableService.createA(professionalId, dto);
  }

  // ⚠️ Importante: esta ruta va ANTES de ":id" para evitar conflictos
  @Get('professional/:professionalId')
  @ApiOperation({ summary: 'List professional availability (by date range)' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    description: 'End date filter (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability list',
    type: [Available],
  })
  listByProfessional(
    @Param('professionalId', new ParseUUIDPipe()) professionalId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<Available[]> {
    return this.availableService.listByProfessional(professionalId, from, to);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve availability by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Availability found',
    type: Available,
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Available> {
    return this.availableService.findOne(id);
  }

  // Eliminar TODAS las disponibilidades de un profesional
  @Delete('professional/:professionalId')
  @ApiOperation({ summary: 'Delete all availability for a professional' })
  @ApiResponse({
    status: 200,
    description: 'All availability deleted',
  })
  async removeAllForProfessional(
    @Param('professionalId', new ParseUUIDPipe()) professionalId: string,
  ): Promise<{ deleted: number }> {
    const deleted = await this.availableService.deleteAllForProfessional(professionalId);
    return { deleted };
  }

  // Eliminar UNA disponibilidad por ID
  @Delete(':id')
  @ApiOperation({ summary: 'Delete availability by ID' })
  @ApiResponse({
    status: 200,
    description: 'Availability deleted',
  })
  async removeOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: number }> {
    await this.availableService.deleteOne(id);
    return { deleted: 1 };
  }
}
